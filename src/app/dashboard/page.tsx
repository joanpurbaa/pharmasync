"use client";

import React from "react";
import {
	PackageIcon,
	AlertTriangleIcon,
	TruckIcon,
	HistoryIcon,
	FileTextIcon,
	MoreVerticalIcon,
	CircleIcon,
	CheckCircle2Icon,
} from "lucide-react";

const statsData = [
	{
		title: "Total Item Obat",
		value: "1,240",
		change: "+2.4% vs bulan lalu",
		isPositive: true,
		icon: PackageIcon,
		iconColor: "text-blue-600 bg-blue-50",
	},
	{
		title: "Stok Kritis",
		value: "12",
		change: "Memerlukan tindakan segera",
		isPositive: false,
		icon: AlertTriangleIcon,
		iconColor: "text-destructive bg-destructive/10",
	},
	{
		title: "Pengiriman Hari Ini",
		value: "8",
		change: "5 Selesai, 3 Dalam Proses",
		isPositive: true,
		icon: TruckIcon,
		iconColor: "text-orange-600 bg-orange-50",
	},
	{
		title: "Aktivitas Terakhir",
		value: "5m ago",
		change: "Budi merubah stok Paracetamol",
		isPositive: true,
		icon: HistoryIcon,
		iconColor: "text-purple-600 bg-purple-50",
	},
];

const criticalStockData = [
	{
		name: "Amoxicillin 500mg",
		category: "Antibiotik",
		sku: "AMX-500-KL",
		stock: "12 Unit",
		status: "Stok Kritis",
		type: "kritis",
	},
	{
		name: "Paracetamol Sirup",
		category: "Antipiretik",
		sku: "PCT-SYR-02",
		stock: "45 Unit",
		status: "Stok Menipis",
		type: "menipis",
	},
	{
		name: "Insulin Pen",
		category: "Hormon",
		sku: "INS-PEN-09",
		stock: "8 Unit",
		status: "Stok Kritis",
		type: "kritis",
	},
	{
		name: "Alcohol Swabs",
		category: "Medis Dasar",
		sku: "ALC-SWB-BX",
		stock: "120 Unit",
		status: "Stok Menipis",
		type: "menipis",
	},
	{
		name: "Omeprazole 20mg",
		category: "Gastro",
		sku: "OME-020-CR",
		stock: "15 Unit",
		status: "Stok Kritis",
		type: "kritis",
	},
];

const activitiesData = [
	{
		title: "Update Stok",
		time: "5m yang lalu",
		user: "Budi",
		detail: "merubah stok Paracetamol",
		highlight: "+50",
		isLatest: true,
	},
	{
		title: "Barang Keluar",
		time: "12m yang lalu",
		user: "Siska",
		detail: "memproses pengiriman 20 box Masker Bedah ke Poliklinik A.",
	},
	{
		title: "Stok Opname",
		time: "45m yang lalu",
		user: "Admin Utama",
		detail: "Pemeriksaan stok rutin selesai dilakukan di Gudang B.",
	},
	{
		title: "Alert Sistem",
		time: "1j yang lalu",
		detail: "Stok ",
		boldDetail: "Amoxicillin",
		extraDetail: " mencapai batas kritis, sistem otomatis membuat draf pesanan.",
	},
	{
		title: "Barang Masuk",
		time: "3j yang lalu",
		detail: "Penerimaan ",
		boldDetail: "500 Box",
		extraDetail: " Jarum Suntik dari Supplier MedTech.",
	},
	{
		title: "Login Baru",
		time: "4j yang lalu",
		detail:
			"Sesi baru dimulai dari perangkat Windows di Alamat IP: 192.168.1.45.",
	},
];

export default function Dashboard() {
	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<h1 className="text-xl font-semibold tracking-tight text-slate-900">
					Overview Dashboard
				</h1>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{statsData.map((stat, idx) => {
					const Icon = stat.icon;
					return (
						<div
							key={idx}
							className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between">
							<div className="flex items-start justify-between">
								<span className="text-sm font-medium text-slate-500">{stat.title}</span>
								<div className={`p-2 rounded-lg ${stat.iconColor} shrink-0`}>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-4">
								<span className="text-3xl font-bold tracking-tight text-slate-900">
									{stat.value}
								</span>
								<p
									className={`text-xs mt-1 font-medium ${
										stat.isPositive && !stat.title.includes("Kritis")
											? "text-emerald-600"
											: "text-slate-400"
									}`}>
									{stat.change}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
				<div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div>
						<div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-slate-100">
							<div>
								<h2 className="text-base font-semibold text-slate-900">
									Stok Menipis & Kritis
								</h2>
								<p className="text-xs text-slate-500 mt-0.5">
									Daftar item medis di bawah batas aman minimum.
								</p>
							</div>
							<button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm w-full sm:w-auto">
								<FileTextIcon className="w-3.5 h-3.5" />
								Export PDF
							</button>
						</div>

						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse min-w-[500px]">
								<thead>
									<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
										<th className="px-5 py-3">Nama Item</th>
										<th className="px-5 py-3">SKU</th>
										<th className="px-5 py-3">Stok</th>
										<th className="px-5 py-3 text-right">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
									{criticalStockData.map((item, idx) => (
										<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
											<td className="px-5 py-3.5">
												<div className="font-medium text-slate-900">{item.name}</div>
												<div className="text-xs text-slate-400 mt-0.5">
													Kategori: {item.category}
												</div>
											</td>
											<td className="px-5 py-3.5 font-mono text-xs text-slate-500">
												{item.sku}
											</td>
											<td
												className={`px-5 py-3.5 font-semibold ${
													item.type === "kritis" ? "text-destructive" : "text-amber-600"
												}`}>
												{item.stock}
											</td>
											<td className="px-5 py-3.5 text-right">
												<span
													className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
														item.type === "kritis"
															? "bg-red-50 text-destructive border border-red-100"
															: "bg-amber-50 text-amber-700 border border-amber-100"
													}`}>
													{item.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
						<button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
							Lihat Semua Laporan Stok
						</button>
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between h-full">
					<div>
						<div className="p-5 flex items-center justify-between border-b border-slate-100">
							<h2 className="text-base font-semibold text-slate-900">
								Aktivitas Terbaru
							</h2>
							<button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
								<MoreVerticalIcon className="w-4 h-4" />
							</button>
						</div>

						<div className="p-5 space-y-5 relative before:absolute before:top-6 before:bottom-6 before:left-[25px] sm:before:left-[27px] before:w-0.5 before:bg-slate-100">
							{activitiesData.map((activity, idx) => (
								<div key={idx} className="flex gap-4 relative items-start">
									<div className="bg-white z-10 p-0.5 rounded-full mt-0.5 shrink-0">
										{activity.isLatest ? (
											<CheckCircle2Icon className="w-4 h-4 text-slate-900 bg-white rounded-full shadow-sm" />
										) : (
											<CircleIcon className="w-3 h-3 text-slate-300 fill-white" />
										)}
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
											<span className="text-xs font-semibold text-slate-900">
												{activity.title}
											</span>
											<span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
												{activity.time}
											</span>
										</div>
										<p className="text-xs text-slate-600 leading-relaxed">
											{activity.user && (
												<span className="font-medium text-slate-900">{activity.user} </span>
											)}
											{activity.detail}
											{activity.boldDetail && (
												<span className="font-semibold text-slate-900">
													{activity.boldDetail}
												</span>
											)}
											{activity.extraDetail && <span>{activity.extraDetail}</span>}
											{activity.highlight && (
												<span className="ml-1 px-1 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] rounded font-bold inline-block">
													{activity.highlight}
												</span>
											)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="p-4 border-t border-slate-100">
						<button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/60 transition-colors">
							Buka Riwayat Lengkap
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
