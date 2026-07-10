import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { redis } from "@/lib/redis";

const nvidia = new OpenAI({
	baseURL: "https://integrate.api.nvidia.com/v1",
	apiKey: process.env.NVIDIA_API_KEY,
});
const NVIDIA_MODEL = "z-ai/glm-5.2";

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-3.5-flash";

const ALLOWED_CHAT_IDS = (process.env.TELEGRAM_ALLOWED_IDS ?? "")
	.split(",")
	.map((id) => id.trim());

const HISTORY_TTL_SECONDS = 60 * 30;
const MAX_HISTORY_MESSAGES = 12;

const SNAPSHOT_KEY = "pharmasync:snapshot:stok";
const SNAPSHOT_TTL_SECONDS = 60 * 5;

type SimpleMessage = { role: "user" | "assistant"; content: string };

function historyKey(chatId: number) {
	return `pharmasync:telegram:history:${chatId}`;
}

async function loadHistory(chatId: number): Promise<SimpleMessage[]> {
	const stored = await redis.get<SimpleMessage[]>(historyKey(chatId));
	return stored ?? [];
}

async function saveHistory(chatId: number, history: SimpleMessage[]) {
	const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
	await redis.set(historyKey(chatId), trimmed, { ex: HISTORY_TTL_SECONDS });
}

async function clearHistory(chatId: number) {
	await redis.del(historyKey(chatId));
}

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

function buildStockSummary(items: any[]): string {
	if (!Array.isArray(items) || items.length === 0) {
		return "Data stok belum tersedia.";
	}

	const counts: Record<string, number> = {};
	const kritis: string[] = [];
	const menipis: string[] = [];

	for (const item of items) {
		const status = item.status ?? "TIDAK DIKETAHUI";
		counts[status] = (counts[status] ?? 0) + 1;

		const label = `${item.name ?? item.nama ?? "Item"} (${item.stock ?? item.stok ?? "?"} pcs)`;

		if (status === "KRITIS") kritis.push(label);
		if (status === "MENIPIS") menipis.push(label);
	}

	const totalLine = `Total ${items.length} item. Rincian status: ${Object.entries(
		counts,
	)
		.map(([status, count]) => `${status}=${count}`)
		.join(", ")}.`;

	const kritisLine =
		kritis.length > 0
			? `Item berstatus KRITIS: ${kritis.join(", ")}.`
			: "Tidak ada item berstatus KRITIS saat ini.";

	const menipisLine =
		menipis.length > 0
			? `Item berstatus MENIPIS: ${menipis.join(", ")}.`
			: "Tidak ada item berstatus MENIPIS saat ini.";

	return `${totalLine}\n${kritisLine}\n${menipisLine}`;
}

async function getStockSummary(): Promise<string> {
	try {
		const cached = await redis.get<string>(SNAPSHOT_KEY);
		if (cached) return cached;
	} catch (err) {
		console.error("Gagal baca snapshot stok dari Redis:", err);
	}

	const data = await callInternalApi("/api/items");
	const items = Array.isArray(data) ? data : (data?.items ?? []);
	const summary = buildStockSummary(items);

	try {
		await redis.set(SNAPSHOT_KEY, summary, { ex: SNAPSHOT_TTL_SECONDS });
	} catch (err) {
		console.error("Gagal simpan snapshot stok ke Redis:", err);
	}

	return summary;
}

const BASE_SYSTEM_PROMPT =
	"Kamu adalah asisten AI khusus untuk MELIHAT data dashboard manajemen farmasi Pharmasync. Tugasmu HANYA menjawab pertanyaan seputar stok barang dan daftar mitra/klinik, termasuk memberi rangkuman data. Kamu TIDAK PERNAH boleh membuat, mengubah, menghapus, atau memanipulasi data apapun di sistem, termasuk tidak boleh membuat pengiriman baru, mengubah jumlah stok, atau tindakan tulis lain apapun, walaupun user memintanya secara eksplisit atau berulang kali. Kamu tidak punya akses atau tools untuk melakukan aksi tulis apapun. Kalau user meminta aksi tulis/manipulasi data, tolak dengan sopan dan jelaskan bahwa kamu hanya bisa menampilkan data, karena ini menyangkut rantai pasok alat/obat untuk tenaga medis dan aksi tulis harus dilakukan manual oleh staf berwenang lewat dashboard. Gunakan riwayat percakapan sebelumnya sebagai konteks apabila relevan. Jawablah dalam Bahasa Indonesia yang singkat, profesional, dan informatif.";

const openaiTools = [
	{
		type: "function",
		function: {
			name: "get_stok_barang",
			description:
				"Ambil daftar item obat/alat medis beserta stok dan status saat ini. Gunakan hanya kalau ringkasan stok yang sudah diberikan tidak cukup detail, misalnya user mencari item spesifik.",
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
			description: "Cari daftar klinik/mitra.",
			parameters: {
				type: "object",
				properties: { search: { type: "string", description: "Nama klinik" } },
			},
		},
	},
] satisfies OpenAI.Chat.Completions.ChatCompletionTool[];

const geminiTools = openaiTools.map((t) => ({
	type: "function" as const,
	name: t.function.name,
	description: t.function.description,
	parameters: t.function.parameters,
}));

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

async function runWithNvidia(
	systemPrompt: string,
	history: SimpleMessage[],
	userText: string,
): Promise<string> {
	const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{ role: "system", content: systemPrompt },
		...history.map(
			(h) =>
				({
					role: h.role,
					content: h.content,
				}) as OpenAI.Chat.Completions.ChatCompletionMessageParam,
		),
		{ role: "user", content: userText },
	];

	let finalText = "";

	for (let i = 0; i < 5; i++) {
		const completion = await nvidia.chat.completions.create({
			model: NVIDIA_MODEL,
			messages,
			tools: openaiTools,
			tool_choice: "auto",
			temperature: 0.2,
			max_tokens: 2048,
		});

		const msg = completion.choices[0].message;

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

	return finalText || "🤖 Maaf, terjadi kendala saat memproses permintaan kamu.";
}

async function runWithGemini(
	systemPrompt: string,
	history: SimpleMessage[],
	userText: string,
): Promise<string> {
	const historyText = history
		.map((h) => `${h.role === "user" ? "User" : "Asisten"}: ${h.content}`)
		.join("\n");

	const composedInput = `${systemPrompt}\n\n${
		historyText ? `Riwayat percakapan sebelumnya:\n${historyText}\n\n` : ""
	}Pesan baru dari user: ${userText}`;

	let interaction = await gemini.interactions.create({
		model: GEMINI_MODEL,
		input: composedInput,
		tools: geminiTools,
	});

	for (let i = 0; i < 5; i++) {
		const callSteps = interaction.steps.filter(
			(s: any) => s.type === "function_call",
		);

		if (callSteps.length === 0) break;

		const results = [];
		for (const step of callSteps as any[]) {
			const result = await executeTool(step.name, step.arguments);
			results.push({
				type: "function_result",
				name: step.name,
				call_id: step.id,
				result: [{ type: "text", text: JSON.stringify(result) }],
			});
		}

		interaction = await gemini.interactions.create({
			model: GEMINI_MODEL,
			input: results as any,
			tools: geminiTools,
			previous_interaction_id: interaction.id,
		});
	}

	return (
		interaction.output_text ||
		"🤖 Maaf, terjadi kendala saat memproses permintaan kamu."
	);
}

async function generateReply(
	history: SimpleMessage[],
	userText: string,
): Promise<string> {
	const summary = await getStockSummary();
	const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nRingkasan stok saat ini (boleh langsung dipakai untuk menjawab pertanyaan umum tanpa perlu memanggil tool get_stok_barang, kecuali user butuh detail atau filter spesifik):\n${summary}`;

	const providers: Array<{ name: string; run: () => Promise<string> }> = [
		{ name: "nvidia", run: () => runWithNvidia(systemPrompt, history, userText) },
		{ name: "gemini", run: () => runWithGemini(systemPrompt, history, userText) },
	];

	let lastError: any = null;

	for (const provider of providers) {
		try {
			return await provider.run();
		} catch (err: any) {
			lastError = err;
			console.error(
				`Provider "${provider.name}" gagal (status ${err?.status ?? "?"}):`,
				err?.message ?? err,
			);
		}
	}

	throw lastError ?? new Error("Semua provider AI gagal tanpa detail error.");
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
				"⚠️ Maaf, kamu tidak punya akses untuk mengakses dashboard Pharmasync.",
			);
			return NextResponse.json({ ok: true });
		}

		if (userText.trim() === "/reset" || userText.trim() === "/start") {
			await clearHistory(chatId!);
			await sendTelegramMessage(
				chatId!,
				"🔄 Percakapan sudah direset. Ada yang bisa saya bantu terkait stok atau daftar mitra?",
			);
			return NextResponse.json({ ok: true });
		}

		const previousHistory = await loadHistory(chatId!);

		let finalText = "";
		let bothFailed = false;

		try {
			finalText = await generateReply(previousHistory, userText);
		} catch {
			bothFailed = true;
		}

		if (bothFailed) {
			await sendTelegramMessage(
				chatId!,
				"⏳ Dua-duanya (NVIDIA & Gemini) lagi bermasalah — kemungkinan kuota habis atau rate limit. Coba kirim pesan kamu lagi dalam 15-30 detik ya.",
			);
			return NextResponse.json({ ok: true });
		}

		await saveHistory(chatId!, [
			...previousHistory,
			{ role: "user", content: userText },
			{ role: "assistant", content: finalText },
		]);

		await sendTelegramMessage(chatId!, finalText);
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
