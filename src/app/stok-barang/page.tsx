"use client";

import React, { useState } from "react";
import {
	SearchIcon,
	PlusIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	AlertTriangleIcon,
	CheckCircle2Icon,
	AlertCircleIcon,
} from "lucide-react";

const stockItems = [
	{
		name: "Paracetamol 500mg",
		description: "Tablet Oral",
		sku: "MED-PCM-500",
		category: "Farmasi",
		quantity: "1.250",
		unit: "Strip",
		status: "Aman",
		type: "aman",
		lastUpdate: "2 jam yang lalu",
	},
	{
		name: "Disposable Syringe 5ml",
		description: "Alat Suntik Sekali Pakai",
		sku: "ALMED-SYR-05",
		category: "Alat Medis",
		quantity: "85",
		unit: "Box",
		status: "Menipis",
		type: "menipis",
		lastUpdate: "6 jam yang lalu",
	},
	{
		name: "Amoxicillin 250mg",
		description: "Antibiotik Kapsul",
		sku: "MED-AMX-250",
		category: "Farmasi",
		quantity: "12",
		unit: "Strip",
		status: "Kritis",
		type: "kritis",
		lastUpdate: "15 menit yang lalu",
	},
	{
		name: "Sarung Tangan Nitril M",
		description: "Pelindung Tangan Non-Steril",
		sku: "BMHP-GLV-NM",
		category: "Konsumsi",
		quantity: "450",
		unit: "Box",
		status: "Aman",
		type: "aman",
		lastUpdate: "Kemarin",
	},
];

export default function StokBarang() {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-xl font-semibold tracking-tight text-slate-900">
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
							<select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 pr-9">
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
							<select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 pr-9">
								<option>Semua Status</option>
								<option>Aman</option>
								<option>Menipis</option>
								<option>Kritis</option>
							</select>
							<ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
						</div>
					</div>
				</div>

				<button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 lg:py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap w-full lg:w-auto">
					<PlusIcon className="w-4 h-4" />
					Tambah Barang Baru
				</button>
			</div>

			<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[700px]">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-3.5">Nama Item</th>
								<th className="px-6 py-3.5">Kode SKU</th>
								<th className="px-6 py-3.5">Kategori</th>
								<th className="px-6 py-3.5">Stok Saat Ini</th>
								<th className="px-6 py-3.5">Status</th>
								<th className="px-6 py-3.5 text-right">Update Terakhir</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
							{stockItems.map((item, idx) => (
								<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
									<td className="px-6 py-4">
										<div className="font-semibold text-slate-900">{item.name}</div>
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
											className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
												item.type === "aman"
													? "bg-emerald-50 text-emerald-700 border border-emerald-100"
													: item.type === "menipis"
														? "bg-amber-50 text-amber-700 border border-amber-100"
														: "bg-red-50 text-destructive border border-red-100"
											}`}>
											{item.type === "aman" && (
												<CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-600" />
											)}
											{item.type === "menipis" && (
												<AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
											)}
											{item.type === "kritis" && (
												<AlertCircleIcon className="w-3.5 h-3.5 text-destructive" />
											)}
											{item.status}
										</span>
									</td>

									<td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
										{item.lastUpdate}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
					<span className="text-xs text-slate-500 font-medium text-center sm:text-left">
						Menampilkan <span className="font-bold text-slate-700">4</span> dari{" "}
						<span className="font-bold text-slate-700">1,248</span> item
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
		</div>
	);
}
