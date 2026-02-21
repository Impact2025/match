"use client"

import { useState, useTransition } from "react"
import { UserStatus } from "@prisma/client"
import { updateUserStatus } from "@/app/(admin)/admin/users/actions"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

interface UserActionButtonProps {
  userId: string
  currentStatus: UserStatus
}

type UserAction = "SUSPEND_USER" | "BAN_USER" | "REINSTATE_USER"

const ACTION_LABELS: Record<UserAction, string> = {
  SUSPEND_USER: "Schorsen",
  BAN_USER: "Verbannen",
  REINSTATE_USER: "Heractiveren",
}

const ACTION_DESCRIPTIONS: Record<UserAction, string> = {
  SUSPEND_USER: "De gebruiker kan tijdelijk niet inloggen. Dit is terug te draaien.",
  BAN_USER: "De gebruiker wordt permanent geblokkeerd van het platform.",
  REINSTATE_USER: "De gebruiker krijgt weer volledige toegang tot het platform.",
}

export function UserActionButton({ userId, currentStatus }: UserActionButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<UserAction | null>(null)
  const [isPending, startTransition] = useTransition()

  const confirmAction = (action: UserAction) => {
    setMenuOpen(false)
    setPendingAction(action)
  }

  const handleConfirm = () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    startTransition(async () => {
      try {
        await updateUserStatus(userId, action)
        toast.success(`${ACTION_LABELS[action]} geslaagd`)
      } catch {
        toast.error("Er ging iets mis. Probeer opnieuw.")
      }
    })
  }

  if (isPending) {
    return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 py-1.5 min-w-[160px]">
              {currentStatus !== "ACTIVE" && (
                <button
                  onClick={() => confirmAction("REINSTATE_USER")}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                >
                  Heractiveren
                </button>
              )}
              {currentStatus === "ACTIVE" && (
                <button
                  onClick={() => confirmAction("SUSPEND_USER")}
                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-100 transition-colors"
                >
                  Schorsen
                </button>
              )}
              {currentStatus !== "BANNED" && (
                <button
                  onClick={() => confirmAction("BAN_USER")}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Verbannen
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {pendingAction && (
        <ConfirmDialog
          open={!!pendingAction}
          onOpenChange={(o) => { if (!o) setPendingAction(null) }}
          title={ACTION_LABELS[pendingAction]}
          description={ACTION_DESCRIPTIONS[pendingAction]}
          confirmLabel={ACTION_LABELS[pendingAction]}
          confirmVariant={pendingAction === "BAN_USER" ? "destructive" : "default"}
          onConfirm={handleConfirm}
          loading={isPending}
        />
      )}
    </>
  )
}
