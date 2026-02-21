"use client"

import { useState, useTransition } from "react"
import { UserStatus } from "@prisma/client"
import { updateUserStatus } from "@/app/(admin)/admin/users/actions"
import { MoreHorizontal, Loader2 } from "lucide-react"

interface UserActionButtonProps {
  userId: string
  currentStatus: UserStatus
}

export function UserActionButton({ userId, currentStatus }: UserActionButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAction = (action: "SUSPEND_USER" | "BAN_USER" | "REINSTATE_USER") => {
    setOpen(false)
    startTransition(async () => {
      await updateUserStatus(userId, action)
    })
  }

  if (isPending) {
    return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-white/[0.05] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 py-1.5 min-w-[160px]">
            {currentStatus !== "ACTIVE" && (
              <button
                onClick={() => handleAction("REINSTATE_USER")}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors"
              >
                Heractiveren
              </button>
            )}
            {currentStatus === "ACTIVE" && (
              <button
                onClick={() => handleAction("SUSPEND_USER")}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-100 transition-colors"
              >
                Schorsen
              </button>
            )}
            {currentStatus !== "BANNED" && (
              <button
                onClick={() => handleAction("BAN_USER")}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                Verbannen
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
