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
} from "lucide-react";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
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
	],
	// navMain: [
	//   {
	//     title: "Playground",
	//     url: "#",
	//     icon: (
	//       <TerminalSquareIcon
	//       />
	//     ),
	//     isActive: true,
	//     items: [
	//       {
	//         title: "History",
	//         url: "#",
	//       },
	//       {
	//         title: "Starred",
	//         url: "#",
	//       },
	//       {
	//         title: "Settings",
	//         url: "#",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Models",
	//     url: "#",
	//     icon: (
	//       <BotIcon
	//       />
	//     ),
	//     items: [
	//       {
	//         title: "Genesis",
	//         url: "#",
	//       },
	//       {
	//         title: "Explorer",
	//         url: "#",
	//       },
	//       {
	//         title: "Quantum",
	//         url: "#",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Documentation",
	//     url: "#",
	//     icon: (
	//       <BookOpenIcon
	//       />
	//     ),
	//     items: [
	//       {
	//         title: "Introduction",
	//         url: "#",
	//       },
	//       {
	//         title: "Get Started",
	//         url: "#",
	//       },
	//       {
	//         title: "Tutorials",
	//         url: "#",
	//       },
	//       {
	//         title: "Changelog",
	//         url: "#",
	//       },
	//     ],
	//   },
	//   {
	//     title: "Settings",
	//     url: "#",
	//     icon: (
	//       <Settings2Icon
	//       />
	//     ),
	//     items: [
	//       {
	//         title: "General",
	//         url: "#",
	//       },
	//       {
	//         title: "Team",
	//         url: "#",
	//       },
	//       {
	//         title: "Billing",
	//         url: "#",
	//       },
	//       {
	//         title: "Limits",
	//         url: "#",
	//       },
	//     ],
	//   },
	// ],
	projects: [
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
			name: "Riwayat",
			url: "/riwayat",
			icon: <History />,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				{/* <NavMain items={data.navMain} /> */}
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
