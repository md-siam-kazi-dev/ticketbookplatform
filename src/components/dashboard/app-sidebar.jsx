"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  User,
  Ticket,
  Receipt,
  PlusCircle,
  ClipboardList,
  BookMarked,
  BarChart2,
  ShieldCheck,
  Users,
  Megaphone,
  LogOut,
  LayoutDashboard
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { authClient, useSession } from "@/lib/auth-client"

// ── Sidebar nav definitions per role ──────────────────────────────────────────

const userNav = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/user",
  },
  {
    title: "User Profile",
    icon: User,
    href: "/dashboard/user/profile",
  },
  {
    title: "My Booked Tickets",
    icon: BookMarked,
    href: "/dashboard/user/booked-tickets",
  },
  {
    title: "Transaction History",
    icon: Receipt,
    href: "/dashboard/user/transactions",
  },
];

const vendorNav = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/vendor",
  },
  {
    title: "Vendor Profile",
    icon: User,
    href: "/dashboard/vendor/profile",
  },
  {
    title: "Add Ticket",
    icon: PlusCircle,
    href: "/dashboard/vendor/add-ticket",
  },
  {
    title: "My Added Tickets",
    icon: Ticket,
    href: "/dashboard/vendor/my-tickets",
  },
  {
    title: "Requested Bookings",
    icon: ClipboardList,
    href: "/dashboard/vendor/requested-bookings",
  },
  {
    title: "Revenue Overview",
    icon: BarChart2,
    href: "/dashboard/vendor/revenue",
  },
];

const adminNav = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
  },
  {
    title: "Admin Profile",
    icon: User,
    href: "/dashboard/admin/profile",
  },
  {
    title: "Manage Tickets",
    icon: ShieldCheck,
    href: "/dashboard/admin/manage-tickets",
  },
  {
    title: "Manage Users",
    icon: Users,
    href: "/dashboard/admin/manage-users",
  },
  {
    title: "Advertise Tickets",
    icon: Megaphone,
    href: "/dashboard/admin/advertise",
  },
];

const NAV_MAP   = { user: userNav,   vendor: vendorNav,   admin: adminNav   }
const LABEL_MAP = { user: "User Panel", vendor: "Vendor Panel", admin: "Admin Panel" }

const ROLE_BADGE = {
  user:   "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  vendor: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  admin:  "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AppSidebar({user}) {
  const pathname  = usePathname()
  const router    = useRouter()

  const links  = NAV_MAP[user?.role]  ?? []
  const panel  = LABEL_MAP[user?.role] ?? "Panel"
  

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "TL"

  // Fixed active path evaluation behavior
  const isActive = (href) => {
    if (href === "/dashboard/user" || href === "/dashboard/vendor" || href === "/dashboard/admin") {
      return pathname === href
    }
    if (href.endsWith("/profile")) return pathname === href
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Sidebar>
      {/* ── Header: TicketLagbe brand ── */}
      <SidebarHeader className="px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 dark:bg-orange-500 text-orange-50 shrink-0">
            <Ticket size={16} strokeWidth={2.4} className="-rotate-12" />
          </span>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-none">
              Ticket<span className="text-orange-600 dark:text-orange-500">Lagbe</span>
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 leading-none">
              {panel}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Nav links ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-stone-400 dark:text-stone-500 text-[14px] uppercase tracking-widest px-3 mb-1">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const active = isActive(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={
                        active
                          ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-100 dark:hover:bg-orange-500/20"
                          : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:text-stone-900 dark:hover:text-stone-50"
                      }
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={[
                            "h-[17px] w-[17px] shrink-0",
                            active
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-stone-400 dark:text-stone-500",
                          ].join(" ")}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer: logout + user chip ── */}
      <SidebarFooter className="p-3 gap-2">
        {/* Log out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Log out"
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            >
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3"
              >
                <LogOut className="h-[17px] w-[17px]" />
                <span>Log out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        {/* User chip */}
        <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-stone-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <Avatar className="h-9 w-9 shrink-0">
            {user?.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate leading-tight">
              {user?.name ?? "Guest"}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 truncate leading-tight">
              {user?.email ?? ""}
            </span>
          </div>

          {/* Role badge */}
          <span
            className={[
              "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              ROLE_BADGE[user?.role],
            ].join(" ")}
          >
            {user?.role}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}