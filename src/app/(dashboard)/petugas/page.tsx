"use client";

import { useEffect, useState } from "react";
import { TruckIcon, UserCheckIcon, ShieldAlertIcon } from "lucide-react";
import type { StatCard } from "@/app/types/Petugas";
import { usePetugasStore } from "@/store/usePetugasStore";
import AddDriverModal from "@/components/modal/AddDriverModal";
import AddVehicleModal from "@/components/modal/AddVehicleModal";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getPageNumbers(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	const pages: (number | "ellipsis")[] = [];
	const delta = 1;
	for (let i = 1; i <= total; i++) {
		if (
			i === 1 ||
			i === total ||
			(i >= current - delta && i <= current + delta)
		) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== "ellipsis") {
			pages.push("ellipsis");
		}
	}
	return pages;
}

export default function Petugas() {
	const summary = usePetugasStore((state) => state.summary);
	const sopirLogs = usePetugasStore((state) => state.sopirLogs);
	const kendaraanLogs = usePetugasStore((state) => state.kendaraanLogs);
	const sopirPagination = usePetugasStore((state) => state.sopirPagination);
	const kendaraanPagination = usePetugasStore(
		(state) => state.kendaraanPagination,
	);
	const sopirPage = usePetugasStore((state) => state.sopirPage);
	const sopirPageSize = usePetugasStore((state) => state.sopirPageSize);
	const kendaraanPage = usePetugasStore((state) => state.kendaraanPage);
	const kendaraanPageSize = usePetugasStore((state) => state.kendaraanPageSize);
	const isLoading = usePetugasStore((state) => state.isLoading);
	const setSopirPage = usePetugasStore((state) => state.setSopirPage);
	const setSopirPageSize = usePetugasStore((state) => state.setSopirPageSize);
	const setKendaraanPage = usePetugasStore((state) => state.setKendaraanPage);
	const setKendaraanPageSize = usePetugasStore(
		(state) => state.setKendaraanPageSize,
	);
	const fetchAll = usePetugasStore((state) => state.fetchAll);
	const fetchDrivers = usePetugasStore((state) => state.fetchDrivers);
	const fetchVehicles = usePetugasStore((state) => state.fetchVehicles);
	const fetchSummary = usePetugasStore((state) => state.fetchSummary);
	const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
	const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

	useEffect(() => {
		fetchAll();
	}, [sopirPage, sopirPageSize, kendaraanPage, kendaraanPageSize, fetchAll]);

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
					desc: "Unit Kendaraan",
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
						Petugas &amp; Kendaraan
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
					<div className="p-4 bg-white border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-4 order-2 lg:order-1">
							<span className="text-xs text-slate-500 font-medium text-center sm:text-left">
								Menampilkan{" "}
								<span className="font-bold text-slate-700">{sopirLogs.length}</span>{" "}
								dari{" "}
								<span className="font-bold text-slate-700">
									{sopirPagination?.totalItems ?? 0}
								</span>{" "}
								sopir
							</span>

							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-slate-500 whitespace-nowrap">
									Baris per halaman
								</span>
								<Select
									value={String(sopirPageSize)}
									onValueChange={(value) => setSopirPageSize(Number(value))}>
									<SelectTrigger className="h-8 w-[72px] text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PAGE_SIZE_OPTIONS.map((size) => (
											<SelectItem key={size} value={String(size)}>
												{size}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<Pagination className="order-1 lg:order-2 mx-0 w-auto">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (sopirPagination && sopirPagination.page > 1)
												setSopirPage(sopirPagination.page - 1);
										}}
										className={
											!sopirPagination || sopirPagination.page <= 1
												? "pointer-events-none opacity-50"
												: ""
										}
									/>
								</PaginationItem>

								{sopirPagination &&
									getPageNumbers(sopirPagination.page, sopirPagination.totalPages).map(
										(pageNumber, idx) =>
											pageNumber === "ellipsis" ? (
												<PaginationItem key={`ellipsis-${idx}`}>
													<PaginationEllipsis />
												</PaginationItem>
											) : (
												<PaginationItem key={pageNumber}>
													<PaginationLink
														href="#"
														isActive={pageNumber === sopirPagination.page}
														onClick={(e) => {
															e.preventDefault();
															setSopirPage(pageNumber);
														}}>
														{pageNumber}
													</PaginationLink>
												</PaginationItem>
											),
									)}

								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (
												sopirPagination &&
												sopirPagination.page < sopirPagination.totalPages
											)
												setSopirPage(sopirPagination.page + 1);
										}}
										className={
											!sopirPagination ||
											sopirPagination.page >= sopirPagination.totalPages
												? "pointer-events-none opacity-50"
												: ""
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div>
						<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
							<h3 className="text-sm font-bold text-slate-900">Daftar Kendaraan</h3>
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
					<div className="p-4 bg-white border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-4 order-2 lg:order-1">
							<span className="text-xs text-slate-500 font-medium text-center sm:text-left">
								Menampilkan{" "}
								<span className="font-bold text-slate-700">{kendaraanLogs.length}</span>{" "}
								dari{" "}
								<span className="font-bold text-slate-700">
									{kendaraanPagination?.totalItems ?? 0}
								</span>{" "}
								kendaraan
							</span>

							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-slate-500 whitespace-nowrap">
									Baris per halaman
								</span>
								<Select
									value={String(kendaraanPageSize)}
									onValueChange={(value) => setKendaraanPageSize(Number(value))}>
									<SelectTrigger className="h-8 w-[72px] text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PAGE_SIZE_OPTIONS.map((size) => (
											<SelectItem key={size} value={String(size)}>
												{size}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<Pagination className="order-1 lg:order-2 mx-0 w-auto">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (kendaraanPagination && kendaraanPagination.page > 1)
												setKendaraanPage(kendaraanPagination.page - 1);
										}}
										className={
											!kendaraanPagination || kendaraanPagination.page <= 1
												? "pointer-events-none opacity-50"
												: ""
										}
									/>
								</PaginationItem>

								{kendaraanPagination &&
									getPageNumbers(
										kendaraanPagination.page,
										kendaraanPagination.totalPages,
									).map((pageNumber, idx) =>
										pageNumber === "ellipsis" ? (
											<PaginationItem key={`ellipsis-${idx}`}>
												<PaginationEllipsis />
											</PaginationItem>
										) : (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													href="#"
													isActive={pageNumber === kendaraanPagination.page}
													onClick={(e) => {
														e.preventDefault();
														setKendaraanPage(pageNumber);
													}}>
													{pageNumber}
												</PaginationLink>
											</PaginationItem>
										),
									)}

								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (
												kendaraanPagination &&
												kendaraanPagination.page < kendaraanPagination.totalPages
											)
												setKendaraanPage(kendaraanPagination.page + 1);
										}}
										className={
											!kendaraanPagination ||
											kendaraanPagination.page >= kendaraanPagination.totalPages
												? "pointer-events-none opacity-50"
												: ""
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</div>
			</div>

			<AddDriverModal
				isOpen={isAddDriverOpen}
				onClose={() => setIsAddDriverOpen(false)}
				onSuccess={() => {
					setSopirPage(1);
					fetchDrivers();
					fetchSummary();
				}}
			/>
			<AddVehicleModal
				isOpen={isAddVehicleOpen}
				onClose={() => setIsAddVehicleOpen(false)}
				onSuccess={() => {
					setKendaraanPage(1);
					fetchVehicles();
					fetchSummary();
				}}
			/>
		</div>
	);
}
