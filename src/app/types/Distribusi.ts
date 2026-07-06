import type { LucideIcon } from "lucide-react";

export interface DeliveryCard {
	title: string;
	value: string;
	change: string;
	trend: "up" | "down" | "neutral" | "";
	icon: LucideIcon;
	color: string;
}

export interface ShippingItem {
	item: string;
	id: string;
	qty: string;
	destination: string;
	schedule: string;
	time: string;
	driver: string;
	vehicle: string;
	status: string;
	statusType: "shipping" | "scheduled" | "success";
}

export interface ActivityLog {
	title: string;
	desc: string;
	time: string;
	type: "success" | "shipping" | "update";
}
