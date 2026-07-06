import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const protectedPaths = [
	"/dashboard",
	"/distribusi",
	"/stok-barang",
	"/riwayat",
	"/petugas",
];
// const protectedPaths = ["/test"];
const publicPaths = ["/masuk"];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (
		publicPaths.some(
			(path) => pathname === path || pathname.startsWith(`${path}/`),
		)
	) {
		return NextResponse.next();
	}

	const isProtected = protectedPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if (!isProtected) {
		return NextResponse.next();
	}

	const token = request.cookies.get("auth_token")?.value;
	if (!token) {
		const loginUrl = new URL("/masuk", request.url);
		return NextResponse.redirect(loginUrl);
	}

	try {
		await verifyToken(token);
		return NextResponse.next();
	} catch {
		const loginUrl = new URL("/masuk", request.url);
		return NextResponse.redirect(loginUrl);
	}
}
