"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

interface AddDestinationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (destination: { id: string; name: string }) => void;
}

export default function AddDestinationModal({
	isOpen,
	onClose,
	onSuccess,
}: AddDestinationModalProps) {
	const [name, setName] = useState("");
	const [mapsLink, setMapsLink] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) return null;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (!name || !mapsLink) {
			setError("Nama klinik dan link Google Maps wajib diisi");
			return;
		}

		setIsSubmitting(true);
		const response = await fetch("/api/destinations", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name,
				mapsLink,
				address: address || null,
				phone: phone || null,
			}),
		});

		const data = await response.json();
		setIsSubmitting(false);

		if (!response.ok) {
			setError(data.error ?? "Gagal menyimpan klinik");
			return;
		}

		onSuccess(data.destination);

		if (data.destination.latitude == null) {
			setError(
				"Klinik tersimpan, tapi koordinat lokasi tidak ditemukan dari alamat ini. Klinik tetap bisa dipakai, namun belum muncul di peta.",
			);
			return;
		}

		setName("");
		setAddress("");
		setPhone("");
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
			<div className="bg-white rounded-xl shadow-lg w-full max-w-md">
				<div className="flex items-center justify-between p-5 border-b border-slate-100">
					<h2 className="text-base font-bold text-slate-900">Tambah Klinik Baru</h2>
					<button onClick={onClose} className="text-slate-400 hover:text-slate-600">
						<XIcon className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{error && (
						<div className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
							{error}
						</div>
					)}

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-500">Nama Klinik</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Contoh: Klinik Permata Jaya"
							className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-500">
							Link Google Maps
						</label>
						<input
							type="text"
							value={mapsLink}
							onChange={(e) => setMapsLink(e.target.value)}
							placeholder="Tempel link dari tombol Bagikan di Google Maps"
							className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
						/>
						<p className="text-[11px] text-slate-400">
							Buka lokasi klinik di Google Maps → tombol Bagikan → Salin Link, lalu
							tempel di sini.
						</p>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-500">
							Alamat (opsional, buat catatan)
						</label>
						<textarea
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="Contoh: Jalan Soekarno Hatta No.1, Bandung"
							rows={2}
							className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-500">
							No. Telepon (opsional)
						</label>
						<input
							type="text"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Contoh: 022-1234567"
							className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
						/>
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
							Batal
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">
							{isSubmitting ? "Menyimpan..." : "Simpan Klinik"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
