"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Search,
  Briefcase,
  Leaf,
  UserCircle,
  LogOut,
  Heart,
  ChevronRight,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"

interface NotificationCounts {
  unreadMessages: number
  pendingItems: number
}

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  label: string
  badge?: "pendingItems" | "unreadMessages"
  divider?: string
  tourId?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/organisation/dashboard",  icon: LayoutDashboard, label: "Dashboard",  divider: "Beheer",        tourId: "nav-org-dashboard" },
  { href: "/organisation/matches",    icon: Users,           label: "Matches",    badge: "pendingItems" },
  { href: "/chat",                    icon: MessageCircle,   label: "Berichten",  badge: "unreadMessages",  tourId: "nav-org-chat" },
  { href: "/organisation/volunteers", icon: Search,          label: "Zoeken",     divider: "Vrijwilligers", tourId: "nav-org-zoeken" },
  { href: "/organisation/vacancies",  icon: Briefcase,       label: "Vacatures",                            tourId: "nav-org-vacatures" },
  { href: "/organisation/impact",     icon: Leaf,            label: "Impact",     divider: "Rapportage",    tourId: "nav-org-impact" },
  { href: "/organisation/profile",    icon: UserCircle,      label: "Profiel",    divider: "Account" },
]

interface OrgSidebarProps {
  orgName: string
  orgLogo?: string | null
  gemeente?: {
    primaryColor: string
    accentColor: string
    name: string
    logoUrl?: string | null
  } | null
}

export function OrgSidebar({ orgName, orgLogo, gemeente }: OrgSidebarProps) {
  const pathname = usePathname()
  const color = gemeente?.primaryColor ?? "#f97316"
  const accent = gemeente?.accentColor ?? color

  const { data: counts } = useQuery<NotificationCounts>({
    queryKey: ["notificationCounts"],
    queryFn: () => fetch("/api/notifications/counts").then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}, ${accent})` }}
        >
          {gemeente?.logoUrl ? (
            <img src={gemeente.logoUrl} alt={gemeente.name} className="w-full h-full object-cover" />
          ) : (
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          )}
        </div>
        <div className="leading-none">
          <p className="text-gray-900 text-sm font-semibold tracking-tight">Vrijwilligers</p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
            Organisatie
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge, divider, tourId }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          const badgeCount = badge ? (counts?.[badge] ?? 0) : 0
          const showBadge = badgeCount > 0

          return (
            <Fragment key={href}>
              {divider && (
                <div className="pt-4 pb-1 px-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 select-none">
                    {divider}
                  </p>
                </div>
              )}
              <Link
                href={href}
                {...(tourId ? { "data-tour-id": tourId } : {})}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive ? "" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}
                `}
                style={isActive ? { backgroundColor: `${color}14`, color } : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${!isActive ? "text-gray-400 group-hover:text-gray-500" : ""}`}
                  style={isActive ? { color } : undefined}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
                {isActive && !showBadge && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" style={{ color }} />
                )}
              </Link>
            </Fragment>
          )
        })}
      </nav>

      {/* Org footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden text-xs font-bold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {orgLogo ? (
              <img src={orgLogo} alt={orgName} className="w-full h-full object-cover rounded-full" />
            ) : (
              orgName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-600 text-xs font-medium truncate">{orgName}</p>
            <p className="text-gray-300 text-[10px] uppercase tracking-widest">Organisatie</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Uitloggen</span>
        </button>
      </div>
    </aside>
  )
}
