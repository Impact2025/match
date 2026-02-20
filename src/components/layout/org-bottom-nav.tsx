"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageCircle, Briefcase, User, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

const NAV_ITEMS = [
  { href: "/organisation/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "pendingItems" as const },
  { href: "/organisation/volunteers", label: "Zoeken", icon: Users, badge: null as "pendingItems" | "unreadMessages" | null },
  { href: "/chat", label: "Berichten", icon: MessageCircle, badge: "unreadMessages" as const },
  { href: "/organisation/vacancies", label: "Vacatures", icon: Briefcase, badge: null as "pendingItems" | "unreadMessages" | null },
  { href: "/organisation/profile", label: "Profiel", icon: User, badge: null },
]

interface NotificationCounts {
  unreadMessages: number
  pendingItems: number
}

export function OrgBottomNav() {
  const pathname = usePathname()

  const { data: counts } = useQuery<NotificationCounts>({
    queryKey: ["notificationCounts"],
    queryFn: () => fetch("/api/notifications/counts").then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          const badgeCount = item.badge ? (counts?.[item.badge] ?? 0) : 0
          const showBadge = badgeCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-3 px-2 relative"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-gray-400"}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
