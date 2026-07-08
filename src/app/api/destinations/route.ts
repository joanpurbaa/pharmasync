import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { parseGoogleMapsLink } from "@/lib/parseGoogleMapsLink";

export async function GET() {
  const destinations = await db.destination.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ destinations });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, address, phone, mapsLink } = body;

  if (!name || !mapsLink) {
    return NextResponse.json(
      { error: "Nama klinik dan link Google Maps wajib diisi" },
      { status: 400 },
    );
  }

  const coords = await parseGoogleMapsLink(mapsLink);

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Tidak bisa membaca koordinat dari link tersebut. Pastikan link berasal dari tombol Bagikan di Google Maps.",
      },
      { status: 422 },
    );
  }

  const destination = await db.destination.create({
    data: {
      name,
      address: address || null,
      phone: phone || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
    },
  });

  return NextResponse.json({ destination }, { status: 201 });
}