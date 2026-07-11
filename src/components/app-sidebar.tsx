"use client";

import * as React from "react";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarRail,
} from "@/components/ui/sidebar";

import {
	LayoutDashboard,
	Package,
	Truck,
	History,
	Users,
	Hospital,
	Box,
	PackageSearch,
} from "lucide-react";

const defaultNavGroups = [
	{
		label: "Operasional",
		items: [
			{ name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
			{ name: "Stok Barang", url: "/stok-barang", icon: <Package /> },
			{ name: "Distribusi", url: "/distribusi", icon: <Truck /> },
			{ name: "Petugas", url: "/petugas", icon: <Users /> },
		],
	},
	{
		label: "Manajemen Data",
		items: [
			{ name: "Mitra", url: "/mitra", icon: <Hospital /> },
			{ name: "Riwayat", url: "/riwayat", icon: <History /> },
			{ name: "Visualisasi 3D", url: "/warehouse", icon: <Box /> },
		],
	},
];

const driverNavGroups = [
	{
		label: "Tugas Lapangan",
		items: [{ name: "Dashboard", url: "/driver", icon: <LayoutDashboard /> }],
	},
];

type User = {
	name: string;
	email: string;
	avatar: string;
};

function StaticNavPlaceholder() {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{Array.from({ length: 5 }).map((_, idx) => (
					<SidebarMenuItem key={idx}>
						<div className="flex h-8 items-center gap-2 rounded-md px-2">
							<div className="size-4 shrink-0 rounded-md bg-slate-100" />
							<div className="h-4 w-2/3 rounded-md bg-slate-100" />
						</div>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

function AnimatedNavSkeleton() {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{Array.from({ length: 5 }).map((_, idx) => (
					<SidebarMenuItem key={idx}>
						<SidebarMenuSkeleton showIcon />
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [user, setUser] = React.useState<User>({
		name: "Memuat...",
		email: "",
		avatar: "",
	});

	const [userRole, setUserRole] = React.useState<string | null>(null);
	const [isRoleLoading, setIsRoleLoading] = React.useState(true);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	React.useEffect(() => {
		const fetchUserAndRole = async () => {
			try {
				const res = await fetch("/api/auth/me", {
					credentials: "include",
					cache: "no-store",
				});

				if (!res.ok) return;

				const data = await res.json();

				setUser({
					name: data.name,
					email: data.email,
					avatar: "",
				});

				if (data.role) {
					setUserRole(data.role.toUpperCase());
				}
			} catch (err) {
				console.error("Gagal memuat profil & role di sidebar:", err);
			} finally {
				setIsRoleLoading(false);
			}
		};

		fetchUserAndRole();
	}, []);

	const activeNavGroups =
		userRole === "DRIVER" ? driverNavGroups : defaultNavGroups;

	let navContent: React.ReactNode;
	if (!mounted) {
		navContent = <StaticNavPlaceholder />;
	} else if (isRoleLoading) {
		navContent = <AnimatedNavSkeleton />;
	} else {
		navContent = <NavProjects groups={activeNavGroups} />;
	}

	return (
		<Sidebar
			collapsible="icon"
			className="bg-white border-r border-slate-200 text-slate-900 [--sidebar-accent:var(--color-cyan-100)] [--sidebar-accent-foreground:var(--color-cyan-900)]"
			{...props}>
			<SidebarHeader className="bg-white border-b border-slate-100">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="hover:bg-transparent cursor-default">
							<div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-white shrink-0 shadow-[0_0_0_3px_rgba(6,182,212,0.18)]">
								<PackageSearch className="size-4" />
								<span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#f9f871] ring-2 ring-white" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold text-slate-900">
									Pharmasync
								</span>
								<span className="truncate text-xs text-slate-500">Supply Chain</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="bg-white text-slate-900">
				{navContent}
			</SidebarContent>

			<SidebarFooter className="bg-white border-t border-slate-100">
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
