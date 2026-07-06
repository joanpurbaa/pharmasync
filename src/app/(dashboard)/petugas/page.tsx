import {
	TruckIcon,
	UserCheckIcon,
	ShieldAlertIcon,
	ChevronRightIcon,
} from "lucide-react";
import type { StatCard, SopirLog, KendaraanLog } from "@/app/types/Petugas";

const statsData: StatCard[] = [
	{ label: "TOTAL SOPIR", value: "12", desc: "Sopir Terdaftar" },
	{ label: "SOPIR AKTIF", value: "10", desc: "Sedang Bertugas" },
	{ label: "TOTAL KENDARAAN", value: "8", desc: "Unit Armada" },
	{
		label: "DALAM PERAWATAN",
		value: "1",
		desc: "Merespon Tindakan",
		isWarning: true,
	},
];

const sopirLogs: SopirLog[] = [
	{
		nama: "Asep Saputra",
		sim: "SIM B1 • 12390123",
		kontak: "0812-990-xxx",
		unit: "B 1234 ABC",
		type: "assigned",
	},
	{
		nama: "Budi Santoso",
		sim: "SIM A • 99201382",
		kontak: "0878-112-xxx",
		unit: "Tersedia",
		type: "available",
	},
	{
		nama: "Dani Setiawan",
		sim: "SIM B2 • 88273615",
		kontak: "0821-443-xxx",
		unit: "D 4567 DEF",
		type: "assigned",
	},
	{
		nama: "Eko Prasetyo",
		sim: "SIM B1 • 33219845",
		kontak: "0813-221-xxx",
		unit: "B 8890 GHJ",
		type: "assigned",
	},
];

const kendaraanLogs: KendaraanLog[] = [
	{
		plat: "B 1234 ABC",
		model: "Toyota Hino 300",
		jenis: "Cold-Chain",
		sopir: "Asep Saputra",
		status: "Digunakan",
		type: "active",
	},
	{
		plat: "D 4567 DEF",
		model: "Isuzu Giga FVR",
		jenis: "Kargo Kering",
		sopir: "Dani Setiawan",
		status: "Tersedia",
		type: "available",
	},
	{
		plat: "B 8890 GHJ",
		model: "Mitsubishi L300",
		jenis: "Kargo Kering",
		sopir: "Eko Prasetyo",
		status: "Digunakan",
		type: "active",
	},
	{
		plat: "F 1122 KLM",
		model: "Toyota Dyna",
		jenis: "Cold-Chain",
		sopir: "-",
		status: "Perawatan",
		type: "maintenance",
	},
];

export default function Petugas() {
	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-xl font-bold tracking-tight text-slate-900">
						Petugas &amp; Armada
					</h1>
					<p className="text-sm text-slate-500 font-medium">
						Kelola pengemudi dan unit kendaraan pengiriman Rantai Pasok.
					</p>
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
					<button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
						Tambah Kendaraan
					</button>
					<button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap">
						Tambah Sopir
					</button>
				</div>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{statsData.map((stat, idx) => {
					const Icon =
						idx === 3 ? ShieldAlertIcon : idx === 2 ? TruckIcon : UserCheckIcon;
					return (
						<div
							key={idx}
							className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between">
							<div className="flex items-start justify-between">
								<span className="text-sm font-medium text-slate-500">{stat.label}</span>
								<div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 shrink-0">
									<Icon
										className={`w-4 h-4 ${stat.isWarning ? "text-red-500" : "text-slate-600"}`}
									/>
								</div>
							</div>
							<div className="mt-4">
								<span
									className={`text-3xl font-bold tracking-tight ${stat.isWarning ? "text-red-600" : "text-slate-900"}`}>
									{stat.value}
								</span>
								<p className="text-xs mt-1 font-medium text-slate-400 line-clamp-1">
									{stat.desc}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
				<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div>
						<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
							<h3 className="text-sm font-bold text-slate-900">Daftar Sopir</h3>
							<button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
								Lihat Semua Laporan
								<ChevronRightIcon className="w-3.5 h-3.5" />
							</button>
						</div>
						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse min-w-[450px]">
								<thead>
									<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
										<th className="px-6 py-3.5">Nama / No. SIM</th>
										<th className="px-6 py-3.5">Kontak</th>
										<th className="px-6 py-3.5">Kendaraan</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
									{sopirLogs.map((sopir, idx) => (
										<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
											<td className="px-6 py-4">
												<div className="font-semibold text-slate-900">{sopir.nama}</div>
												<div className="text-xs text-slate-400 mt-0.5">{sopir.sim}</div>
											</td>
											<td className="px-6 py-4 text-slate-500 font-medium">
												{sopir.kontak}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
														sopir.type === "available"
															? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
															: "bg-blue-50 text-blue-700 border border-blue-100/50"
													}`}>
													{sopir.unit}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
						<span className="text-xs text-slate-400 font-medium">
							Menampilkan{" "}
							<span className="text-slate-700 font-semibold">{sopirLogs.length}</span>{" "}
							dari <span className="text-slate-700 font-semibold">12</span> petugas
						</span>
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div>
						<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
							<h3 className="text-sm font-bold text-slate-900">Daftar Kendaraan</h3>
							<button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
								Lihat Semua Laporan
								<ChevronRightIcon className="w-3.5 h-3.5" />
							</button>
						</div>
						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse min-w-[450px]">
								<thead>
									<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
										<th className="px-6 py-3.5">Plat / Jenis</th>
										<th className="px-6 py-3.5">Sopir</th>
										<th className="px-6 py-3.5">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
									{kendaraanLogs.map((unit, idx) => (
										<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
											<td className="px-6 py-4">
												<div className="font-semibold text-slate-900">{unit.plat}</div>
												<div className="text-xs text-slate-400 mt-0.5">
													{unit.model} &bull; {unit.jenis}
												</div>
											</td>
											<td className="px-6 py-4 text-slate-500 font-medium">
												{unit.sopir}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
														unit.type === "available"
															? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
															: unit.type === "maintenance"
																? "bg-amber-50 text-amber-700 border border-amber-100/50"
																: "bg-blue-50 text-blue-700 border border-blue-100/50"
													}`}>
													{unit.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
						<span className="text-xs text-slate-400 font-medium">
							Menampilkan{" "}
							<span className="text-slate-700 font-semibold">
								{kendaraanLogs.length}
							</span>{" "}
							dari <span className="text-slate-700 font-semibold">8</span> armada aktif
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
