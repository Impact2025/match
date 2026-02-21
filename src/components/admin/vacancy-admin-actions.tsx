"use client"

import { useState, useTransition } from "react"
import { VacancyStatus } from "@prisma/client"
import { updateVacancyStatus } from "@/app/(admin)/admin/vacancies/actions"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

interface VacancyAdminActionsProps {
  vacancyId: string
  currentStatus: VacancyStatus
}

type VacancyAction = "PAUSE" | "CLOSE" | "ACTIVATE"

const ACTION_LABELS: Record<VacancyAction, string> = {
  PAUSE: "Pauzeren",
  CLOSE: "Sluiten",
  ACTIVATE: "Activeren",
}

const ACTION_DESCRIPTIONS: Record<VacancyAction, string> = {
  PAUSE: "De vacature wordt tijdelijk verborgen voor vrijwilligers.",
  CLOSE: "De vacature wordt definitief gesloten en niet meer getoond.",
  ACTIVATE: "De vacature wordt zichtbaar voor vrijwilligers.",
}

export function VacancyAdminActions({ vacancyId, currentStatus }: VacancyAdminActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<VacancyAction | null>(null)
  const [isPending, startTransition] = useTransition()

  const confirmAction = (action: VacancyAction) => {
    setMenuOpen(false)
    setPendingAction(action)
  }

  const handleConfirm = () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    startTransition(async () => {
      try {
        await updateVacancyStatus(vacancyId, action)
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
                  onClick={() => confirmAction("ACTIVATE")}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                >
                  Activeren
                </button>
              )}
              {currentStatus === "ACTIVE" && (
                <button
                  onClick={() => confirmAction("PAUSE")}
                  className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-100 transition-colors"
                >
                  Pauzeren
                </button>
              )}
              {currentStatus !== "CLOSED" && (
                <button
                  onClick={() => confirmAction("CLOSE")}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Sluiten
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
          confirmVariant={pendingAction === "CLOSE" ? "destructive" : "default"}
          onConfirm={handleConfirm}
          loading={isPending}
        />
      )}
    </>
  )
}
