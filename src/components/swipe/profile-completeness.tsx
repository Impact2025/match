"use client"

import Link from "next/link"

interface ProfileCompletenessProps {
  percent: number
  missing: string[]
}

export function ProfileCompleteness({ percent, missing }: ProfileCompletenessProps) {
  if (percent >= 100) return null

  return (
    <Link
      href="/profile/edit"
      className="w-full flex items-center gap-2.5 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100 hover:border-orange-200 transition-colors"
    >
      {/* Progress ring (simple bar) */}
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle
            cx="16" cy="16" r="12" fill="none"
            stroke="#f97316" strokeWidth="3"
            strokeDasharray={`${(percent / 100) * 75.4} 75.4`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-orange-500 leading-none">
          {percent}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 leading-tight">
          Profiel {percent}% compleet
        </p>
        {missing.length > 0 && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            Voeg toe: {missing.slice(0, 2).join(", ")}
          </p>
        )}
      </div>

      <span className="text-xs font-semibold text-orange-500 flex-shrink-0">Aanvullen →</span>
    </Link>
  )
}
