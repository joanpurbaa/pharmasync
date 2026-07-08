"use client";

import {
	SearchIcon,
	PlusIcon,
	SlidersHorizontalIcon,
	FileTextIcon,
	ClockIcon,
	TruckIcon,
	CheckCircle2Icon,
	MapPinIcon,
	MoreVerticalIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	NavigationIcon,
} from "lucide-react";
import { ActivityLog, DeliveryCard, ShippingItem } from "@/app/types/Distribusi";
import { useDistribusiStore } from "@/store/useDistribusiStore";


const deliveryCards: DeliveryCard[] = [
	{
		title: "Dijadwalkan",
		value: "24",
		change: "+12%",
		trend: "up",
		icon: ClockIcon,
		color: "text-blue-600 bg-blue-50",
	},
	{
		title: "Dalam Perjalanan",
		value: "18",
		change: "+5%",
		trend: "up",
		icon: TruckIcon,
		color: "text-amber-600 bg-amber-50",
	},
	{
		title: "Selesai (Hari Ini)",
		value: "42",
		change: "Stable",
		trend: "neutral",
		icon: CheckCircle2Icon,
		color: "text-emerald-600 bg-emerald-50",
	},
	{
		title: "Driver Aktif",
		value: "12",
		change: "",
		trend: "",
		icon: MapPinIcon,
		color: "text-purple-600 bg-purple-50",
	},
];

const shippingList: ShippingItem[] = [
	{
		item: "Vaksin Pfizer Comirnaty",
		id: "#TRX-99201-B",
		qty: "500 Vial",
		destination: "Klinik Sehat Utama - Jakarta",
		schedule: "24 Okt 2026",
		time: "09:00 WIB",
		driver: "Andi Wijaya",
		vehicle: "ColdBox Van (B 1234 ABC)",
		status: "Dikirim",
		statusType: "shipping",
	},
	{
		item: "Paracetamol 500mg (Box)",
		id: "#TRX-99202-A",
		qty: "200 Box",
		destination: "RSIA Bunda Harapan",
		schedule: "25 Okt 2026",
		time: "08:00 WIB",
		driver: "Budi Santoso",
		vehicle: "L300 Cargo (B 5678 XYZ)",
		status: "Dijadwalkan",
		statusType: "scheduled",
	},
	{
		item: "Alat Bedah Steril (Set)",
		id: "#TRX-99198-S",
		qty: "15 Set",
		destination: "Puskesmas Tebet Barat",
		schedule: "24 Okt 2026",
		time: "06:30 WIB",
		driver: "Siti Aminah",
		vehicle: "HiAce Med-Log (B 9901 QR)",
		status: "Selesai",
		statusType: "success",
	},
	{
		item: "Insulin Pen 3ml",
		id: "#TRX-99205-C",
		qty: "100 Pcs",
		destination: "Klinik Kimia Farma Depok",
		schedule: "26 Okt 2026",
		time: "10:00 WIB",
		driver: "Rahmat Hidayat",
		vehicle: "ColdBox Van (B 3322 CC)",
		status: "Dijadwalkan",
		statusType: "scheduled",
	},
];

const activityLogs: ActivityLog[] = [
	{
		title: "Pengiriman Selesai",
		desc: "Vaksin Sinovac tiba di Puskesmas Grogol",
		time: "10 Menit yang lalu",
		type: "success",
	},
	{
		title: "Driver Berangkat",
		desc: "Andi Wijaya memulai rute #TRX-99201-B",
		time: "2 Jam yang lalu",
		type: "shipping",
	},
	{
		title: "Jadwal Diperbarui",
		desc: "Pengiriman RSIA Bunda dimajukan ke 08:00 WIB",
		time: "4 Jam yang lalu",
		type: "update",
	},
];

export default function Distribusi() {
  const searchQuery = useDistribusiStore((state) => state.searchQuery);
  const setSearchQuery = useDistribusiStore((state) => state.setSearchQuery);

	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6 bg-slate-50/50">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<span className="text-[10px] sm:text-xs font-medium text-slate-400 block uppercase tracking-wider">
						Manajemen Logistik & Rantai Pasok
					</span>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
						Daftar Pengiriman Aktif
					</h1>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
						<input
							type="text"
							placeholder="Cari No. Resi..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400 transition-all"
						/>
					</div>

					<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap">
						<PlusIcon className="w-4 h-4 text-white" />
						Buat Pengiriman Baru
					</button>
				</div>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{deliveryCards.map((card, idx) => {
					const Icon = card.icon;
					return (
						<div
							key={idx}
							className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between">
							<div className="flex items-start justify-between">
								<span className="text-sm font-medium text-slate-500">{card.title}</span>
								<div className={`p-2 rounded-lg ${card.color} shrink-0`}>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-4 flex items-baseline gap-2">
								<span className="text-3xl font-bold tracking-tight text-slate-900">
									{card.value}
								</span>
								{card.change && (
									<span
										className={`text-xs font-semibold ${
											card.trend === "up" ? "text-emerald-600" : "text-slate-400"
										}`}>
										{card.change}
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-50/40">
					<div className="flex gap-2 justify-start">
						<button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm flex-1 sm:flex-initial">
							<SlidersHorizontalIcon className="w-3.5 h-3.5" />
							Filter
						</button>
						<button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex-1 sm:flex-initial">
							<FileTextIcon className="w-3.5 h-3.5" />
							Export PDF
						</button>
					</div>
					<span className="text-xs text-slate-400 font-medium text-center sm:text-right">
						Menampilkan <span className="text-slate-700 font-semibold">1-10</span>{" "}
						dari 84 pengiriman
					</span>
				</div>

				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[900px]">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-3.5">Item & No. Resi</th>
								<th className="px-6 py-3.5">Jumlah</th>
								<th className="px-6 py-3.5">Klinik Tujuan</th>
								<th className="px-6 py-3.5">Jadwal Pengiriman</th>
								<th className="px-6 py-3.5">Driver & Kendaraan</th>
								<th className="px-6 py-3.5">Status</th>
								<th className="px-6 py-3.5 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
							{shippingList.map((row, idx) => (
								<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
									<td className="px-6 py-4">
										<div className="font-semibold text-slate-900">{row.item}</div>
										<div className="text-xs font-mono text-slate-400 mt-0.5">
											{row.id}
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded">
											{row.qty}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-1.5 text-slate-800 font-medium">
											<MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											{row.destination}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="font-medium text-slate-900">{row.schedule}</div>
										<div className="text-xs text-slate-400 mt-0.5">{row.time}</div>
									</td>
									<td className="px-6 py-4">
										<div className="font-medium text-slate-900">{row.driver}</div>
										<div className="text-xs text-slate-400 mt-0.5">{row.vehicle}</div>
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
												row.statusType === "shipping"
													? "bg-blue-50 text-blue-700 border border-blue-100"
													: row.statusType === "scheduled"
														? "bg-amber-50 text-amber-700 border border-amber-100"
														: "bg-emerald-50 text-emerald-700 border border-emerald-100"
											}`}>
											{row.status}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										<button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
											<MoreVerticalIcon className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="p-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 bg-white">
					<div className="inline-flex items-center gap-1.5">
						<button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50">
							<ChevronLeftIcon className="w-4 h-4" />
						</button>
						<button className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-900 text-white">
							1
						</button>
						<button className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
							2
						</button>
						<button className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
							3
						</button>
						<button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
							<ChevronRightIcon className="w-4 h-4" />
						</button>
					</div>

					<div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 font-medium w-full sm:w-auto">
						<span>Baris per halaman:</span>
						<select className="bg-white border border-slate-200 rounded px-1.5 py-1 font-semibold text-slate-700 focus:outline-none">
							<option>10</option>
							<option>25</option>
							<option>50</option>
						</select>
					</div>
				</div>
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				<div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div className="p-4 border-b border-slate-100 flex items-center justify-between">
						<h2 className="text-sm font-bold text-slate-900">Monitoring Real-time</h2>
						<span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							Live
						</span>
					</div>

					<div className="bg-slate-100/70 h-64 relative flex items-center justify-center p-4 overflow-hidden border-b border-slate-100 pattern-grid">
						<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>

						<svg
							className="absolute inset-0 w-full h-full text-blue-300 stroke-current"
							fill="none"
							strokeWidth="2"
							strokeDasharray="4 4">
							<path d="M 50 180 Q 200 80 400 150 T 700 90" />
						</svg>

						<div className="absolute left-1/3 top-1/3 z-10 flex flex-col items-center">
							<span className="relative flex h-4 w-4">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow flex items-center justify-center">
									<NavigationIcon className="w-1.5 h-1.5 text-white transform rotate-45" />
								</span>
							</span>
						</div>

						<div className="absolute bottom-3 left-3 bg-white border border-slate-200 p-3 rounded-lg shadow-md max-w-[240px] sm:max-w-xs z-20">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-slate-900"></div>
								<span className="text-xs font-bold text-slate-900 truncate">
									Armada #04 (B 1234 ABC)
								</span>
							</div>
							<p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
								Menuju:{" "}
								<span className="font-medium text-slate-800">Klinik Sehat Utama</span>{" "}
								<br />
								ETA: <span className="font-semibold text-slate-900">14 Menit</span>
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between">
					<div>
						<div className="p-4 border-b border-slate-100">
							<h2 className="text-sm font-bold text-slate-900">
								Log Aktivitas Terbaru
							</h2>
						</div>

						<div className="p-4 space-y-4">
							{activityLogs.map((log, idx) => (
								<div key={idx} className="flex gap-3 items-start text-xs">
									<div
										className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
											log.type === "success"
												? "bg-emerald-500"
												: log.type === "shipping"
													? "bg-blue-500"
													: "bg-amber-500"
										}`}
									/>
									<div className="flex-1 space-y-0.5">
										<div className="flex justify-between gap-2 items-center">
											<span className="font-bold text-slate-900">{log.title}</span>
											<span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
												{log.time}
											</span>
										</div>
										<p className="text-slate-500 leading-relaxed">{log.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="p-3 border-t border-slate-100">
						<button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200/60 transition-colors">
							Lihat Semua Riwayat
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
