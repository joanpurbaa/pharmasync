"use client";

import { useCallback, useEffect, useState } from "react";
import {
	TruckIcon,
	UserCheckIcon,
	ShieldAlertIcon,
	ChevronRightIcon,
	ChevronLeftIcon,
} from "lucide-react";
import type {
	StatCard,
	SopirLog,
	KendaraanLog,
	PetugasSummary,
	Pagination,
} from "@/app/types/Petugas";
import AddDriverModal from "@/components/modal/AddDriverModal";
import AddVehicleModal from "@/components/modal/AddVehicleModal";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function Petugas() {
	const [summary, setSummary] = useState<PetugasSummary | null>(null);
	const [sopirLogs, setSopirLogs] = useState<SopirLog[]>([]);
	const [kendaraanLogs, setKendaraanLogs] = useState<KendaraanLog[]>([]);
	const [sopirPagination, setSopirPagination] = useState<Pagination | null>(
		null,
	);
	const [kendaraanPagination, setKendaraanPagination] =
		useState<Pagination | null>(null);
	const [sopirPage, setSopirPage] = useState(1);
	const [sopirPageSize, setSopirPageSize] = useState(10);
	const [kendaraanPage, setKendaraanPage] = useState(1);
	const [kendaraanPageSize, setKendaraanPageSize] = useState(10);
	const [isLoading, setIsLoading] = useState(true);
	const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
	const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

	const fetchSummary = useCallback(async () => {
		const summaryData = await fetch("/api/petugas/summary").then((r) => r.json());
		setSummary(summaryData);
	}, []);

	const fetchDrivers = useCallback(async (page: number, pageSize: number) => {
		const driversData = await fetch(
			`/api/drivers?page=${page}&pageSize=${pageSize}`,
		).then((r) => r.json());
		setSopirLogs(driversData.drivers ?? []);
		setSopirPagination(driversData.pagination ?? null);
	}, []);

	const fetchVehicles = useCallback(async (page: number, pageSize: number) => {
		const vehiclesData = await fetch(
			`/api/vehicles?page=${page}&pageSize=${pageSize}`,
		).then((r) => r.json());
		setKendaraanLogs(vehiclesData.vehicles ?? []);
		setKendaraanPagination(vehiclesData.pagination ?? null);
	}, []);

	const fetchAll = useCallback(async () => {
		setIsLoading(true);
		await Promise.all([
			fetchSummary(),
			fetchDrivers(sopirPage, sopirPageSize),
			fetchVehicles(kendaraanPage, kendaraanPageSize),
		]);
		setIsLoading(false);
	}, [
		fetchSummary,
		fetchDrivers,
		fetchVehicles,
		sopirPage,
		sopirPageSize,
		kendaraanPage,
		kendaraanPageSize,
	]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchAll();
	}, [fetchAll]);

	const statsData: StatCard[] = summary
		? [
				{
					label: "TOTAL SOPIR",
					value: String(summary.totalSopir),
					desc: "Sopir Terdaftar",
				},
				{
					label: "SOPIR AKTIF",
					value: String(summary.sopirAktif),
					desc: "Sedang Bertugas",
				},
				{
					label: "TOTAL KENDARAAN",
					value: String(summary.totalKendaraan),
					desc: "Unit Armada",
				},
				{
					label: "DALAM PERAWATAN",
					value: String(summary.dalamPerawatan),
					desc: "Merespon Tindakan",
					isWarning: summary.dalamPerawatan > 0,
				},
			]
		: [];

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
					<button
						onClick={() => setIsAddVehicleOpen(true)}
						className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
						Tambah Kendaraan
					</button>
					<button
						onClick={() => setIsAddDriverOpen(true)}
						className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap">
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
									{isLoading && (
										<tr>
											<td colSpan={3} className="px-6 py-6 text-center text-slate-400">
												Memuat...
											</td>
										</tr>
									)}
									{!isLoading && sopirLogs.length === 0 && (
										<tr>
											<td colSpan={3} className="px-6 py-6 text-center text-slate-400">
												Belum ada sopir terdaftar.
											</td>
										</tr>
									)}
									{!isLoading &&
										sopirLogs.map((sopir) => (
											<tr
												key={sopir.id}
												className="hover:bg-slate-50/40 transition-colors">
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
					<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="text-xs text-slate-400 font-medium">Tampilkan</span>
							<select
								value={sopirPageSize}
								onChange={(e) => {
									setSopirPageSize(Number(e.target.value));
									setSopirPage(1);
								}}
								className="text-xs font-semibold border border-slate-200 rounded-md px-2 py-1 text-slate-700 bg-white">
								{PAGE_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
							<span className="text-xs text-slate-400 font-medium">
								dari {sopirPagination?.totalItems ?? 0} sopir
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setSopirPage((p) => Math.max(1, p - 1))}
								disabled={!sopirPagination || sopirPagination.page <= 1}
								className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
								<ChevronLeftIcon className="w-3.5 h-3.5" />
							</button>
							<span className="text-xs font-semibold text-slate-600">
								{sopirPagination?.page ?? 1} / {sopirPagination?.totalPages ?? 1}
							</span>
							<button
								onClick={() =>
									setSopirPage((p) =>
										sopirPagination ? Math.min(sopirPagination.totalPages, p + 1) : p,
									)
								}
								disabled={
									!sopirPagination || sopirPagination.page >= sopirPagination.totalPages
								}
								className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
								<ChevronRightIcon className="w-3.5 h-3.5" />
							</button>
						</div>
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
									{isLoading && (
										<tr>
											<td colSpan={3} className="px-6 py-6 text-center text-slate-400">
												Memuat...
											</td>
										</tr>
									)}
									{!isLoading && kendaraanLogs.length === 0 && (
										<tr>
											<td colSpan={3} className="px-6 py-6 text-center text-slate-400">
												Belum ada kendaraan terdaftar.
											</td>
										</tr>
									)}
									{!isLoading &&
										kendaraanLogs.map((unit) => (
											<tr key={unit.id} className="hover:bg-slate-50/40 transition-colors">
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
					<div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="text-xs text-slate-400 font-medium">Tampilkan</span>
							<select
								value={kendaraanPageSize}
								onChange={(e) => {
									setKendaraanPageSize(Number(e.target.value));
									setKendaraanPage(1);
								}}
								className="text-xs font-semibold border border-slate-200 rounded-md px-2 py-1 text-slate-700 bg-white">
								{PAGE_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
							<span className="text-xs text-slate-400 font-medium">
								dari {kendaraanPagination?.totalItems ?? 0} armada
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setKendaraanPage((p) => Math.max(1, p - 1))}
								disabled={!kendaraanPagination || kendaraanPagination.page <= 1}
								className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
								<ChevronLeftIcon className="w-3.5 h-3.5" />
							</button>
							<span className="text-xs font-semibold text-slate-600">
								{kendaraanPagination?.page ?? 1} /{" "}
								{kendaraanPagination?.totalPages ?? 1}
							</span>
							<button
								onClick={() =>
									setKendaraanPage((p) =>
										kendaraanPagination
											? Math.min(kendaraanPagination.totalPages, p + 1)
											: p,
									)
								}
								disabled={
									!kendaraanPagination ||
									kendaraanPagination.page >= kendaraanPagination.totalPages
								}
								className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
								<ChevronRightIcon className="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<AddDriverModal
				isOpen={isAddDriverOpen}
				onClose={() => setIsAddDriverOpen(false)}
				onSuccess={() => {
					setSopirPage(1);
					fetchDrivers(1, sopirPageSize);
					fetchSummary();
				}}
			/>
			<AddVehicleModal
				isOpen={isAddVehicleOpen}
				onClose={() => setIsAddVehicleOpen(false)}
				onSuccess={() => {
					setKendaraanPage(1);
					fetchVehicles(1, kendaraanPageSize);
					fetchSummary();
				}}
			/>
		</div>
	);
}
