import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export const SHIPMENTS_CACHE_KEY = "pharmasync:snapshot:jadwal-pengiriman";
const SHIPMENTS_CACHE_TTL = 60 * 10;

export interface ShipmentSnapshot {
	id: string;
	code: string;
	itemName: string;
	quantity: number;
	unit: string;
	destinationName: string;
	scheduledAt: string;
	driverName: string | null;
	vehiclePlate: string | null;
	status: string;
}

async function fetchUpcomingShipmentsFromDb(): Promise<ShipmentSnapshot[]> {
	const shipments = await db.shipment.findMany({
		where: { status: { in: ["DIJADWALKAN", "DIKIRIM"] } },
		include: { item: true, destination: true, driver: true, vehicle: true },
		orderBy: { scheduledAt: "asc" },
		take: 100,
	});

	return shipments.map((s) => ({
		id: s.id,
		code: s.code,
		itemName: s.item.name,
		quantity: s.quantity,
		unit: s.item.unit,
		destinationName: s.destination.name,
		scheduledAt: s.scheduledAt.toISOString(),
		driverName: s.driver ? s.driver.name : null,
		vehiclePlate: s.vehicle ? s.vehicle.plateNumber : null,
		status: s.status,
	}));
}

export async function getUpcomingShipmentsCached(): Promise<
	ShipmentSnapshot[]
> {
	try {
		const cached = await redis.get<ShipmentSnapshot[]>(SHIPMENTS_CACHE_KEY);
		if (cached) return cached;
	} catch (err) {
		console.error("Gagal baca cache jadwal pengiriman:", err);
	}

	const shipments = await fetchUpcomingShipmentsFromDb();

	try {
		await redis.set(SHIPMENTS_CACHE_KEY, shipments, { ex: SHIPMENTS_CACHE_TTL });
	} catch (err) {
		console.error("Gagal simpan cache jadwal pengiriman:", err);
	}

	return shipments;
}

export async function invalidateShipmentsCache() {
	try {
		await redis.del(SHIPMENTS_CACHE_KEY);
	} catch (err) {
		console.error("Gagal invalidate cache jadwal pengiriman:", err);
	}
}

export function filterShipments(
	list: ShipmentSnapshot[],
	opts: { destinationSearch?: string; status?: string },
) {
	return list.filter((s) => {
		const matchDest = opts.destinationSearch
			? s.destinationName
					.toLowerCase()
					.includes(opts.destinationSearch.toLowerCase())
			: true;
		const matchStatus = opts.status
			? s.status === opts.status.toUpperCase()
			: true;
		return matchDest && matchStatus;
	});
}

export function buildShipmentSummaryText(list: ShipmentSnapshot[]): string {
	if (list.length === 0)
		return "Tidak ada jadwal pengiriman yang berlangsung atau akan datang saat ini.";

	const lines = list.slice(0, 15).map((s) => {
		const date = new Date(s.scheduledAt).toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
		const time = new Date(s.scheduledAt).toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		});
		return `${s.code}: ${s.itemName} (${s.quantity} ${s.unit}) ke ${s.destinationName}, jadwal ${date} ${time}, status ${s.status}, driver ${s.driverName ?? "belum ditentukan"}.`;
	});

	return `Ada ${list.length} jadwal pengiriman aktif/mendatang. Berikut ringkasannya:\n${lines.join("\n")}`;
}
