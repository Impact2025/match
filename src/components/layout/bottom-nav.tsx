"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Heart, MessageCircle, User } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

const NAV_ITEMS = [
  { href: "/swipe", label: "Home", icon: LayoutGrid, badge: null as "pendingItems" | "unreadMessages" | null },
  { href: "/matches", label: "Matches", icon: Heart, badge: "pendingItems" as const },
  { href: "/chat", label: "Berichten", icon: MessageCircle, badge: "unreadMessages" as const },
  { href: "/profile", label: "Profiel", icon: User, badge: null },
]

interface NotificationCounts {
  unreadMessages: number
  pendingItems: number
}

export function BottomNav() {
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
              className="flex flex-col items-center gap-1 py-3 px-5 relative"
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
                className={`text-[10px] font-semibold tracking-widest ${
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
