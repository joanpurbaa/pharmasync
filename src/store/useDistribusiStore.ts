import { create } from "zustand";

interface DistribusiStore {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
}

export const useDistribusiStore = create<DistribusiStore>((set) => ({
	searchQuery: "",
	setSearchQuery: (value) => set({ searchQuery: value }),
}));
