"use client";

import * as React from "react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
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

const navGroups = [
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

type User = {
	name: string;
	email: string;
	avatar: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [user, setUser] = React.useState<User>({
		name: "Memuat...",
		email: "",
		avatar: "",
	});

	React.useEffect(() => {
		const fetchUser = async () => {
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
			} catch (err) {
				console.error(err);
			}
		};

		fetchUser();
	}, []);

	return (
		<Sidebar
			collapsible="icon"
			className="bg-white border-r border-slate-200 text-slate-900"
			{...props}>
			<SidebarHeader className="bg-white border-b border-slate-100">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="hover:bg-transparent cursor-default">
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0">
								<PackageSearch className="size-4" />
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
				<NavProjects groups={navGroups} />
			</SidebarContent>

			<SidebarFooter className="bg-white border-t border-slate-100">
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
