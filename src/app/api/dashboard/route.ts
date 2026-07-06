import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CACHE_KEY = "pharmasync:dashboard:overview";
const CACHE_TTL_SECONDS = 30;

function getStockStatus(current: number, critical: number, min: number) {
	if (current <= critical) return "KRITIS";
	if (current <= min) return "MENIPIS";
	return "AMAN";
}

function formatRelativeTime(date: Date) {
	const diffMs = Date.now() - date.getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	if (diffMinutes < 1) return "Baru saja";
	if (diffMinutes < 60) return `${diffMinutes}m yang lalu`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}j yang lalu`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}h yang lalu`;
}

const actionTitles: Record<string, string> = {
	RECEIVE_STOCK: "Barang Masuk",
	CREATE_ITEM: "Item Baru",
	CREATE_SHIPMENT: "Pengiriman Dijadwalkan",
	UPDATE_STOCK: "Update Stok",
};

function formatActivityDetail(
	action: string,
	detail: Record<string, unknown> | null,
	itemName: string | null,
) {
	const d = detail ?? {};
	switch (action) {
		case "RECEIVE_STOCK":
			return `menerima ${d.quantity ?? ""} ${itemName ?? "item"}${
				d.vendorName ? ` dari ${d.vendorName}` : ""
			}`;
		case "CREATE_ITEM":
			return `mendaftarkan item baru ${itemName ?? ""}`;
		case "CREATE_SHIPMENT":
			return `menjadwalkan pengiriman ${itemName ?? "item"}`;
		default:
			return action.replaceAll("_", " ").toLowerCase();
	}
}

export async function GET() {
	const cachedData = await redis.get(CACHE_KEY);
	if (cachedData) {
		return NextResponse.json(cachedData);
	}

	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999);

	const [totalItems, items, shipmentsToday, recentAuditLogs] = await Promise.all(
		[
			db.item.count(),
			db.item.findMany({
				select: {
					id: true,
					name: true,
					sku: true,
					unit: true,
					currentStock: true,
					minThreshold: true,
					criticalThreshold: true,
					category: { select: { name: true } },
				},
			}),
			db.shipment.findMany({
				where: { scheduledAt: { gte: startOfToday, lte: endOfToday } },
				select: { status: true },
			}),
			db.auditLog.findMany({
				take: 6,
				orderBy: { createdAt: "desc" },
				include: { user: true },
			}),
		],
	);

	const itemsWithStatus = items
		.map((item) => ({
			...item,
			status: getStockStatus(
				item.currentStock,
				item.criticalThreshold,
				item.minThreshold,
			),
		}))
		.filter((item) => item.status !== "AMAN");

	const criticalStockCount = itemsWithStatus.filter(
		(item) => item.status === "KRITIS",
	).length;

	const criticalStockList = itemsWithStatus
		.sort(
			(a, b) =>
				(a.status === "KRITIS" ? -1 : 0) - (b.status === "KRITIS" ? -1 : 0),
		)
		.slice(0, 5)
		.map((item) => ({
			name: item.name,
			sku: item.sku,
			category: item.category.name,
			stock: `${item.currentStock} ${item.unit}`,
			status: item.status === "KRITIS" ? "Stok Kritis" : "Stok Menipis",
			type: item.status === "KRITIS" ? "kritis" : "menipis",
		}));

	const shipmentsCompleted = shipmentsToday.filter(
		(s) => s.status === "SELESAI",
	).length;
	const shipmentsInProgress = shipmentsToday.filter(
		(s) => s.status === "DIJADWALKAN" || s.status === "DIKIRIM",
	).length;

	const itemIds = recentAuditLogs
		.filter((log) => log.entityType === "Item" && log.entityId)
		.map((log) => log.entityId as string);

	const relatedItems = itemIds.length
		? await db.item.findMany({
				where: { id: { in: itemIds } },
				select: { id: true, name: true },
			})
		: [];

	const itemNameMap = new Map(relatedItems.map((item) => [item.id, item.name]));

	const recentActivities = recentAuditLogs.map((log, idx) => ({
		title: actionTitles[log.action] ?? log.action,
		time: formatRelativeTime(log.createdAt),
		user: log.user.name,
		detail: formatActivityDetail(
			log.action,
			log.detail as Record<string, unknown> | null,
			log.entityId ? (itemNameMap.get(log.entityId) ?? null) : null,
		),
		isLatest: idx === 0,
	}));

	const lastActivity = recentAuditLogs[0]
		? formatRelativeTime(recentAuditLogs[0].createdAt)
		: "-";

	const response = {
		totalItems,
		criticalStockCount,
		shipmentsToday: {
			total: shipmentsToday.length,
			completed: shipmentsCompleted,
			inProgress: shipmentsInProgress,
		},
		lastActivity,
		criticalStockList,
		recentActivities,
	};

	await redis.set(CACHE_KEY, response, { ex: CACHE_TTL_SECONDS });

	return NextResponse.json(response);
}
