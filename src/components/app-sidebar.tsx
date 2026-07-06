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
} from "lucide-react";

const teams = [
  {
    name: "Pharmasync",
    logo: <GalleryVerticalEndIcon />,
    plan: "Supply chain",
  },
  {
    name: "Pharmasync",
    logo: <AudioLinesIcon />,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: <TerminalIcon />,
    plan: "Free",
  },
];

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
		name: "Petugas",
		url: "/petugas",
		icon: <Users />,
	},
	{
		name: "Riwayat",
		url: "/riwayat",
		icon: <History />,
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
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

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