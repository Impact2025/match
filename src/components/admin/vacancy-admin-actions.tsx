"use client"

import { useState, useTransition } from "react"
import { VacancyStatus } from "@prisma/client"
import { updateVacancyStatus } from "@/app/(admin)/admin/vacancies/actions"
import { MoreHorizontal, Loader2 } from "lucide-react"

interface VacancyAdminActionsProps {
  vacancyId: string
  currentStatus: VacancyStatus
}

export function VacancyAdminActions({ vacancyId, currentStatus }: VacancyAdminActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAction = (action: "PAUSE" | "CLOSE" | "ACTIVATE") => {
    setOpen(false)
    startTransition(async () => {
      await updateVacancyStatus(vacancyId, action)
    })
  }

  if (isPending) {
    return <Loader2 className="w-4 h-4 animate-spin text-white/30" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 py-1.5 min-w-[160px]">
            {currentStatus !== "ACTIVE" && (
              <button
                onClick={() => handleAction("ACTIVATE")}
                className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-white/[0.04] transition-colors"
              >
                Activeren
              </button>
            )}
            {currentStatus === "ACTIVE" && (
              <button
                onClick={() => handleAction("PAUSE")}
                className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-white/[0.04] transition-colors"
              >
                Pauzeren
              </button>
            )}
            {currentStatus !== "CLOSED" && (
              <button
                onClick={() => handleAction("CLOSE")}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/[0.04] transition-colors"
              >
                Sluiten
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
