import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const statusPriority: Record<string, number> = {
	KRITIS: 0,
	PENDING: 1,
	MENIPIS: 2,
	AMAN: 3,
};

type StockStatus = "AMAN" | "MENIPIS" | "KRITIS" | "PENDING";

function getStockStatus(current: number, critical: number, min: number) {
	if (current <= critical) return "KRITIS";
	if (current <= min) return "MENIPIS";
	return "AMAN";
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get("search") ?? "";
	const category = searchParams.get("category");
	const status = searchParams.get("status");

	const items = await db.item.findMany({
		where: {
			OR: search
				? [
						{ name: { contains: search, mode: "insensitive" } },
						{ sku: { contains: search, mode: "insensitive" } },
					]
				: undefined,
			category:
				category && category !== "Semua Kategori" ? { name: category } : undefined,
		},
		include: {
			category: true,
			batches: {
				where: { isActive: true, quantityRemaining: { gt: 0 } },
				orderBy: { expiryDate: "asc" },
			},
		},
		orderBy: { updatedAt: "desc" },
	});

	const result = items
		.map((item) => {
			const hasPendingSetup = item.currentStock === 0 && item.batches.length === 0;
			const stockStatus: StockStatus = hasPendingSetup
				? "PENDING"
				: getStockStatus(
					item.currentStock,
					item.criticalThreshold,
					item.minThreshold,
				);
			const nearestBatch = item.batches[0] ?? null;
			const isExpiringSoon = nearestBatch
				? nearestBatch.expiryDate.getTime() - Date.now() <=
					item.expiryWarningDays * 24 * 60 * 60 * 1000
				: false;

			return {
				id: item.id,
				name: item.name,
				description: item.description,
				sku: item.sku,
				category: item.category.name,
				quantity: item.currentStock,
				unit: item.unit,
				status: stockStatus,
				storageCondition: item.storageCondition,
				isControlledSubstance: item.isControlledSubstance,
				nearestExpiry: nearestBatch ? nearestBatch.expiryDate.toISOString() : null,
				isExpiringSoon,
				updatedAt: item.updatedAt.toISOString(),
			};
		})
		.filter((item) =>
			status && status !== "Semua Status"
				? item.status === status.toUpperCase()
				: true,
		)
		.sort((a, b) => {
			const priorityA = statusPriority[a.status] ?? 3;
			const priorityB = statusPriority[b.status] ?? 3;
			if (priorityA !== priorityB) return priorityA - priorityB;
			return (
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);
		});

	return NextResponse.json({ items: result });
}

export async function POST(request: Request) {
	const body = await request.json();

	const {
		name,
		sku,
		categoryName,
		unit,
		minThreshold,
		criticalThreshold,
		expiryWarningDays,
		storageCondition,
		registrationNumber,
		isControlledSubstance,
		description,
	} = body;

	if (!name || !sku || !categoryName || !unit) {
		return NextResponse.json(
			{ error: "Field wajib belum lengkap" },
			{ status: 400 },
		);
	}

	const existingSku = await db.item.findUnique({ where: { sku } });
	if (existingSku) {
		return NextResponse.json({ error: "SKU sudah terdaftar" }, { status: 409 });
	}

	const category = await db.category.upsert({
		where: { name: categoryName },
		update: {},
		create: { name: categoryName },
	});

	const warehouse = await db.warehouse.findFirst();
	if (!warehouse) {
		return NextResponse.json(
			{ error: "Belum ada gudang terdaftar" },
			{ status: 400 },
		);
	}

	const user = await db.user.findFirst({ where: { role: "ADMIN" } });
	if (!user) {
		return NextResponse.json(
			{ error: "Tidak ada user admin terdaftar" },
			{ status: 400 },
		);
	}

	const item = await db.item.create({
		data: {
			name,
			sku,
			unit,
			description: description || null,
			minThreshold: Number(minThreshold) || 0,
			criticalThreshold: Number(criticalThreshold) || 0,
			expiryWarningDays: Number(expiryWarningDays) || 90,
			storageCondition: storageCondition || "SUHU_RUANG",
			registrationNumber: registrationNumber || null,
			isControlledSubstance: Boolean(isControlledSubstance),
			categoryId: category.id,
			warehouseId: warehouse.id,
		},
	});

	await db.auditLog.create({
		data: {
			userId: user.id,
			action: "CREATE_ITEM",
			entityType: "Item",
			entityId: item.id,
			detail: { name: item.name, sku: item.sku },
			sourceChannel: "WEB",
		},
	});

	await redis.del("pharmasync:dashboard:overview");

	return NextResponse.json({ item }, { status: 201 });
}
