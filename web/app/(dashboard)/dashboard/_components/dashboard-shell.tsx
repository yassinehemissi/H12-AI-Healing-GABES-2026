"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bot,
  Briefcase,
  Building2,
  Compass,
  LineChart,
  Recycle,
  Scale,
} from "lucide-react"

import { signOutAction } from "@/app/(auth)/actions"
import { DashboardThemeToggle } from "@/app/(dashboard)/dashboard/_components/dashboard-theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type DashboardShellProps = {
  children: ReactNode
  user: {
    fullName: string
    userType: "normal" | "enterprise"
    enterpriseSubscriptionActive?: boolean
  }
}

const citizenMenu = [
  { label: "Air Quality", icon: Activity, href: "/dashboard" },
  { label: "Recycling", icon: Recycle, href: "/dashboard" },
  { label: "Citizen Chatbot", icon: Bot, href: "/dashboard" },
  { label: "rse investisment", icon: Briefcase, href: "/dashboard/rse-investment" },
]

const enterpriseMenu = [
  { label: "Executive Overview", icon: LineChart, href: "/dashboard" },
  { label: "RSE Projects", icon: Building2, href: "/dashboard" },
  { label: "Amalin Core", icon: Compass, href: "/dashboard/amalin" },
  { label: "Compliance Audit", icon: Scale, href: "/dashboard" },
]

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname()
  const menu = user.userType === "enterprise" ? enterpriseMenu : citizenMenu

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 rounded-2xl border border-sidebar-border bg-sidebar-accent p-2">
            <div className="grid size-8 place-items-center overflow-hidden rounded-xl bg-white/80 p-1 dark:bg-white/10">
              <Image
                src="/LOGO.png"
                alt="GABBiEST logo"
                width={28}
                height={28}
                className="size-7 object-contain"
                priority
              />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold">GABBiEST</p>
              <p className="text-xs text-sidebar-foreground/70">Mission Console</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton isActive={pathname === item.href} asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {user.userType === "enterprise" ? (
            <SidebarGroup>
              <SidebarGroupLabel>Plan</SidebarGroupLabel>
              <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent p-3 text-xs">
                <p className="font-medium">Enterprise plan</p>
                <p className="mt-1 text-sidebar-foreground/70">
                  {user.enterpriseSubscriptionActive
                    ? "Subscription active"
                    : "Subscription required"}
                </p>
              </div>
            </SidebarGroup>
          ) : null}
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full justify-start">
              Logout
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="p-2 sm:p-3">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-zinc-900/10 bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <p className="text-sm text-zinc-500">Dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardThemeToggle />
            <Avatar className="size-8">
              <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="rounded-4xl border border-zinc-900/10 bg-white/80 p-3 dark:border-white/10 dark:bg-[#0d1118] sm:p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
