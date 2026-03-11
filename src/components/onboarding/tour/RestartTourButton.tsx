"use client"

import { Sparkles } from "lucide-react"
import type { TourId } from "./types"

export function RestartTourButton({
  tourId,
  label = "Rondleiding opnieuw starten",
}: {
  tourId: TourId
  label?: string
}) {
  const handleClick = () => {
    const fn = (window as Record<string, unknown>)[`__restartTour_${tourId}`]
    if (typeof fn === "function") {
      ;(fn as () => void)()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      <Sparkles className="w-4 h-4 text-orange-400" />
      {label}
    </button>
  )
}
