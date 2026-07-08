import { create } from "zustand";
import type {
	ShippingItem,
	ActivityLog,
	DistribusiStats,
	Pagination,
	TrackingData,
} from "@/app/types/Distribusi";

interface DistribusiStore {
	searchQuery: string;
	page: number;
	pageSize: number;
	shipments: ShippingItem[];
	stats: DistribusiStats;
	recentActivity: ActivityLog[];
	pagination: Pagination | null;
	isLoading: boolean;

	selectedShipmentId: string | null;
	tracking: TrackingData | null;
	isTrackingLoading: boolean;

	setSearchQuery: (value: string) => void;
	setPage: (value: number) => void;
	setPageSize: (value: number) => void;
	fetchDistribusi: () => Promise<void>;
	setSelectedShipmentId: (id: string | null) => void;
	fetchTracking: (shipmentId: string) => Promise<void>;
	deleteShipment: (shipmentId: string) => Promise<void>;
	updateShipment: (
		shipmentId: string,
		payload: Record<string, unknown>,
	) => Promise<{ ok: boolean; error?: string }>;
}

export const useDistribusiStore = create<DistribusiStore>((set, get) => ({
	searchQuery: "",
	page: 1,
	pageSize: 10,
	shipments: [],
	stats: { scheduled: 0, shipping: 0, doneToday: 0, activeDrivers: 0 },
	recentActivity: [],
	pagination: null,
	isLoading: true,

	selectedShipmentId: null,
	tracking: null,
	isTrackingLoading: false,

	setSearchQuery: (value) => set({ searchQuery: value, page: 1 }),
	setPage: (value) => set({ page: value }),
	setPageSize: (value) => set({ pageSize: value, page: 1 }),

	fetchDistribusi: async () => {
		const { searchQuery, page, pageSize, selectedShipmentId } = get();
		set({ isLoading: true });

		const params = new URLSearchParams();
		if (searchQuery) params.set("search", searchQuery);
		params.set("page", String(page));
		params.set("pageSize", String(pageSize));

		const response = await fetch(`/api/destinations?${params.toString()}`);
		const data = await response.json();

		set({
			shipments: data.shipments ?? [],
			stats: data.stats ?? {
				scheduled: 0,
				shipping: 0,
				doneToday: 0,
				activeDrivers: 0,
			},
			recentActivity: data.recentActivity ?? [],
			pagination: data.pagination ?? null,
			isLoading: false,
		});

		if (!selectedShipmentId) {
			const shipping = (data.shipments ?? []).find(
				(s: ShippingItem) => s.status === "DIKIRIM",
			);
			if (shipping) get().setSelectedShipmentId(shipping.id);
		}
	},

	setSelectedShipmentId: (id) => {
		set({ selectedShipmentId: id, tracking: null });
		if (id) get().fetchTracking(id);
	},

	fetchTracking: async (shipmentId) => {
		set({ isTrackingLoading: true });
		const response = await fetch(`/api/distribusi/${shipmentId}/tracking`);
		const data = await response.json();
		set({ tracking: data, isTrackingLoading: false });
	},

	deleteShipment: async (shipmentId) => {
		await fetch(`/api/distribusi/${shipmentId}`, { method: "DELETE" });
		if (get().selectedShipmentId === shipmentId) {
			set({ selectedShipmentId: null, tracking: null });
		}
		get().fetchDistribusi();
	},

	updateShipment: async (shipmentId, payload) => {
		const response = await fetch(`/api/distribusi/${shipmentId}`, {
			method: "PATCH",  
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		if (!response.ok)
			return { ok: false, error: data.error ?? "Gagal memperbarui pengiriman" };
		get().fetchDistribusi();
		return { ok: true };
	},
}));
