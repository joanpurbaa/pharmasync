import { NextRequest, NextResponse } from "next/server";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { redis } from "@/lib/redis";

const ai = new Cerebras({
	apiKey: process.env.CEREBRAS_API_KEY,
});

const MODEL = "gpt-oss-120b";

const ALLOWED_CHAT_IDS = (process.env.TELEGRAM_ALLOWED_IDS ?? "")
	.split(",")
	.map((id) => id.trim());

const HISTORY_TTL_SECONDS = 60 * 30;

const MAX_HISTORY_MESSAGES = 6;

type ChatMessage = {
	role: "system" | "user" | "assistant" | "tool";
	content: string | null;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: { name: string; arguments: string };
	}>;
	tool_call_id?: string;
};

function historyKey(chatId: number) {
	return `pharmasync:telegram:history:${chatId}`;
}

async function loadHistory(chatId: number): Promise<ChatMessage[]> {
	const stored = await redis.get<ChatMessage[]>(historyKey(chatId));
	return stored ?? [];
}

async function saveHistory(chatId: number, history: ChatMessage[]) {
	const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
	await redis.set(historyKey(chatId), trimmed, { ex: HISTORY_TTL_SECONDS });
}

async function clearHistory(chatId: number) {
	await redis.del(historyKey(chatId));
}

type ToolDefinition = {
	type: "function";
	function: {
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	};
};

const tools: ToolDefinition[] = [
	{
		type: "function",
		function: {
			name: "get_stok_barang",
			description:
				"Ambil daftar item obat/alat medis beserta stok dan status saat ini.",
			parameters: {
				type: "object",
				properties: {
					search: {
						type: "string",
						description: "Cari nama obat atau SKU (opsional)",
					},
					status: {
						type: "string",
						enum: ["AMAN", "MENIPIS", "KRITIS", "PENDING"],
					},
				},
			},
		},
	},
	{
		type: "function",
		function: {
			name: "get_mitra_list",
			description:
				"Cari daftar klinik/mitra untuk mendapatkan destinationId tujuan pengiriman.",
			parameters: {
				type: "object",
				properties: { search: { type: "string", description: "Nama klinik" } },
			},
		},
	},
	{
		type: "function",
		function: {
			name: "create_shipment",
			description:
				"Buat pengiriman baru ke klinik mitra. WAJIB konfirmasi ulang detail (nama barang, jumlah, tujuan) ke user sebelum memanggil tool ini.",
			parameters: {
				type: "object",
				properties: {
					itemId: { type: "string", description: "ID barang / obat" },
					quantity: { type: "number", description: "Jumlah stok yang dikirim" },
					destinationId: { type: "string", description: "ID klinik mitra tujuan" },
					scheduledAt: {
						type: "string",
						description: "Waktu pengiriman dalam format ISO datetime string",
					},
				},
				required: ["itemId", "quantity", "destinationId", "scheduledAt"],
			},
		},
	},
];

async function callInternalApi(path: string, init?: RequestInit) {
	const base = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:3000";
	try {
		const res = await fetch(`${base}${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				"x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
				...(init?.headers ?? {}),
			},
		});

		const text = await res.text();

		if (!res.ok) {
			console.error(
				`callInternalApi ${path} gagal (${res.status}):`,
				text.slice(0, 200),
			);
			return { error: `Internal API ${path} mengembalikan status ${res.status}` };
		}

		try {
			return JSON.parse(text);
		} catch {
			console.error(`callInternalApi ${path} bukan JSON:`, text.slice(0, 200));
			return { error: `Respons dari ${path} bukan format JSON yang valid` };
		}
	} catch (err) {
		console.error("Gagal callInternalApi:", err);
		return { error: "Failed to fetch internal API data" };
	}
}

async function executeTool(name: string, args: any) {
	switch (name) {
		case "get_stok_barang": {
			const params = new URLSearchParams();
			if (args.search) params.set("search", args.search);
			if (args.status) params.set("status", args.status);
			return callInternalApi(`/api/items?${params.toString()}`);
		}
		case "get_mitra_list": {
			const params = new URLSearchParams();
			if (args.search) params.set("search", args.search);
			return callInternalApi(`/api/destinations?${params.toString()}`);
		}
		case "create_shipment": {
			return callInternalApi(`/api/distribusi`, {
				method: "POST",
				body: JSON.stringify(args),
			});
		}
		default:
			return { error: "Unknown tool" };
	}
}

async function sendTelegramMessage(chatId: number, text: string) {
	try {
		await fetch(
			`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
			},
		);
	} catch (err) {
		console.error("Gagal kirim pesan ke Telegram API:", err);
	}
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createCompletion(messages: ChatMessage[]) {
	const response = await ai.chat.completions.create({
		model: MODEL,
		messages,
		tools,
		tool_choice: "auto",
		temperature: 0.2,

		max_tokens: 1024,
	} as any);
	return response as any;
}

async function createCompletionWithRetry(messages: ChatMessage[]) {
	try {
		return await createCompletion(messages);
	} catch (err: any) {
		if (err?.status === 429) {
			await wait(2000);
			return await createCompletion(messages);
		}
		throw err;
	}
}

export async function POST(req: NextRequest) {
	let chatId: number | null = null;

	try {
		const body = await req.json();

		const message = body?.message || body?.edited_message;

		if (!message || !message.text) {
			return NextResponse.json({ ok: true });
		}

		chatId = message.chat.id;
		const userText = message.text as string;

		if (!ALLOWED_CHAT_IDS.includes(String(chatId))) {
			await sendTelegramMessage(
				chatId!,
				"⚠️ Maaf, kamu tidak punya akses untuk mengontrol dashboard Pharmasync.",
			);
			return NextResponse.json({ ok: true });
		}

		if (userText.trim() === "/reset" || userText.trim() === "/start") {
			await clearHistory(chatId!);
			await sendTelegramMessage(
				chatId!,
				"🔄 Percakapan sudah direset. Ada yang bisa saya bantu terkait stok, mitra, atau pengiriman?",
			);
			return NextResponse.json({ ok: true });
		}

		const previousHistory = await loadHistory(chatId!);

		const messages: ChatMessage[] = [
			{
				role: "system",
				content:
					"Kamu adalah asisten AI terintegrasi untuk kontrol dashboard manajemen farmasi Pharmasync. Tugasmu membantu user mengecek stok barang, melihat daftar mitra, dan mengatur pengiriman (shipment) via database. Apabila user ingin membuat pengiriman, kamu WAJIB mencari itemId dan destinationId terlebih dahulu via tools yang tersedia jika belum ada di konteks. SELALU konfirmasi ulang detail item dan jumlah secara eksplisit kepada user sebelum mengeksekusi tool 'create_shipment'. Gunakan riwayat percakapan sebelumnya sebagai konteks apabila relevan, misalnya saat user membalas 'lanjutkan' atau 'ya' terhadap konfirmasi yang kamu berikan sebelumnya. Jawablah dalam Bahasa Indonesia yang singkat, profesional, dan informatif.",
			},
			...previousHistory,
			{ role: "user", content: userText },
		];

		let finalText = "";
		let rateLimited = false;
		let paymentRequired = false;

		for (let i = 0; i < 5; i++) {
			let completion;
			try {
				completion = await createCompletionWithRetry(messages);
			} catch (err: any) {
				if (err?.status === 429) {
					rateLimited = true;
					break;
				}
				if (err?.status === 402) {
					paymentRequired = true;
					break;
				}
				throw err;
			}

			const choice = completion.choices[0];
			const msg = choice.message;

			if (!msg.tool_calls || msg.tool_calls.length === 0) {
				finalText = msg.content ?? "";
				messages.push(msg);
				break;
			}

			messages.push(msg);

			for (const call of msg.tool_calls) {
				if (call.type === "function") {
					const args = JSON.parse(call.function.arguments || "{}");
					const result = await executeTool(call.function.name, args);

					messages.push({
						role: "tool",
						tool_call_id: call.id,
						content: JSON.stringify(result),
					});
				}
			}
		}

		if (rateLimited) {
			await sendTelegramMessage(
				chatId!,
				"⏳ AI-nya lagi kebanyakan request saat ini (rate limit). Coba kirim pesan kamu lagi dalam 15-30 detik ya.",
			);
			return NextResponse.json({ ok: true });
		}

		if (paymentRequired) {
			console.error(
				"Cerebras 402 payment_required — cek billing/quota tab di cloud.cerebras.ai",
			);
			await sendTelegramMessage(
				chatId!,
				"🚫 Kuota AI gratis sedang bermasalah di sisi provider (butuh billing). Admin perlu cek dashboard Cerebras dulu ya.",
			);
			return NextResponse.json({ ok: true });
		}

		await saveHistory(chatId!, messages.slice(1));

		await sendTelegramMessage(
			chatId!,
			finalText ||
				"🤖 Maaf, terjadi kendala saat memproses instruksi ke database dashboard.",
		);
	} catch (error) {
		console.error("Error global on Telegram Webhook Route:", error);
		if (chatId) {
			await sendTelegramMessage(
				chatId,
				"🤖 Maaf, terjadi kesalahan teknis saat memproses permintaan kamu. Coba lagi dalam beberapa saat.",
			);
		}
	}

	return NextResponse.json({ ok: true });
}
