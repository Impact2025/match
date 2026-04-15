"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { Heart, LogOut, UserCircle } from "lucide-react"
import { NotificationBell } from "@/components/layout/notification-bell"

interface OrgHeaderProps {
  userId: string
  gemeente?: {
    primaryColor: string
    accentColor: string
    name: string
    logoUrl?: string | null
  } | null
}

export function OrgHeader({ userId, gemeente }: OrgHeaderProps) {
  const primary = gemeente?.primaryColor ?? "#f97316"
  const accent = gemeente?.accentColor ?? "#f59e0b"
  const name = gemeente?.name ?? "Vrijwilligersmatch"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 lg:hidden">
      <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
        <Link href="/organisation/dashboard" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {gemeente?.logoUrl ? (
              <img src={gemeente.logoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Heart className="w-4 h-4 text-white fill-white" />
            )}
          </div>
          <span className="font-bold text-gray-900 text-sm">{name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell userId={userId} />
          <Link
            href="/organisation/profile"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-2.5 py-2 transition-colors text-sm"
            aria-label="Profiel"
          >
            <UserCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Profiel</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-2.5 py-2 transition-colors text-sm"
            aria-label="Uitloggen"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Uitloggen</span>
          </button>
        </div>
      </div>
    </header>
  )
}
