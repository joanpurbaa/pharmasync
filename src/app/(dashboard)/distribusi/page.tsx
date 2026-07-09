"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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
	MapIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";
import { useDistribusiStore } from "@/store/useDistribusiStore";
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
import AddShipmentModal from "@/components/modal/AddShipmentModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DistribusiMap = dynamic(
	() => import("@/components/modal/DistribusiMap"),
	{
		ssr: false,
		loading: () => (
			<div className="h-64 flex items-center justify-center text-xs text-slate-400">
				Memuat peta...
			</div>
		),
	},
);

const statusStyle: Record<string, string> = {
	DIKIRIM: "bg-blue-50 text-blue-700 border border-blue-100",
	DIJADWALKAN: "bg-amber-50 text-amber-700 border border-amber-100",
	SELESAI: "bg-emerald-50 text-emerald-700 border border-emerald-100",
	DIBATALKAN: "bg-red-50 text-red-700 border border-red-100",
};

const statusLabel: Record<string, string> = {
	DIKIRIM: "Dikirim",
	DIJADWALKAN: "Dijadwalkan",
	SELESAI: "Selesai",
	DIBATALKAN: "Dibatalkan",
};

interface ShippingItemDetail {
	id: string;
	itemId: string;
	quantity: number;
	destinationId: string;
	scheduledAt: string;
	driverId: string | null;
	vehicleId: string | null;
}

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

function formatRelativeTime(dateString: string) {
	const diffMs = Date.now() - new Date(dateString).getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	if (diffMinutes < 60) return `${diffMinutes} Menit yang lalu`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours} Jam yang lalu`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays} Hari yang lalu`;
}

export default function Distribusi() {
	const searchQuery = useDistribusiStore((state) => state.searchQuery);
	const setSearchQuery = useDistribusiStore((state) => state.setSearchQuery);
	const page = useDistribusiStore((state) => state.page);
	const setPage = useDistribusiStore((state) => state.setPage);
	const pageSize = useDistribusiStore((state) => state.pageSize);
	const setPageSize = useDistribusiStore((state) => state.setPageSize);
	const shipments = useDistribusiStore((state) => state.shipments);
	const stats = useDistribusiStore((state) => state.stats);
	const recentActivity = useDistribusiStore((state) => state.recentActivity);
	const pagination = useDistribusiStore((state) => state.pagination);
	const isLoading = useDistribusiStore((state) => state.isLoading);
	const fetchDistribusi = useDistribusiStore((state) => state.fetchDistribusi);

	const selectedShipmentId = useDistribusiStore(
		(state) => state.selectedShipmentId,
	);
	const setSelectedShipmentId = useDistribusiStore(
		(state) => state.setSelectedShipmentId,
	);
	const tracking = useDistribusiStore((state) => state.tracking);
	const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<ShippingItemDetail | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const deleteShipment = useDistribusiStore((state) => state.deleteShipment);
	const mapSectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timeout = setTimeout(fetchDistribusi, 300);
		return () => clearTimeout(timeout);
	}, [searchQuery, page, pageSize, fetchDistribusi]);

	const shippingShipments = shipments.filter((s) => s.status === "DIKIRIM");

	const deliveryCards = [
		{
			title: "Dijadwalkan",
			value: String(stats.scheduled),
			icon: ClockIcon,
			color: "text-blue-600 bg-blue-50",
		},
		{
			title: "Dalam Perjalanan",
			value: String(stats.shipping),
			icon: TruckIcon,
			color: "text-amber-600 bg-amber-50",
		},
		{
			title: "Selesai (Hari Ini)",
			value: String(stats.doneToday),
			icon: CheckCircle2Icon,
			color: "text-emerald-600 bg-emerald-50",
		},
		{
			title: "Driver Aktif",
			value: String(stats.activeDrivers),
			icon: MapPinIcon,
			color: "text-purple-600 bg-purple-50",
		},
	];

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

					<button
						onClick={() => setIsAddShipmentOpen(true)}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap">
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
							<div className="mt-4">
								<span className="text-3xl font-bold tracking-tight text-slate-900">
									{card.value}
								</span>
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
							{isLoading && (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Memuat data...
									</td>
								</tr>
							)}

							{!isLoading && shipments.length === 0 && (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Belum ada pengiriman yang cocok.
									</td>
								</tr>
							)}

							{!isLoading &&
								shipments.map((row) => (
									<tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
										<td className="px-6 py-4">
											<div className="font-semibold text-slate-900">{row.item}</div>
											<div className="text-xs font-mono text-slate-400 mt-0.5">
												{row.code}
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
												className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle[row.status]}`}>
												{statusLabel[row.status]}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<DropdownMenu>
												<DropdownMenuTrigger className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
													<MoreVerticalIcon className="w-4 h-4" />
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-44">
													<DropdownMenuItem
														onClick={() => {
															setSelectedShipmentId(row.id);
															mapSectionRef.current?.scrollIntoView({
																behavior: "smooth",
																block: "start",
															});
														}}>
														<MapIcon className="w-3.5 h-3.5 mr-2" />
														Lihat Peta
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => setEditTarget(row.raw)}>
														<PencilIcon className="w-3.5 h-3.5 mr-2" />
														Edit Pengiriman
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => setDeleteTargetId(row.id)}
														className="text-red-600 focus:text-red-600 focus:bg-red-50">
														<Trash2Icon className="w-3.5 h-3.5 mr-2" />
														Hapus
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				<div className="p-4 bg-white border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-4 order-2 lg:order-1">
						<span className="text-xs text-slate-500 font-medium text-center sm:text-left">
							Menampilkan{" "}
							<span className="font-bold text-slate-700">{shipments.length}</span> dari{" "}
							<span className="font-bold text-slate-700">
								{pagination?.totalItems ?? 0}
							</span>{" "}
							pengiriman
						</span>

						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-slate-500 whitespace-nowrap">
								Baris per halaman
							</span>
							<Select
								value={String(pageSize)}
								onValueChange={(value) => setPageSize(Number(value))}>
								<SelectTrigger className="h-8 w-[72px] text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="25">25</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="100">100</SelectItem>
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
										if (pagination && pagination.page > 1) setPage(pagination.page - 1);
									}}
									className={
										!pagination || pagination.page <= 1
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>

							{pagination &&
								getPageNumbers(pagination.page, pagination.totalPages).map(
									(pageNumber, idx) =>
										pageNumber === "ellipsis" ? (
											<PaginationItem key={`ellipsis-${idx}`}>
												<PaginationEllipsis />
											</PaginationItem>
										) : (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													href="#"
													isActive={pageNumber === pagination.page}
													onClick={(e) => {
														e.preventDefault();
														setPage(pageNumber);
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
										if (pagination && pagination.page < pagination.totalPages)
											setPage(pagination.page + 1);
									}}
									className={
										!pagination || pagination.page >= pagination.totalPages
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				<div
					ref={mapSectionRef}
					className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
					<div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-sm font-bold text-slate-900">Monitoring Real-time</h2>

						{shippingShipments.length > 0 ? (
							<div className="flex items-center gap-2">
								<Select
									value={selectedShipmentId ?? ""}
									onValueChange={(value) => setSelectedShipmentId(value)}>
									<SelectTrigger className="h-7 w-[220px] text-xs">
										<SelectValue placeholder="Pilih pengiriman" />
									</SelectTrigger>
									<SelectContent>
										{shippingShipments.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.code} — {s.destination}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
									Live
								</span>
							</div>
						) : (
							<span className="text-xs text-slate-400 font-medium">
								Tidak ada pengiriman berjalan
							</span>
						)}
					</div>

					<div className="h-64 relative border-b border-slate-100">
						{selectedShipmentId && tracking ? (
							<>
								<DistribusiMap
									destination={tracking.destination}
									route={tracking.route}
								/>
								{tracking.route.length > 0 && (
									<div className="absolute bottom-3 left-3 bg-white border border-slate-200 p-3 rounded-lg shadow-md max-w-[240px] sm:max-w-xs z-[999]">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-slate-900"></div>
											<span className="text-xs font-bold text-slate-900 truncate">
												Menuju {tracking.destination.name}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
											{tracking.destination.address ?? "Alamat belum tersedia"}
										</p>
									</div>
								)}
							</>
						) : (
							<div className="h-full flex items-center justify-center text-xs text-slate-400 bg-slate-50">
								Belum ada pengiriman yang sedang dipantau.
							</div>
						)}
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
							{recentActivity.length === 0 && (
								<p className="text-xs text-slate-400 text-center py-4">
									Belum ada aktivitas.
								</p>
							)}
							{recentActivity.map((log, idx) => (
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
												{formatRelativeTime(log.time)}
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

			<AddShipmentModal
				isOpen={isAddShipmentOpen}
				onClose={() => setIsAddShipmentOpen(false)}
				onSuccess={fetchDistribusi}
			/>

			<AddShipmentModal
				isOpen={editTarget !== null}
				onClose={() => setEditTarget(null)}
				onSuccess={fetchDistribusi}
				editData={editTarget}
			/>

			<AlertDialog
				open={deleteTargetId !== null}
				onOpenChange={(open) => !open && setDeleteTargetId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus pengiriman ini?</AlertDialogTitle>
						<AlertDialogDescription>
							Tindakan ini tidak bisa dibatalkan. Riwayat tracking GPS yang terkait
							juga akan ikut terhapus.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
							onClick={() => {
								if (deleteTargetId) deleteShipment(deleteTargetId);
								setDeleteTargetId(null);
							}}>
							Ya, Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
