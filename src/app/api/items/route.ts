import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

function getStockStatus(current: number, critical: number, min: number) {
	if (current <= critical) return "KRITIS";
	if (current <= min) return "MENIPIS";
	return "AMAN";
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get("search") ?? "";
	const category = searchParams.get("category") ?? "Semua Kategori";
	const status = searchParams.get("status") ?? "Semua Status";

	const cacheKey = `pharmasync:items:q=${search}:c=${category}:s=${status}`;

	const cachedData = await redis.get(cacheKey);
	if (cachedData) {
		return NextResponse.json(cachedData);
	}

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
			const stockStatus = getStockStatus(
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
		);

	const response = { items: result };
	await redis.set(cacheKey, response, { ex: 300 });

	return NextResponse.json(response);
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

	await redis.del("pharmasync:categories");
	const cachePattern = "pharmasync:items:*";
	const keys = await redis.keys(cachePattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}

	return NextResponse.json({ item }, { status: 201 });
}
