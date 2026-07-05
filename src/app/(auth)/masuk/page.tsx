"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	LockIcon,
	UserIcon,
	EyeIcon,
	EyeOffIcon,
	ShieldCheckIcon,
} from "lucide-react";

export default function Masuk() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(data?.error || "Login gagal. Silakan coba lagi.");
			}

			router.replace("/dashboard");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Login gagal. Silakan coba lagi.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 md:p-8">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-slate-200/50 blur-3xl" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-slate-100 blur-3xl" />
			</div>

			<div className="relative w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/40 p-6 sm:p-8 backdrop-blur-sm transition-all">
				<div className="flex flex-col items-center text-center space-y-2 mb-8">
					<div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
						<ShieldCheckIcon className="w-5 h-5" />
					</div>
					<div className="space-y-1">
						<h1 className="text-xl font-bold text-slate-900 tracking-tight">
							Kanal Admin Medistock
						</h1>
						<p className="text-xs text-slate-400 font-medium">
							Silakan masuk dengan kredensial terdaftar Anda.
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-1.5">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
							Email
						</label>
						<div className="relative">
							<UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type="email"
								required
								placeholder="Masukkan email admin"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400/80 transition-all text-slate-800 font-medium"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
							Password
						</label>
						<div className="relative">
							<LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type={showPassword ? "text" : "password"}
								required
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400/80 transition-all text-slate-800 font-medium"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
								tabIndex={-1}>
								{showPassword ? (
									<EyeOffIcon className="w-4 h-4" />
								) : (
									<EyeIcon className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					{errorMessage ? (
						<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
							{errorMessage}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md shadow-slate-900/10 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed">
						{isLoading ? (
							<div className="flex items-center gap-2">
								<svg
									className="animate-spin h-4 w-4 text-white"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span>Memverifikasi...</span>
							</div>
						) : (
							"Masuk ke Dashboard"
						)}
					</button>
				</form>

				<div className="mt-8 text-center">
					<p className="text-[11px] font-medium text-slate-400">
						Medistock &copy; {new Date().getFullYear()} &bull; Hak Akses Terbatas
					</p>
				</div>
			</div>
		</div>
	);
}
