"use client";

import React, { useEffect, useState } from "react";
import {
	SearchIcon,
	PlusIcon,
	MapPinIcon,
	PhoneIcon,
	Trash2Icon,
} from "lucide-react";
import AddDestinationModal from "@/components/modal/AddDestinationModal";
import { useMitraStore } from "@/store/useMitraStore";
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

export default function DataMitra() {
	const {
		destinations,
		searchQuery,
		isLoading,
		deleteTargetId,
		deleteError,
		setSearchQuery,
		setDeleteTargetId,
		setDeleteError,
		fetchDestinations,
		deleteMitra,
	} = useMitraStore();

	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchDestinations();
	}, [fetchDestinations]);

	const filteredDestinations = destinations.filter(
		(item) =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(item.address &&
				item.address.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6 bg-slate-50/50">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<span className="text-[10px] sm:text-xs font-medium text-slate-400 block uppercase tracking-wider">
						Manajemen Fasilitas Kesehatan
					</span>
					<h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
						Data Jaringan Mitra / Klinik
					</h1>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
						<input
							type="text"
							placeholder="Cari nama klinik atau alamat..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400 transition-all"
						/>
					</div>

					<button
						onClick={() => setIsModalOpen(true)}
						className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap">
						<PlusIcon className="w-4 h-4 text-white" />
						Tambah Mitra Baru
					</button>
				</div>
			</div>

			<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[800px]">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-3.5">Nama Mitra / Klinik</th>
								<th className="px-6 py-3.5">Alamat Lengkap</th>
								<th className="px-6 py-3.5">No. Telepon / Kontak</th>
								<th className="px-6 py-3.5">Status Lokasi (GPS)</th>
								<th className="px-6 py-3.5 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
							{isLoading && (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Memuat data mitra...
									</td>
								</tr>
							)}

							{!isLoading && filteredDestinations.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Belum ada data klinik yang terdaftar.
									</td>
								</tr>
							)}

							{!isLoading &&
								filteredDestinations.map((mitra) => (
									<tr key={mitra.id} className="hover:bg-slate-50/40 transition-colors">
										<td className="px-6 py-4">
											<div className="font-semibold text-slate-900">{mitra.name}</div>
										</td>
										<td className="px-6 py-4 max-w-xs truncate text-slate-500">
											{mitra.address ? (
												<div className="flex items-center gap-1.5">
													<MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
													<span className="truncate">{mitra.address}</span>
												</div>
											) : (
												<span className="text-slate-300">—</span>
											)}
										</td>
										<td className="px-6 py-4 text-slate-500">
											{mitra.phone ? (
												<div className="flex items-center gap-1.5">
													<PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
													<span>{mitra.phone}</span>
												</div>
											) : (
												<span className="text-slate-300">—</span>
											)}
										</td>
										<td className="px-6 py-4">
											{mitra.latitude !== null && mitra.longitude !== null ? (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
													Koordinat Terbaca
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
													Belum Di-plot
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => {
													setDeleteError(null);
													setDeleteTargetId(mitra.id);
												}}
												className="inline-flex items-center p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
												title="Hapus Mitra">
												<Trash2Icon className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				<div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
					<span className="text-xs text-slate-500 font-medium">
						Total Jaringan:{" "}
						<span className="font-bold text-slate-700">
							{filteredDestinations.length}
						</span>{" "}
						Mitra
					</span>
				</div>
			</div>

			<AddDestinationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={() => {
					fetchDestinations();
				}}
			/>

			<AlertDialog
				open={deleteTargetId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteTargetId(null);
						setDeleteError(null);
					}
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus data mitra ini?</AlertDialogTitle>
						<AlertDialogDescription>
							Tindakan ini tidak bisa dibatalkan. Data mitra akan dihapus secara
							permanen dari sistem.
						</AlertDialogDescription>
						{deleteError && (
							<div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg mt-2 font-medium">
								{deleteError}
							</div>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
							onClick={(e) => {
								e.preventDefault();
								if (deleteTargetId) deleteMitra(deleteTargetId);
							}}>
							Ya, Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
