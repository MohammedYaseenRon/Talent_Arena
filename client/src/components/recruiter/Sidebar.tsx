"use client";

import {
  LayoutDashboard,
  Code2,
  Users,
  Trophy,
  FileText,
  Settings,
  Zap,
  Tags,
  ListVideo,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/app/context/authContext";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const mainItems = [
  { title: "Dashboard", url: "/recruiter", icon: LayoutDashboard },
  { title: "Challenges", url: "/recruiter/challenges", icon: Code2 },
  { title: "Live", url: "/recruiter/live", icon: ListVideo },
  { title: "Submission", url: "/recruiter/submission", icon: Trophy },
  { title: "Leaderboard", url: "/recruiter/leaderboard", icon: User },
];

const manageItems = [
  // { title: "Tags", url: "/tags", icon: Tags },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, fetchMe, logout } = useAuth();
  const router =  useRouter();

  useEffect(() => {
    fetchMe();
  }, []);


   const handleLogout = async () => {
    await logout();
    router.push("/recruiter/login"); 
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 h-9">
          <div className="h-7 w-7 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Talent_Arena</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
            Main
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-secondary text-primary font-medium glow-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MANAGE */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
            Manage
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-secondary text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 px-3 py-2 h-auto justify-start"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Avatar>
                  <AvatarFallback>{user?.name?.charAt(0).toLocaleUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-start text-left overflow-hidden">
                <span className="text-sm font-medium truncate w-full">
                  {user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {user?.email ?? ""}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" side="top">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
            >
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
