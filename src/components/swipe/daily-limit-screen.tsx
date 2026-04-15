"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sun } from "lucide-react"
import { useGemeenteColor } from "@/lib/gemeente-context"

interface DailyLimitScreenProps {
  streakDays: number
}

function msUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return midnight.getTime() - now.getTime()
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function DailyLimitScreen({ streakDays }: DailyLimitScreenProps) {
  const { primaryColor } = useGemeenteColor()
  const [countdown, setCountdown] = useState(msUntilMidnight())

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(msUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 px-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${primaryColor}1a` }}
      >
        <Sun className="w-10 h-10" style={{ color: primaryColor }} />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Klaar voor vandaag!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Je hebt vandaag 15 vacatures bekeken. Kom morgen terug voor nieuwe matches!
        </p>
      </div>

      {streakDays > 0 && (
        <div
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-lg">🔥</span>
          {streakDays} dag{streakDays !== 1 ? "en" : ""} streak!
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Reset over</p>
        <p className="text-2xl font-bold font-mono text-gray-800 tabular-nums">
          {formatCountdown(countdown)}
        </p>
      </div>

      <Link
        href="/matches"
        className="flex items-center justify-center gap-2 w-full max-w-xs text-white font-semibold py-4 rounded-2xl transition-all"
        style={{ backgroundColor: primaryColor }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.88)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
      >
        Bekijk mijn matches
      </Link>
    </div>
  )
}
