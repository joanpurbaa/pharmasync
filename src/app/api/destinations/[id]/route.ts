import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	if (!id) {
		return NextResponse.json(
			{ error: "ID Mitra wajib disertakan" },
			{ status: 400 },
		);
	}

	try {
		const linkedShipments = await db.shipment.count({
			where: { destinationId: id },
		});

		if (linkedShipments > 0) {
			return NextResponse.json(
				{
					error:
						"Mitra gagal dihapus karena masih terikat dengan riwayat atau jadwal distribusi aktif.",
				},
				{ status: 400 },
			);
		}

		await db.destination.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "Data mitra berhasil dihapus secara permanen" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error backend DELETE mitra:", error);
		return NextResponse.json(
			{ error: "Gagal menghapus data mitra dari database server" },
			{ status: 500 },
		);
	}
}
