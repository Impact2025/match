"use client"

/**
 * MatchScoreBadge — circular progress ring showing the pre-computed match score.
 *
 * Replaces the old AiScoreBadge that made a separate API call per card.
 * Score is now computed server-side alongside the vacancy data, so this
 * component renders instantly with no loading state.
 */

const RADIUS = 13
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ringColor(score: number): string {
  if (score >= 75) return "#22c55e" // green-500
  if (score >= 55) return "#f97316" // orange-500
  return "#ef4444"                   // red-500
}

interface AiScoreBadgeProps {
  /** Pre-computed match score [0–100]. Defaults to 50 (neutral) when absent. */
  score?: number
}

export function AiScoreBadge({ score = 50 }: AiScoreBadgeProps) {
  const pct = Math.round(Math.max(0, Math.min(100, score)))
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
