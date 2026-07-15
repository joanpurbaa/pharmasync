"use client";

import Image from "next/image";
import Link from "next/link";
import {
	TruckIcon,
	BotIcon,
	Boxes,
	MessageCircleIcon,
	ArrowRightIcon,
	ShieldCheckIcon,
	MapPinIcon,
	MessageSquareIcon,
	ActivityIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import PharmasyncMiniDemo from "@/components/PharmasyncMiniDemo";
import { motion } from "framer-motion";
import ComparisonInteractive from "@/components/ComparisonInteractive";
import MiniMapTracking from "@/components/MiniMapTracking";
import MiniWarehouseGrid from "@/components/MiniWarehouseGrid";
import MiniAiChat from "@/components/MiniAiChat";

const WA_LINK = "https://wa.me/6282275338090";

const stats = [
	{ icon: ActivityIcon, value: null, display: "24/7", label: "Monitoring Stok" },
	{ icon: Boxes, value: 3, suffix: "", label: "Modul Inti Terintegrasi" },
	{
		icon: ShieldCheckIcon,
		value: 100,
		suffix: "%",
		label: "Data Medis Aman & Terpusat",
	},
];

type RevealProps = {
	children: ReactNode;
	delay?: number;
	from?: "up" | "left" | "right";
	className?: string;
};

type FloatBadgeProps = {
	icon: ReactNode;
	label: string;
	sublabel?: string;
	className: string;
	delay?: number;
};

function FloatBadge({
	icon,
	label,
	sublabel,
	className,
	delay = 0,
}: FloatBadgeProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16, scale: 0.9 }}
			whileInView={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
			viewport={{ once: true, amount: 0.4 }}
			transition={{
				opacity: { duration: 0.6, delay, ease: "easeOut" },
				scale: { duration: 0.6, delay, ease: "easeOut" },
				y: {
					duration: 3.5,
					repeat: Infinity,
					ease: "easeInOut",
					delay: delay + 0.6,
				},
			}}
			className={`absolute z-20 hidden lg:flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-900/5 px-3.5 py-2.5 ${className}`}>
			<span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
				{icon}
			</span>
			<div className="text-left">
				<p className="text-xs font-bold text-slate-900 leading-none">{label}</p>
				{sublabel && (
					<p className="text-[10px] text-slate-400 mt-1 leading-none">{sublabel}</p>
				)}
			</div>
		</motion.div>
	);
}

function Reveal({ children, delay = 0, from = "up", className }: RevealProps) {
	const initial =
		from === "left"
			? { opacity: 0, x: -24 }
			: from === "right"
				? { opacity: 0, x: 24 }
				: { opacity: 0, y: 24 };

	return (
		<motion.div
			className={className}
			initial={initial}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.7, delay: delay / 1000, ease: "easeOut" }}>
			{children}
		</motion.div>
	);
}

function CountUp({
	value,
	suffix = "",
	duration = 1.5,
}: {
	value: number;
	suffix?: string;
	duration?: number;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(0);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					setStarted(true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.5 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [started]);

	useEffect(() => {
		if (!started) return;
		let startTime: number | null = null;
		const step = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
			setDisplay(Math.floor(progress * value));
			if (progress < 1) requestAnimationFrame(step);
			else setDisplay(value);
		};
		requestAnimationFrame(step);
	}, [started, value, duration]);

	return (
		<span ref={ref}>
			{display}
			{suffix}
		</span>
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

					<div
						id="demo"
						className="hidden sm:block max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:pt-36 relative">

						<div className="relative">
							<FloatBadge
								icon={<ActivityIcon className="w-4 h-4 text-primary-foreground" />}
								label="Stok Real-time"
								sublabel="Update otomatis"
								className="-top-6 left-4"
								delay={0.1}
							/>
							<FloatBadge
								icon={<MapPinIcon className="w-4 h-4 text-primary-foreground" />}
								label="Live Tracking GPS"
								sublabel="Distribusi terpantau"
								className="top-1/3 -right-8"
								delay={0.3}
							/>
							<FloatBadge
								icon={<MessageSquareIcon className="w-4 h-4 text-primary-foreground" />}
								label="Chat via Telegram"
								sublabel="Cek data tanpa login"
								className="-bottom-6 left-10"
								delay={0.5}
							/>

							<PharmasyncMiniDemo />
						</div>
					</div>
				</div>
			</section>

			{/* STATS */}
			{/* STATS */}
			<section className="relative border-y border-slate-100 bg-linear-to-br from-primary to-secondary overflow-hidden">
				<div
					className="absolute inset-0 opacity-[0.06]"
					style={{
						backgroundImage: `
        linear-gradient(to bottom, white 1px, transparent 1px),
        linear-gradient(to right, white 1px, transparent 1px)
      `,
						backgroundSize: "56px 56px",
					}}
				/>
				<div className="absolute -top-16 left-1/4 h-56 w-56 rounded-full bg-white/10 blur-[100px]" />
				<div className="absolute -bottom-16 right-1/4 h-56 w-56 rounded-full bg-white/10 blur-[100px]" />

				<div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
					<div className="grid grid-cols-1 sm:grid-cols-3">
						{stats.map((s, i) => {
							const Icon = s.icon;
							return (
								<Reveal key={s.label} delay={i * 120}>
									<div
										className={`flex flex-col items-center text-center px-4 py-4 sm:py-0 ${
											i !== 0 ? "sm:border-l sm:border-white/15" : ""
										}`}>
										<span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
											<Icon className="w-5 h-5 text-white" />
										</span>
										<div className="text-2xl sm:text-4xl font-bold text-white">
											{s.value !== null ? (
												<CountUp value={s.value} suffix={s.suffix} />
											) : (
												s.display
											)}
										</div>
										<div className="text-xs sm:text-sm text-white/80 font-medium mt-1">
											{s.label}
										</div>
									</div>
								</Reveal>
							);
						})}
					</div>
				</div>
			</section>

			{/* KELEBIHAN */}
			<section id="solusi" className="bg-white py-16 sm:py-20 lg:py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<Reveal>
						<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
							<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
								<ShieldCheckIcon className="w-3.5 h-3.5" />
								Kenapa Pharmasync
							</span>
							<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
								Solusi Nyata untuk Masalah Nyata
							</h2>
							<p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
								Dirancang untuk menjawab fenomena stock-out yang masih membebani
								fasilitas kesehatan di Indonesia.
							</p>
						</div>
					</Reveal>

					<div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-stretch">
						<div className="lg:w-[60%] flex">
							<Reveal from="left" className="w-full h-full">
								<motion.div
									whileHover={{ y: -4 }}
									transition={{ duration: 0.25 }}
									className="relative w-full h-full rounded-2xl bg-linear-to-br from-primary to-secondary p-6 sm:p-10 overflow-hidden flex flex-col justify-between">
									<div className="relative z-10">
										<span className="inline-flex w-12 h-12 rounded-xl bg-white/15 items-center justify-center mb-5">
											<Boxes className="w-6 h-6 text-white" />
										</span>
										<h3 className="text-2xl sm:text-3xl font-bold text-white">
											Visualisasi Gudang 3D
										</h3>
										<p className="text-base text-white/75 mt-3 leading-relaxed max-w-lg">
											Representasi digital interaktif tata letak gudang secara real-time,
											memetakan posisi rak dan memberi indikator visual langsung untuk stok
											yang menipis atau kritis.
										</p>
										<div className="mt-6">
											<MiniWarehouseGrid />
										</div>
									</div>

									<div className="flex-col sm:flex items-start gap-2 mt-8">
										<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold">
											<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
											Real-time
										</div>
										<div className="text-xs text-white/60 mt-2 sm:mt-0">
											Sinkron setiap ada perubahan stok
										</div>
									</div>

									<div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
									<div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
								</motion.div>
							</Reveal>
						</div>

						<div className="flex flex-col gap-4 sm:gap-5 lg:w-[40%]">
							<div className="flex-1">
								<Reveal from="right" delay={100} className="w-full h-full">
									<motion.div
										whileHover={{ y: -4 }}
										transition={{ duration: 0.25 }}
										className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6 h-full hover:border-primary/30 hover:shadow-md transition-colors">
										<span className="inline-flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-4">
											<BotIcon className="w-5 h-5 text-primary" />
										</span>
										<h3 className="font-bold text-slate-900">Asisten AI via Telegram</h3>
										<p className="text-sm text-slate-500 mt-2 leading-relaxed">
											Cek stok, mitra, dan jadwal pengiriman cukup lewat chat — 100%
											read-only, menjaga kepatuhan etika penggunaan AI pada data medis.
										</p>
										<div className="mt-4">
											<MiniAiChat />
										</div>
									</motion.div>
								</Reveal>
							</div>

							<div className="flex-1">
								<Reveal from="right" delay={200} className="w-full h-full">
									<motion.div
										whileHover={{ y: -4 }}
										transition={{ duration: 0.25 }}
										className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6 h-full hover:border-primary/30 hover:shadow-md transition-colors">
										<span className="inline-flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-4">
											<TruckIcon className="w-5 h-5 text-primary" />
										</span>
										<h3 className="font-bold text-slate-900">
											Distribusi Otomatis & Real-time
										</h3>
										<p className="text-sm text-slate-500 mt-2 leading-relaxed">
											Stok terupdate otomatis begitu pengiriman sampai tujuan, mengurangi
											human error dan mencegah stock-out di fasilitas kesehatan mitra.
										</p>
										<div className="mt-4">
											<MiniMapTracking />
										</div>
									</motion.div>
								</Reveal>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* MASALAH VS SOLUSI */}
			<section
				id="perbandingan"
				className="relative bg-slate-50 py-16 sm:py-20 lg:py-24 overflow-hidden">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
        linear-gradient(to bottom, rgb(226 232 240) 1px, transparent 1px),
        linear-gradient(to right, rgb(226 232 240) 1px, transparent 1px)
      `,
						backgroundSize: "64px 64px",
						maskImage:
							"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 75%)",
						WebkitMaskImage:
							"radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 75%)",
					}}
				/>

				<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
					{" "}
					<Reveal>
						<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
							<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
								Cara Lama vs Dengan Pharmasync
							</h2>
							<p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
								Geser toggle-nya dan lihat langsung bedanya, bukan cuma dibaca.
							</p>
						</div>
					</Reveal>
					<Reveal delay={150}>
						<ComparisonInteractive />
					</Reveal>
				</div>
			</section>

			<section className="bg-secondary">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
					<Reveal>
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
					</Reveal>
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
