export interface ApiItem {
	id: string;
	name: string;
	description: string | null;
	sku: string;
	category: string;
	quantity: number;
	unit: string;
	status: "AMAN" | "MENIPIS" | "KRITIS" | "PENDING";
	storageCondition: "SUHU_RUANG" | "DINGIN" | "BEKU";
	isControlledSubstance: boolean;
	nearestExpiry: string | null;
	isExpiringSoon: boolean;
	updatedAt: string;
}
