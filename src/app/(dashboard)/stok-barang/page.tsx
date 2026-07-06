"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
	SearchIcon,
	PlusIcon,
	PackagePlusIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	AlertTriangleIcon,
	CheckCircle2Icon,
	AlertCircleIcon,
	ClockIcon,
	SnowflakeIcon,
	ShieldAlertIcon,
} from "lucide-react";
import AddItemModal from "@/components/AddItemModal";
import ReceiveStockModal from "@/components/ReceiveStockModal";
import type { ApiItem } from "@/app/types/StokBarang";

const statusLabel: Record<ApiItem["status"], string> = {
	AMAN: "Aman",
	MENIPIS: "Menipis",
	KRITIS: "Kritis",
};

const statusStyle: Record<ApiItem["status"], string> = {
	AMAN: "bg-emerald-50 text-emerald-700 border border-emerald-100",
	MENIPIS: "bg-amber-50 text-amber-700 border border-amber-100",
	KRITIS: "bg-red-50 text-red-700 border border-red-100",
};

function formatRelativeTime(dateString: string) {
	const diffMs = Date.now() - new Date(dateString).getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours} jam yang lalu`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays} hari yang lalu`;
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function storageIcon(condition: ApiItem["storageCondition"]) {
	if (condition === "DINGIN" || condition === "BEKU") {
		return (
			<span
				title={condition === "DINGIN" ? "Cold Chain (2-8°C)" : "Beku"}
				className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-50 border border-sky-100">
				<SnowflakeIcon className="w-3 h-3 text-sky-600" />
			</span>
		);
	}
	return null;
}

export default function StokBarang() {
	const [items, setItems] = useState<ApiItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
	const [statusFilter, setStatusFilter] = useState("Semua Status");
	const [isAddItemOpen, setIsAddItemOpen] = useState(false);
	const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);

	const fetchItems = useCallback(async () => {
		setIsLoading(true);
		const params = new URLSearchParams();
		if (searchQuery) params.set("search", searchQuery);
		if (categoryFilter !== "Semua Kategori")
			params.set("category", categoryFilter);
		if (statusFilter !== "Semua Status") params.set("status", statusFilter);

		const response = await fetch(`/api/items?${params.toString()}`);
		const data = await response.json();
		setItems(data.items ?? []);
		setIsLoading(false);
	}, [searchQuery, categoryFilter, statusFilter]);

	useEffect(() => {
		const timeout = setTimeout(fetchItems, 300);
		return () => clearTimeout(timeout);
	}, [fetchItems]);

	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="text-xl font-bold tracking-tight text-slate-900">
					Stok Barang
				</h1>

				<div className="relative w-full sm:w-72">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						type="text"
						placeholder="Cari SKU atau nama item..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400 transition-all"
					/>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-end">
				<div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
					<div className="flex flex-col space-y-1.5 w-full sm:w-44">
						<label className="text-xs font-medium text-slate-500">Kategori</label>
						<div className="relative">
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 pr-9">
								<option>Semua Kategori</option>
								<option>Farmasi</option>
								<option>Alat Medis</option>
								<option>Konsumsi</option>
							</select>
							<ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
						</div>
					</div>

					<div className="flex flex-col space-y-1.5 w-full sm:w-44">
						<label className="text-xs font-medium text-slate-500">Status Stok</label>
						<div className="relative">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 pr-9">
								<option>Semua Status</option>
								<option>Aman</option>
								<option>Menipis</option>
								<option>Kritis</option>
							</select>
							<ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
					<button
						onClick={() => setIsReceiveStockOpen(true)}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors whitespace-nowrap w-full lg:w-auto">
						<PackagePlusIcon className="w-4 h-4" />
						Terima Barang Masuk
					</button>
					<button
						onClick={() => setIsAddItemOpen(true)}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap w-full lg:w-auto">
						<PlusIcon className="w-4 h-4" />
						Tambah Item Baru
					</button>
				</div>
			</div>

			<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[900px]">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-3.5">Nama Item</th>
								<th className="px-6 py-3.5">Kode SKU</th>
								<th className="px-6 py-3.5">Kategori</th>
								<th className="px-6 py-3.5">Stok Saat Ini</th>
								<th className="px-6 py-3.5">Status</th>
								<th className="px-6 py-3.5">Kadaluarsa Terdekat</th>
								<th className="px-6 py-3.5 text-right">Update Terakhir</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
							{isLoading && (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Memuat data...
									</td>
								</tr>
							)}

							{!isLoading && items.length === 0 && (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Belum ada item yang cocok dengan filter ini.
									</td>
								</tr>
							)}

							{!isLoading &&
								items.map((item) => (
									<tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center gap-1.5">
												<span className="font-semibold text-slate-900">{item.name}</span>
												{storageIcon(item.storageCondition)}
												{item.isControlledSubstance && (
													<span title="Golongan Narkotika/Psikotropika">
														<ShieldAlertIcon className="w-3.5 h-3.5 text-purple-500" />
													</span>
												)}
											</div>
											<div className="text-xs text-slate-400 mt-0.5">
												{item.description}
											</div>
										</td>

										<td className="px-6 py-4 font-mono text-xs text-slate-500 tracking-tight">
											{item.sku}
										</td>

										<td className="px-6 py-4">
											<span
												className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${
													item.category === "Farmasi"
														? "bg-purple-50 text-purple-700 border border-purple-100/50"
														: item.category === "Alat Medis"
															? "bg-indigo-50 text-indigo-700 border border-indigo-100/50"
															: "bg-slate-100 text-slate-700"
												}`}>
												{item.category}
											</span>
										</td>

										<td className="px-6 py-4 text-slate-900">
											<span className="text-base font-bold">{item.quantity}</span>{" "}
											<span className="text-xs text-slate-400 ml-0.5">{item.unit}</span>
										</td>

										<td className="px-6 py-4">
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle[item.status]}`}>
												{item.status === "AMAN" && (
													<CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-600" />
												)}
												{item.status === "MENIPIS" && (
													<AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
												)}
												{item.status === "KRITIS" && (
													<AlertCircleIcon className="w-3.5 h-3.5 text-red-600" />
												)}
												{statusLabel[item.status]}
											</span>
										</td>

										<td className="px-6 py-4">
											{item.nearestExpiry ? (
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
														item.isExpiringSoon
															? "bg-orange-50 text-orange-700 border border-orange-100"
															: "bg-slate-50 text-slate-500 border border-slate-100"
													}`}>
													{item.isExpiringSoon && <ClockIcon className="w-3.5 h-3.5" />}
													{formatDate(item.nearestExpiry)}
												</span>
											) : (
												<span className="text-xs text-slate-300">—</span>
											)}
										</td>

										<td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
											{formatRelativeTime(item.updatedAt)}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				<div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
					<span className="text-xs text-slate-500 font-medium text-center sm:text-left">
						Menampilkan{" "}
						<span className="font-bold text-slate-700">{items.length}</span> item
					</span>
					<div className="inline-flex items-center gap-1.5">
						<button
							className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
							disabled>
							<ChevronLeftIcon className="w-4 h-4" />
						</button>
						<button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors">
							<ChevronRightIcon className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<AddItemModal
				isOpen={isAddItemOpen}
				onClose={() => setIsAddItemOpen(false)}
				onSuccess={fetchItems}
			/>
			<ReceiveStockModal
				isOpen={isReceiveStockOpen}
				onClose={() => setIsReceiveStockOpen(false)}
				onSuccess={fetchItems}
			/>
		</div>
	);
}
