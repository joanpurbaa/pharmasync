"use client";

import React, { useEffect, useState } from "react";
import { XIcon, SearchIcon } from "lucide-react";

interface ItemOption {
	id: string;
	name: string;
	sku: string;
}

interface ReceiveStockModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	presetItem?: ItemOption | null;
}

export default function ReceiveStockModal({
	isOpen,
	onClose,
	onSuccess,
	presetItem = null,
}: ReceiveStockModalProps) {
	const [selectedItem, setSelectedItem] = useState<ItemOption | null>(
		presetItem,
	);
	const [itemSearch, setItemSearch] = useState("");
	const [searchResults, setSearchResults] = useState<ItemOption[]>([]);
	const [showResults, setShowResults] = useState(false);

	const [formData, setFormData] = useState({
		batchNumber: "",
		expiryDate: "",
		quantityReceived: "",
		vendorName: "",
		note: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!itemSearch) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSearchResults([]);
			return;
		}
		const timeout = setTimeout(async () => {
			const response = await fetch(
				`/api/items?search=${encodeURIComponent(itemSearch)}`,
			);
			const data = await response.json();
			setSearchResults(data.items ?? []);
		}, 300);
		return () => clearTimeout(timeout);
	}, [itemSearch]);

	if (!isOpen) return null;

	const resetForm = () => {
		setFormData({
			batchNumber: "",
			expiryDate: "",
			quantityReceived: "",
			vendorName: "",
			note: "",
		});
		setSelectedItem(presetItem);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const isExpiryTooSoon =
		formData.expiryDate && new Date(formData.expiryDate) < new Date();

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedItem) return;
		setIsSubmitting(true);
		setErrorMessage(null);
		try {
			const response = await fetch(`/api/items/${selectedItem.id}/batches`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				setErrorMessage(data.error ?? "Gagal menyimpan barang masuk");
				return;
			}

			resetForm();
			onSuccess?.();
			onClose();
		} catch {
			setErrorMessage("Terjadi kesalahan jaringan");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			<div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				<div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
					<div>
						<h2 className="text-base font-semibold text-slate-900">
							Terima Barang Masuk
						</h2>
						<p className="text-xs text-slate-400 font-medium mt-0.5">
							Catat batch baru dari vendor/supplier ke gudang.
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
						<XIcon className="w-4 h-4" />
					</button>
				</div>

				<form
					onSubmit={handleFormSubmit}
					className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
					{errorMessage && (
						<div className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg">
							{errorMessage}
						</div>
					)}

					{!presetItem && (
						<div className="flex flex-col space-y-1 relative">
							<label className="text-xs font-semibold text-slate-500">
								Item <span className="text-red-500">*</span>
							</label>
							{selectedItem ? (
								<div className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
									<div>
										<div className="text-sm font-medium text-slate-800">
											{selectedItem.name}
										</div>
										<div className="text-xs font-mono text-slate-400">
											{selectedItem.sku}
										</div>
									</div>
									<button
										type="button"
										onClick={() => setSelectedItem(null)}
										className="text-xs text-slate-400 hover:text-slate-700">
										Ganti
									</button>
								</div>
							) : (
								<div className="relative">
									<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
									<input
										type="text"
										placeholder="Cari SKU atau nama item..."
										value={itemSearch}
										onChange={(e) => setItemSearch(e.target.value)}
										onFocus={() => setShowResults(true)}
										className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
									/>
									{showResults && itemSearch && (
										<div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
											{searchResults.map((item) => (
												<button
													type="button"
													key={item.id}
													onClick={() => {
														setSelectedItem(item);
														setShowResults(false);
														setItemSearch("");
													}}
													className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
													<div className="font-medium text-slate-800">{item.name}</div>
													<div className="text-xs font-mono text-slate-400">{item.sku}</div>
												</button>
											))}
											{searchResults.length === 0 && (
												<div className="px-3 py-2 text-xs text-slate-400">
													Item tidak ditemukan. Daftarkan lewat &quot;Tambah Item Baru&quot;
													dulu.
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col space-y-1">
							<label className="text-xs font-semibold text-slate-500">
								Nomor Batch <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="batchNumber"
								required
								placeholder="Contoh: PRC-2027-06"
								value={formData.batchNumber}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800"
							/>
						</div>
						<div className="flex flex-col space-y-1">
							<label className="text-xs font-semibold text-slate-500">
								Tanggal Kadaluarsa <span className="text-red-500">*</span>
							</label>
							<input
								type="date"
								name="expiryDate"
								required
								value={formData.expiryDate}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800"
							/>
							{isExpiryTooSoon && (
								<p className="text-[11px] text-red-500 mt-0.5">
									Tanggal ini sudah lewat — periksa kembali sebelum disimpan.
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col space-y-1">
							<label className="text-xs font-semibold text-slate-500">
								Jumlah Diterima <span className="text-red-500">*</span>
							</label>
							<input
								type="number"
								name="quantityReceived"
								required
								min="1"
								placeholder="0"
								value={formData.quantityReceived}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800"
							/>
						</div>
						<div className="flex flex-col space-y-1">
							<label className="text-xs font-semibold text-slate-500">
								Vendor / Supplier
							</label>
							<input
								type="text"
								name="vendorName"
								placeholder="Contoh: Medika Jaya"
								value={formData.vendorName}
								onChange={handleInputChange}
								className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800"
							/>
						</div>
					</div>

					<div className="flex flex-col space-y-1">
						<label className="text-xs font-semibold text-slate-500">
							Catatan (opsional)
						</label>
						<textarea
							name="note"
							rows={2}
							placeholder="Nomor PO, kondisi barang saat diterima, dll..."
							value={formData.note}
							onChange={handleInputChange}
							className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800 resize-none"
						/>
					</div>

					<div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
							Batal
						</button>
						<button
							type="submit"
							disabled={!selectedItem || isSubmitting}
							className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50">
							{isSubmitting ? "Menyimpan..." : "Simpan Barang Masuk"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
