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
                onClick={() => handleAction("ACTIVATE")}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors"
              >
                Activeren
              </button>
            )}
            {currentStatus === "ACTIVE" && (
              <button
                onClick={() => handleAction("PAUSE")}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-100 transition-colors"
              >
                Pauzeren
              </button>
            )}
            {currentStatus !== "CLOSED" && (
              <button
                onClick={() => handleAction("CLOSE")}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
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
