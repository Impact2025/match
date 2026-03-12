"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, Check, Heart, MessageCircle, Star, UserCheck, UserX, X, Mail } from "lucide-react"
import Link from "next/link"
import { getPusherClient } from "@/lib/pusher"
import { useQuery, useQueryClient } from "@tanstack/react-query"

type NotificationType =
  | "NEW_MATCH"
  | "MATCH_ACCEPTED"
  | "MATCH_REJECTED"
  | "NEW_INVITATION"
  | "INVITATION_ACCEPTED"
  | "NEW_MESSAGE"

interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  NEW_MATCH:          { icon: <Heart className="w-4 h-4" />,        color: "text-orange-500 bg-orange-50" },
  MATCH_ACCEPTED:     { icon: <UserCheck className="w-4 h-4" />,    color: "text-green-600 bg-green-50" },
  MATCH_REJECTED:     { icon: <UserX className="w-4 h-4" />,        color: "text-red-400 bg-red-50" },
  NEW_INVITATION:     { icon: <Star className="w-4 h-4" />,         color: "text-purple-500 bg-purple-50" },
  INVITATION_ACCEPTED:{ icon: <UserCheck className="w-4 h-4" />,    color: "text-green-600 bg-green-50" },
  NEW_MESSAGE:        { icon: <MessageCircle className="w-4 h-4" />, color: "text-blue-500 bg-blue-50" },
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return "zojuist"
  if (diff < 3600) return `${Math.floor(diff / 60)}m geleden`
  if (diff < 86400) return `${Math.floor(diff / 3600)}u geleden`
  return `${Math.floor(diff / 86400)}d geleden`
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data } = useQuery<{ notifications: Notification[]; unread: number }>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const notifications = data?.notifications ?? []
  const unread = data?.unread ?? 0

  // Real-time Pusher subscription
  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`private-user-${userId}`)
    channel.bind("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notificationCounts"] })
    })
    return () => {
      pusher.unsubscribe(`private-user-${userId}`)
    }
  }, [userId, queryClient])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    })
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }, [queryClient])

  const markRead = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    [queryClient]
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Notificaties"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Notificaties</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                  {unread} nieuw
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Alles gelezen
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 opacity-40" />
                </div>
                <span className="text-sm font-medium text-gray-500">Geen notificaties</span>
                <span className="text-xs text-gray-400 mt-1">Je bent helemaal bij!</span>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.NEW_MESSAGE
                const content = (
                  <div
                    className={`flex gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                      !n.read ? "bg-orange-50/50" : ""
                    }`}
                    onClick={() => !n.read && markRead(n.id)}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                )

                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      markRead(n.id)
                      setOpen(false)
                    }}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] text-gray-400 text-center">
                Laatste {notifications.length} notificaties
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
