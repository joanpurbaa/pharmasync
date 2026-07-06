export interface StatCard {
	label: string;
	value: string;
	desc: string;
	isWarning?: boolean;
}

export interface SopirLog {
	nama: string;
	sim: string;
	kontak: string;
	unit: string;
	type: "assigned" | "available";
}

export interface KendaraanLog {
	plat: string;
	model: string;
	jenis: string;
	sopir: string;
	status: string;
	type: "active" | "available" | "maintenance";
}
