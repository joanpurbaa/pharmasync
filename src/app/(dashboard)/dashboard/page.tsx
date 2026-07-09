"use client";

import { useEffect } from "react";
import {
    PackageIcon,
    AlertTriangleIcon,
    TruckIcon,
    HistoryIcon,
    FileTextIcon,
    MoreVerticalIcon,
    CircleIcon,
    CheckCircle2Icon,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function Dashboard() {
    const data = useDashboardStore((state) => state.data);
    const isLoading = useDashboardStore((state) => state.isLoading);
    const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboard();
    }, [fetchDashboard]);

    const statsData = data
        ? [
            {
                title: "Total Item Obat",
                value: data.totalItems.toLocaleString("id-ID"),
                change: "Total SKU terdaftar",
                icon: PackageIcon,
                iconColor: "text-icon-default",
            },
            {
                title: "Stok Kritis",
                value: String(data.criticalStockCount),
                change: "Memerlukan tindakan segera",
                icon: AlertTriangleIcon,
                iconColor: "text-icon-warning",
            },
            {
                title: "Pengiriman Hari Ini",
                value: String(data.shipmentsToday.total),
                change: `${data.shipmentsToday.completed} Selesai, ${data.shipmentsToday.inProgress} Dalam Proses`,
                icon: TruckIcon,
                iconColor: "text-icon-default",
            },
            {
                title: "Aktivitas Terakhir",
                value: data.lastActivity,
                change: data.recentActivities[0]
                    ? `${data.recentActivities[0].user} ${data.recentActivities[0].detail}`
                    : "Belum ada aktivitas",
                icon: HistoryIcon,
                iconColor: "text-secondary",
            },
        ]
        : [];

    return (
        <div className="flex flex-col w-full p-4 sm:p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Overview Dashboard
                </h1>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="p-5 bg-card border border-border rounded-xl shadow-xs h-[130px] animate-pulse"
                        />
                    ))}

                {!isLoading &&
                    statsData.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className="p-5 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </span>
                                    {/* Wrapper icon sekarang otomatis merender bg-color dari statsData */}
                                    <div className={`p-2 rounded-lg ${stat.iconColor} shrink-0`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold tracking-tight text-foreground">
                                        {stat.value}
                                    </span>
                                    <p className="text-xs mt-1 font-medium text-muted-foreground line-clamp-1">
                                        {stat.change}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-border">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Stok Menipis & Kritis
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Daftar item medis di bawah batas aman minimum.
                                </p>
                            </div>
                            {/* Tombol diganti dari Custom Indigo ke Cyan Solid */}
                            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-secondary rounded-lg transition-all shadow-xs w-full sm:w-auto cursor-pointer">
                                <FileTextIcon className="w-3.5 h-3.5" />
                                Export PDF
                            </button>
                        </div>

                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <th className="px-6 py-3.5">Nama Item</th>
                                        <th className="px-6 py-3.5">SKU</th>
                                        <th className="px-6 py-3.5">Stok</th>
                                        <th className="px-6 py-3.5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-sm text-foreground">
                                    {isLoading && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-sm text-muted-foreground">
                                                Memuat data...
                                            </td>
                                        </tr>
                                    )}

                                    {!isLoading && data?.criticalStockList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-sm text-muted-foreground">
                                                Semua stok dalam kondisi aman.
                                            </td>
                                        </tr>
                                    )}

                                    {!isLoading &&
                                        data?.criticalStockList.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        Kategori: {item.category}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                                    {item.sku}
                                                </td>
                                                <td
                                                    className={`px-6 py-4 font-semibold ${item.type === "kritis" ? "text-red-600" : "text-amber-600"
                                                        }`}>
                                                    {item.stock}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${item.type === "kritis"
                                                            ? "bg-red-50 text-red-700 border border-red-100"
                                                            : "bg-amber-50 text-amber-700 border border-amber-100"
                                                            }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/20 border-t border-border text-center">
                        {/* Link teks diubah ke Cyan dengan transisi hover */}
                        <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline transition-all cursor-pointer">
                            Lihat Semua Laporan Stok
                        </button>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <div className="p-5 flex items-center justify-between border-b border-border">
                            <h2 className="text-base font-semibold text-foreground">
                                Aktivitas Terbaru
                            </h2>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 relative before:absolute before:top-6 before:bottom-6 before:left-[25px] sm:before:left-[27px] before:w-0.5 before:bg-border">
                            {isLoading && (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    Memuat aktivitas...
                                </div>
                            )}

                            {!isLoading && data?.recentActivities.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    Belum ada aktivitas.
                                </div>
                            )}

                            {!isLoading &&
                                data?.recentActivities.map((activity, idx) => (
                                    <div key={idx} className="flex gap-4 relative items-start">
                                        <div className="bg-card z-10 p-0.5 rounded-full mt-0.5 shrink-0">
                                            {activity.isLatest ? (
                                                <CheckCircle2Icon className="w-4 h-4 text-secondary bg-card rounded-full shadow-xs" />
                                            ) : (
                                                <CircleIcon className="w-3 h-3 text-border fill-card" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {activity.title}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                                    {activity.time}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground/90 leading-relaxed">
                                                <span className="font-medium text-foreground">{activity.user} </span>
                                                {activity.detail}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="p-4 border-t border-border">
                        <button className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg border border-border transition-colors cursor-pointer">
                            Buka Riwayat Lengkap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}