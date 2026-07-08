import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = await request.json();
	const { itemId, quantity, destinationId, scheduledAt, driverId, vehicleId } = body;

	if (!itemId || !quantity || !destinationId || !scheduledAt) {
		return NextResponse.json(
			{ error: "Field wajib belum lengkap" },
			{ status: 400 },
		);
	}

	const shipment = await db.shipment.update({
		where: { id },
		data: {
			itemId,
			quantity: Number(quantity),
			destinationId,
			scheduledAt: new Date(scheduledAt),
			driverId: driverId || null,
			vehicleId: vehicleId || null,
		},
	});

	return NextResponse.json({ shipment });
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	await db.shipmentTrackingPoint.deleteMany({ where: { shipmentId: id } });
	await db.stockMovement.updateMany({ where: { shipmentId: id }, data: { shipmentId: null } });
	await db.shipment.delete({ where: { id } });

	return NextResponse.json({ success: true });
}