"use client";

import { useCallback, useEffect, useState } from "react";
import {
	SearchIcon,
	SlidersHorizontalIcon,
	DownloadIcon,
	CalendarIcon,
	RefreshCwIcon,
	MonitorIcon,
	BotIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ShieldCheckIcon,
	ZapIcon,
} from "lucide-react";
import type {
	AuditLog,
	AuditLogStats,
	SystemMetric,
} from "@/app/types/Riwayat";

const systemMetrics: SystemMetric[] = [
	{
		title: "Log Terverifikasi",
		value: "100%",
		icon: ShieldCheckIcon,
		bg: "bg-slate-50",
	},
	{ title: "Kecepatan Audit", value: "~0.4s", icon: ZapIcon, bg: "bg-slate-50" },
	{
		title: "Terakhir Sincron",
		value: "Baru saja",
		icon: RefreshCwIcon,
		bg: "bg-slate-50",
	},
];

const PAGE_SIZE = 10;

function getPageNumbers(current: number, total: number) {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
	if (current >= total - 3)
		return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
	return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function Riwayat() {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [total, setTotal] = useState(0);
	const [stats, setStats] = useState<AuditLogStats>({
		todayCount: 0,
		manualCorrections: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	const fetchAuditLogs = useCallback(async () => {
		setIsLoading(true);
		const params = new URLSearchParams();
		if (searchQuery) params.set("search", searchQuery);
		params.set("page", String(page));
		params.set("pageSize", String(PAGE_SIZE));

		const response = await fetch(`/api/audit-logs?${params.toString()}`);
		const data = await response.json();
		setLogs(data.logs ?? []);
		setTotal(data.total ?? 0);
		setStats(data.stats ?? { todayCount: 0, manualCorrections: 0 });
		setIsLoading(false);
	}, [searchQuery, page]);

	useEffect(() => {
		const timeout = setTimeout(fetchAuditLogs, 300);
		return () => clearTimeout(timeout);
	}, [fetchAuditLogs]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPage(1);
	}, [searchQuery]);

	const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
	const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const rangeEnd = Math.min(page * PAGE_SIZE, total);

	return (
		<div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
					<h1 className="text-xl font-bold tracking-tight text-slate-900">
						Riwayat Audit
					</h1>
					<div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm w-fit">
						<CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
						Oktober 2023 - Sekarang
					</div>
				</div>

				<div className="relative w-full md:w-72">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						type="text"
						placeholder="Cari log atau nama user..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400 transition-all"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="space-y-2">
					<p className="text-sm text-slate-500 font-medium">
						Pantau seluruh aktivitas inventaris medis secara kronologis.
					</p>
					<div className="flex flex-wrap gap-2">
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm">
							<span className="h-2 w-2 rounded-full bg-emerald-500" />
							{stats.todayCount} Transaksi Hari Ini
						</span>
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm">
							<span className="h-2 w-2 rounded-full bg-amber-500" />
							{stats.manualCorrections} Koreksi Manual
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end lg:self-auto">
					<button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors shadow-sm flex-1 sm:flex-initial">
						<SlidersHorizontalIcon className="w-3.5 h-3.5" />
						Filter
					</button>
					<button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex-1 sm:flex-initial whitespace-nowrap">
						<DownloadIcon className="w-3.5 h-3.5" />
						Ekspor Laporan
					</button>
				</div>
			</div>

			<div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-left border-collapse min-w-[850px]">
						<thead>
							<tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-3.5">Waktu</th>
								<th className="px-6 py-3.5">User</th>
								<th className="px-6 py-3.5">Tipe Aksi</th>
								<th className="px-6 py-3.5">Item Terdampak</th>
								<th className="px-6 py-3.5">Perubahan</th>
								<th className="px-6 py-3.5 text-center">Sumber</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-sm text-slate-700">
							{isLoading && (
								<tr>
									<td
										colSpan={6}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Memuat data...
									</td>
								</tr>
							)}

							{!isLoading && logs.length === 0 && (
								<tr>
									<td
										colSpan={6}
										className="px-6 py-8 text-center text-sm text-slate-400">
										Tidak ada log yang cocok dengan pencarian ini.
									</td>
								</tr>
							)}

							{!isLoading &&
								logs.map((log, idx) => (
									<tr key={idx} className="hover:bg-slate-50/40 transition-colors">
										<td className="px-6 py-4">
											<div className="font-semibold text-slate-900">{log.date}</div>
											<div className="text-[11px] font-mono text-slate-400 mt-0.5">
												{log.time}
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="flex items-center gap-2.5">
												<div className="h-7 w-7 rounded bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white uppercase tracking-wider shrink-0">
													{log.initials}
												</div>
												<span className="font-semibold text-slate-800 whitespace-nowrap">
													{log.user}
												</span>
											</div>
										</td>

										<td className="px-6 py-4">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
													log.actionType === "addition"
														? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
														: log.actionType === "distribution"
															? "bg-blue-50 text-blue-700 border border-blue-100/50"
															: log.actionType === "correction"
																? "bg-amber-50 text-amber-700 border border-amber-100/50"
																: "bg-red-50 text-red-700 border border-red-100/50"
												}`}>
												{log.action}
											</span>
										</td>

										<td className="px-6 py-4">
											<div className="font-semibold text-slate-900">{log.targetItem}</div>
											<div className="text-xs text-slate-400 mt-0.5">
												{log.targetDetail}
											</div>
										</td>

										<td className="px-6 py-4 font-bold">
											<span
												className={
													log.changeType === "positive"
														? "text-emerald-600"
														: "text-blue-600"
												}>
												{log.change}
											</span>
										</td>

										<td className="px-6 py-4">
											<div className="flex justify-center text-slate-500">
												{log.source === "web" ? (
													<span title="Web Admin Panel">
														<MonitorIcon className="w-4 h-4 text-slate-700" />
													</span>
												) : (
													<span title="Automated System / Robot">
														<BotIcon className="w-4 h-4 text-slate-600" />
													</span>
												)}
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				<div className="p-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 bg-white">
					<span className="text-xs text-slate-400 font-medium text-center sm:text-left">
						Menampilkan{" "}
						<span className="text-slate-700 font-semibold">
							{rangeStart}-{rangeEnd}
						</span>{" "}
						dari{" "}
						<span className="text-slate-700 font-semibold">
							{total.toLocaleString("id-ID")}
						</span>{" "}
						entri
					</span>

					<div className="inline-flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
						<button
							onClick={() => setPage((p) => Math.max(p - 1, 1))}
							disabled={page <= 1}
							className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0">
							<ChevronLeftIcon className="w-4 h-4" />
						</button>

						{getPageNumbers(page, totalPages).map((entry, idx) =>
							entry === "..." ? (
								<span
									key={`ellipsis-${idx}`}
									className="px-1 text-xs text-slate-400 font-medium shrink-0">
									...
								</span>
							) : (
								<button
									key={entry}
									onClick={() => setPage(entry as number)}
									className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
										entry === page
											? "bg-slate-900 text-white shadow-sm"
											: "text-slate-600 hover:bg-slate-50 border border-transparent"
									}`}>
									{entry}
								</button>
							),
						)}

						<button
							onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
							disabled={page >= totalPages}
							className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0">
							<ChevronRightIcon className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
				{systemMetrics.map((metric, idx) => {
					const Icon = metric.icon;
					return (
						<div
							key={idx}
							className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between">
							<div className="flex items-start justify-between">
								<span className="text-sm font-medium text-slate-500">
									{metric.title}
								</span>
								<div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 shrink-0">
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div className="mt-4">
								<span className="text-3xl font-bold tracking-tight text-slate-900">
									{metric.value}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
