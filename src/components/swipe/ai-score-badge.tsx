"use client"

import { useGemeenteColor } from "@/lib/gemeente-context"

const RADIUS = 13
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AiScoreBadgeProps {
  score?: number
}

export function AiScoreBadge({ score = 50 }: AiScoreBadgeProps) {
  const { primaryColor, accentColor } = useGemeenteColor()
  const pct = Math.round(Math.max(0, Math.min(100, score)))

  function ringColor(s: number): string {
    if (s >= 75) return primaryColor
    if (s >= 50) return accentColor
    return "#fbbf24"
  }

  const color = ringColor(pct)
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE

  return (
    <div className="relative flex items-center justify-center w-[44px] h-[44px]">
      {/* Frosted-glass backdrop */}
      <div className="absolute inset-0 rounded-full bg-black/35 backdrop-blur-sm" />

      {/* Circular progress ring */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 36 36"
        width="44"
        height="44"
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`${pct}% match`}
        role="img"
      >
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth="2.5"
          stroke="rgba(255,255,255,0.18)"
        />
        {/* Progress arc */}
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth="2.5"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>

      {/* Percentage label */}
      <span className="relative z-10 text-white font-black leading-none" style={{ fontSize: 9 }}>
        {pct}%
      </span>
    </div>
  )
}
