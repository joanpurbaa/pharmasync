import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const ai = new OpenAI({
	baseURL: "https://integrate.api.nvidia.com/v1",
	apiKey: process.env.NVIDIA_API_KEY,
});

const MODEL = "z-ai/glm-5.2";

const ALLOWED_CHAT_IDS = (process.env.TELEGRAM_ALLOWED_IDS ?? "")
	.split(",")
	.map((id) => id.trim());

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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
		return res.json();
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
			return callInternalApi(`/api/mitra?${params.toString()}`);
		}
		case "create_shipment": {
			return callInternalApi(`/api/shipments`, {
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

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const message = body?.message || body?.edited_message;

		if (!message || !message.text) {
			return NextResponse.json({ ok: true });
		}

		const chatId = message.chat.id;
		const userText = message.text;

		if (!ALLOWED_CHAT_IDS.includes(String(chatId))) {
			await sendTelegramMessage(
				chatId,
				"⚠️ Maaf, kamu tidak punya akses untuk mengontrol dashboard Pharmasync.",
			);
			return NextResponse.json({ ok: true });
		}

		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content:
					"Kamu adalah asisten AI terintegrasi untuk kontrol dashboard manajemen farmasi Pharmasync. Tugasmu membantu user mengecek stok barang, melihat daftar mitra, dan mengatur pengiriman (shipment) via database. Apabila user ingin membuat pengiriman, kamu WAJIB mencari itemId dan destinationId terlebih dahulu via tools yang tersedia jika belum ada di konteks. SELALU konfirmasi ulang detail item dan jumlah secara eksplisit kepada user sebelum mengeksekusi tool 'create_shipment'. Jawablah dalam Bahasa Indonesia yang singkat, profesional, dan informatif.",
			},
			{ role: "user", content: userText },
		];

		let finalText = "";

		for (let i = 0; i < 5; i++) {
			const completion = await ai.chat.completions.create({
				model: MODEL,
				messages,
				tools,
				tool_choice: "auto",
				temperature: 0.2,
				max_tokens: 4096,
				seed: 42,
			});

			const choice = completion.choices[0];
			const msg = choice.message;

			if (!msg.tool_calls || msg.tool_calls.length === 0) {
				finalText = msg.content ?? "";
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

		await sendTelegramMessage(
			chatId,
			finalText ||
				"🤖 Maaf, terjadi kendala saat memproses instruksi ke database dashboard.",
		);
	} catch (error) {
		console.error("Error global on Telegram Webhook Route:", error);
	}

	return NextResponse.json({ ok: true });
}
