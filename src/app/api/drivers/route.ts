import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const page = Math.max(1, Number(searchParams.get("page")) || 1);
	const pageSize = Math.min(
		100,
		Math.max(1, Number(searchParams.get("pageSize")) || 10),
	);

	const cacheKey = `pharmasync:drivers:page:${page}:pageSize:${pageSize}`;
	const cached = await redis.get(cacheKey);
	if (cached) {
		return NextResponse.json(cached);
	}

	const drivers = await db.driver.findMany({
		include: { usualVehicle: true },
		orderBy: { name: "asc" },
	});

	const mapped = drivers.map((d) => ({
		id: d.id,
		nama: d.name,
		sim: `${d.simType} • ${d.simNumber}`,
		kontak: d.phone,
		unit: d.usualVehicle ? d.usualVehicle.plateNumber : "Tersedia",
		type: d.usualVehicle ? "assigned" : "available",
		status: d.status,
	}));

	const totalItems = mapped.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * pageSize;
	const paginated = mapped.slice(start, start + pageSize);

	const payload = {
		drivers: paginated,
		pagination: {
			page: safePage,
			pageSize,
			totalItems,
			totalPages,
		},
	};

	await redis.set(cacheKey, payload, { ex: 60 });

	return NextResponse.json(payload);
}

export async function POST(request: Request) {
	const body = await request.json();
	const { name, simNumber, simType, phone, status, usualVehicleId } = body;

	if (!name || !simNumber || !simType || !phone) {
		return NextResponse.json(
			{ error: "Field wajib belum lengkap" },
			{ status: 400 },
		);
	}

	const driver = await db.driver.create({
		data: {
			name,
			simNumber,
			simType,
			phone,
			status: status || "AKTIF",
			usualVehicleId: usualVehicleId || null,
		},
	});

	const keys = await redis.keys("pharmasync:drivers:page:*");
	if (keys.length) {
		await redis.del(...keys);
	}

	return NextResponse.json({ driver }, { status: 201 });
}
