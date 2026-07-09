"use client";

import * as React from "react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  LayoutDashboard,
  Package,
  Truck,
  History,
  Users,
  Hospital,
  Box,
} from "lucide-react";

const projects = [
	{
		name: "Dashboard",
		url: "/dashboard",
		icon: <LayoutDashboard />,
	},
	{
		name: "Stok Barang",
		url: "/stok-barang",
		icon: <Package />,
	},
	{
		name: "Distribusi",
		url: "/distribusi",
		icon: <Truck />,
	},
	{
		name: "Mitra",
		url: "/mitra",
		icon: <Hospital />,
	},
	{
		name: "Petugas",
		url: "/petugas",
		icon: <Users />,
	},
	{
		name: "Riwayat",
		url: "/riwayat",
		icon: <History />,
	},
	{
		name: "Visualisasi 3D",
		url: "/warehouse",
		icon: <Box />,
	},
];

type User = {
  name: string;
  email: string;
  avatar: string;
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User>({
    name: "Loading...",
    email: "Loading...",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavProjects projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}