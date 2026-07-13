"use client";

import Image from "next/image";
import Link from "next/link";
import {
	PackageIcon,
	TruckIcon,
	BotIcon,
	Boxes,
	MessageCircleIcon,
	ArrowRightIcon,
	ShieldCheckIcon,
	XCircleIcon,
	CheckCircle2Icon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import PharmasyncMiniDemo from "@/components/PharmasyncMiniDemo";

const WA_LINK = "https://wa.me/6282275338090";

const stats = [
	{ value: "24/7", label: "Monitoring Stok" },
	{ value: "3", label: "Modul Inti Terintegrasi" },
	{ value: "100%", label: "Data Medis Aman & Terpusat" },
];

const oldWay = [
	"Stock-out masih terjadi di 4–7% kasus, meski Permenkes mewajibkan ketersediaan obat minimal 95%",
	"Pelacakan stok manual, rawan human error saat barang masuk maupun dikirim",
	"Tidak ada monitoring real-time, sulit deteksi stok kritis sejak dini",
	"Admin harus buka dashboard kompleks untuk cek data sederhana",
	"Koordinasi antar mitra faskes lambat, rawan delay administratif",
];

const newWay = [
	"Visualisasi gudang 3D dengan indikator Aman, Menipis, dan Kritis secara real-time",
	"Stok terupdate otomatis begitu distribusi sampai tujuan, minim input manual",
	"Monitoring & tracking pengiriman real-time langsung dari peta",
	"Cukup chat via Telegram untuk cek stok, mitra, dan jadwal — tanpa buka dashboard",
	"Data mitra faskes dan distribusi terhubung dalam satu sistem terpusat",
];

type RevealProps = {
	children: ReactNode;
	delay?: number;
	from?: "up" | "left" | "right";
};

function Reveal({ children, delay = 0, from = "up" }: RevealProps) {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const hiddenTransform =
		from === "left"
			? "-translate-x-6"
			: from === "right"
				? "translate-x-6"
				: "translate-y-6";

	return (
		<div
			ref={ref}
			style={{ transitionDelay: `${delay}ms` }}
			className={`transition-all duration-700 ease-out ${
				visible
					? "opacity-100 translate-x-0 translate-y-0"
					: `opacity-0 ${hiddenTransform}`
			}`}>
			{children}
		</div>
	);
}

export default function Home() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div className="min-h-screen w-full bg-white">
			{/* NAVBAR */}
			<div
				className={`fixed top-0 right-0 left-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
					isScrolled ? "px-3 py-2 sm:px-4 sm:py-3 md:px-8" : "px-0 py-0"
				}`}>
				<header
					className={`mx-auto flex items-center justify-between backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
						isScrolled
							? "max-w-3xl rounded-full bg-white/70 px-4 py-2.5 sm:px-6 sm:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] border border-slate-100/80"
							: "max-w-6xl border-b border-slate-100 bg-white/90 px-4 sm:px-6 py-3 sm:py-4"
					}`}>
					<div className="flex items-center gap-1.5 sm:gap-2">
						<Image
							src="/icon.svg"
							alt="Pharmasync"
							width={28}
							height={28}
							className="w-6 h-6 sm:w-7 sm:h-7"
						/>
						<span className="font-bold text-secondary text-base sm:text-lg tracking-tight">
							pharmasync
						</span>
					</div>
					<nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-600">
						<a href="#solusi" className="hover:text-primary transition-colors">
							Solusi
						</a>
						<a href="#perbandingan" className="hover:text-primary transition-colors">
							Perbandingan
						</a>
						<a href="#demo" className="hover:text-primary transition-colors">
							Demo
						</a>
					</nav>
					<Link
						href="/masuk"
						className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors">
						<span className="hidden sm:inline">Masuk ke Dashboard</span>
						<span className="sm:hidden">Masuk</span>
					</Link>
				</header>
			</div>

			{/* HERO */}
			<section className="relative overflow-hidden pt-20 sm:pt-24">
				<div
					className="absolute bottom-72 inset-0"
					style={{
						backgroundImage: `
				linear-gradient(to bottom, rgb(226 232 240) 1px, transparent 1px),
				linear-gradient(to right, rgb(226 232 240) 1px, transparent 1px)
			`,
						backgroundSize: "90px 90px",
						maskImage:
							"linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
					}}
				/>

				<div className="absolute inset-x-0 top-48 flex justify-center">
					<div className="h-80 w-80 rounded-full bg-primary/30 blur-[140px]" />
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-10 text-center">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
						<ShieldCheckIcon className="w-3.5 h-3.5" />
						Supply Chain Management System
					</span>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
						Kelola Rantai Pasok Farmasi Anda dalam{" "}
						<span className="text-primary">Satu Sistem Terpusat</span>
					</h1>
					<p className="text-slate-500 text-sm sm:text-base lg:text-lg mt-5 max-w-xl mx-auto leading-relaxed">
						Dari stok obat, distribusi ke klinik mitra, hingga asisten AI yang siap
						menjawab pertanyaan seputar data — semua terhubung, aman, dan real-time.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
						<Link
							href="/masuk"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors">
							Masuk ke Dashboard
							<ArrowRightIcon className="w-4 h-4" />
						</Link>
						<a
							href={WA_LINK}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-secondary bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors">
							<MessageCircleIcon className="w-4 h-4" />
							Hubungi via WhatsApp
						</a>
					</div>

					<div className="relative mt-16 sm:mt-24 lg:mt-30 mb-10 h-[260px] sm:h-[380px] lg:h-[420px] hidden sm:flex items-end justify-center">
						<div className="absolute left-[4%] sm:left-0 bottom-6 sm:bottom-8 w-[70px] sm:w-sm z-0">
							<Image
								src="/tablet.webp"
								alt="Distribusi Pharmasync di tablet"
								width={1000}
								height={1000}
								className="w-full h-auto drop-shadow-xl"
							/>
						</div>
						<div className="absolute left-1/2 -translate-x-1/2 w-[230px] sm:w-5xl z-10">
							<Image
								src="/laptop.webp"
								alt="Dashboard Pharmasync di laptop"
								width={1000}
								height={1000}
								className="w-full h-auto drop-shadow-2xl"
								priority
							/>
						</div>
						<div className="absolute right-[4%] sm:right-0 bottom-8 w-[55px] sm:w-[250px] z-20">
							<Image
								src="/phone.webp"
								alt="Asisten AI Pharmasync di HP"
								width={300}
								height={520}
								className="w-full h-auto drop-shadow-xl"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* STATS */}
			<section className="border-y border-slate-100 bg-linear-to-br from-primary to-secondary">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 text-center">
					{stats.map((s) => (
						<div key={s.label}>
							<div className="text-2xl sm:text-4xl font-bold text-white">
								{s.value}
							</div>
							<div className="text-xs sm:text-sm text-white font-medium mt-1">
								{s.label}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* KELEBIHAN */}
			<section id="solusi" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
				<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
						<ShieldCheckIcon className="w-3.5 h-3.5" />
						Kenapa Pharmasync
					</span>
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
						Solusi Nyata untuk Masalah Nyata
					</h2>
					<p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
						Dirancang untuk menjawab fenomena stock-out yang masih membebani fasilitas
						kesehatan di Indonesia.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
					<div className="p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
						<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
							<Boxes className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-bold text-slate-900">Visualisasi Gudang 3D</h3>
						<p className="text-sm text-slate-500 mt-2 leading-relaxed">
							Representasi digital interaktif tata letak gudang secara real-time,
							memetakan posisi rak dan memberi indikator visual langsung untuk stok
							yang menipis atau kritis.
						</p>
					</div>

					<div className="p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
						<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
							<BotIcon className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-bold text-slate-900">Asisten AI via Telegram</h3>
						<p className="text-sm text-slate-500 mt-2 leading-relaxed">
							Cek stok, mitra, dan jadwal pengiriman cukup lewat chat — 100% read-only,
							menjaga kepatuhan etika penggunaan AI pada data medis.
						</p>
					</div>

					<div className="p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
						<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
							<TruckIcon className="w-5 h-5 text-primary" />
						</div>
						<h3 className="font-bold text-slate-900">
							Distribusi Otomatis & Real-time
						</h3>
						<p className="text-sm text-slate-500 mt-2 leading-relaxed">
							Stok terupdate otomatis begitu pengiriman sampai tujuan, mengurangi human
							error dan mencegah stock-out di fasilitas kesehatan mitra.
						</p>
					</div>
				</div>
			</section>

			{/* MASALAH VS SOLUSI */}
			<section id="perbandingan" className="bg-slate-50 py-16 sm:py-20 lg:py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
						<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
							Cara Lama vs Dengan Pharmasync
						</h2>
						<p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
							Perbandingan langsung antara manajemen persediaan konvensional dan sistem
							terpusat Pharmasync.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-4 sm:gap-6">
						<Reveal from="left">
							<div className="h-full p-5 sm:p-8 rounded-2xl bg-white border border-red-100">
								<div className="flex items-center gap-2 mb-5 sm:mb-6">
									<span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
										<XCircleIcon className="w-4.5 h-4.5 text-red-500" />
									</span>
									<div>
										<p className="font-bold text-slate-900">Cara Konvensional</p>
										<p className="text-xs text-slate-400">Manual & terfragmentasi</p>
									</div>
								</div>
								<ul className="space-y-3 sm:space-y-4">
									{oldWay.map((item) => (
										<li
											key={item}
											className="flex items-start gap-3 text-sm text-slate-600">
											<XCircleIcon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
											{item}
										</li>
									))}
								</ul>
							</div>
						</Reveal>

						<Reveal from="right" delay={150}>
							<div className="h-full p-5 sm:p-8 rounded-2xl bg-white border border-primary/20 shadow-lg shadow-primary/5">
								<div className="flex items-center gap-2 mb-5 sm:mb-6">
									<span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
										<CheckCircle2Icon className="w-4.5 h-4.5 text-primary" />
									</span>
									<div>
										<p className="font-bold text-slate-900">Dengan Pharmasync</p>
										<p className="text-xs text-primary">Terpusat & real-time</p>
									</div>
								</div>
								<ul className="space-y-3 sm:space-y-4">
									{newWay.map((item) => (
										<li
											key={item}
											className="flex items-start gap-3 text-sm text-slate-700">
											<CheckCircle2Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
											{item}
										</li>
									))}
								</ul>
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* MINI DEMO */}
			<section id="demo" className="hidden sm:block max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
				<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
						Coba Langsung Dashboard-nya
					</h2>
					<p className="text-slate-500 text-sm sm:text-base mt-3">
						Klik menu di sidebar untuk lihat gimana Pharmasync bekerja.
					</p>
				</div>
				<PharmasyncMiniDemo />
			</section>

			{/* CTA AKHIR */}
			<section className="bg-secondary">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
						Siap Mengelola Rantai Pasok Farmasi Lebih Rapi?
					</h2>
					<p className="text-slate-300 text-sm sm:text-base mt-3 max-w-lg mx-auto">
						Masuk ke dashboard untuk mulai memantau stok, distribusi, dan armada Anda
						hari ini.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
						<Link
							href="/masuk"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors">
							Masuk ke Dashboard
						</Link>
						<a
							href={WA_LINK}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg transition-colors">
							<MessageCircleIcon className="w-4 h-4" />
							Hubungi via WhatsApp
						</a>
					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer id="kontak" className="border-t border-slate-100">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Image src="/icon.svg" alt="Pharmasync" width={22} height={22} />
						<span className="font-semibold text-secondary text-sm">pharmasync</span>
					</div>
					<p className="text-xs text-slate-400 font-medium text-center">
						Pharmasync &copy; {new Date().getFullYear()} &bull; Supply Chain
						Management System
					</p>
				</div>
			</footer>
		</div>
	);
}
