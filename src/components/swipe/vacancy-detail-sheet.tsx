"use client"

import { MapPin, Clock, Wifi, Calendar, Building2, Check } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CATEGORIES } from "@/config"
import type { MatchScore, VacancyWithOrgAndDistance } from "@/types"

const CAT_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, { icon: c.icon, color: c.color }])
)

const GRADIENT_PAIRS = [
  ["#f97316", "#f59e0b"],
  ["#06b6d4", "#3b82f6"],
  ["#a855f7", "#ec4899"],
  ["#22c55e", "#14b8a6"],
  ["#f43f5e", "#f97316"],
  ["#6366f1", "#06b6d4"],
  ["#84cc16", "#22c55e"],
  ["#f59e0b", "#f43f5e"],
]

function orgGradient(name: string): [string, string] {
  const idx = name.charCodeAt(0) % GRADIENT_PAIRS.length
  return GRADIENT_PAIRS[idx] as [string, string]
}

function orgInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

// ─── Match score breakdown panel ───────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "#22c55e"
  if (score >= 55) return "#f97316"
  return "#ef4444"
}

const SCORE_DIMS: { key: keyof MatchScore; label: string }[] = [
  { key: "motivation", label: "Motivatie" },
  { key: "distance",   label: "Nabijheid" },
  { key: "skill",      label: "Skills" },
  { key: "freshness",  label: "Actualiteit" },
]

function MatchScorePanel({ matchScore }: { matchScore: MatchScore }) {
  const total = Math.round(matchScore.total)
  const totalColor = scoreColor(total)

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Jouw match</span>
        <span className="text-2xl font-black" style={{ color: totalColor }}>
          {total}%
        </span>
      </div>

      {/* Total bar */}
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${total}%`, backgroundColor: totalColor }}
        />
      </div>

      {/* Component breakdown */}
      <div className="space-y-2 pt-1">
        {SCORE_DIMS.map(({ key, label }) => {
          const val = Math.round(matchScore[key] as number)
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-20 flex-shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 w-7 text-right flex-shrink-0">
                {val}
              </span>
            </div>
          )
        })}
      </div>

      {/* Highlights */}
      {matchScore.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {matchScore.highlights.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-100"
            >
              <Check className="w-2.5 h-2.5 flex-shrink-0" />
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface VacancyDetailSheetProps {
  vacancy: VacancyWithOrgAndDistance | null
  open: boolean
  onClose: () => void
}

export function VacancyDetailSheet({ vacancy, open, onClose }: VacancyDetailSheetProps) {
  if (!vacancy) return null

  const [gradFrom, gradTo] = orgGradient(vacancy.organisation.name)
  const categories = vacancy.categories ?? []

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85svh] rounded-t-3xl p-0 overflow-hidden flex flex-col">
        {/* Header image/gradient */}
        <div
          className="relative flex-shrink-0 h-36 flex items-end"
          style={{ background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }}
        >
          {vacancy.imageUrl && (
            <img
              src={vacancy.imageUrl}
              alt={vacancy.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative z-10 p-4 flex items-end gap-3 w-full">
            <Avatar className="w-10 h-10 border-2 border-white/90 shadow-md flex-shrink-0">
              <AvatarImage src={vacancy.organisation.logo ?? ""} alt={vacancy.organisation.name} />
              <AvatarFallback
                className="text-white text-[11px] font-black"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
              >
                {orgInitials(vacancy.organisation.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-white font-bold text-base leading-tight line-clamp-2 text-left">
                {vacancy.title}
              </SheetTitle>
              <p className="text-white/75 text-[13px] truncate">{vacancy.organisation.name}</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {(vacancy.city || vacancy.location) && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {vacancy.city ?? vacancy.location}
                {vacancy.distanceKm != null && !vacancy.remote && (
                  <span className="text-orange-500 font-semibold">· {vacancy.distanceKm} km</span>
                )}
              </span>
            )}
            {vacancy.remote && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 rounded-full px-3 py-1">
                <Wifi className="w-3.5 h-3.5" /> Op afstand
              </span>
            )}
            {vacancy.hours && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {vacancy.hours}u/week
              </span>
            )}
            {vacancy.duration && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {vacancy.duration}
              </span>
            )}
          </div>

          {/* Match score breakdown */}
          {vacancy.matchScore && <MatchScorePanel matchScore={vacancy.matchScore} />}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map(({ category }) => {
                const catInfo = CAT_MAP[category.name]
                return (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100"
                  >
                    {catInfo?.icon} {category.name}
                  </span>
                )
              })}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Over deze vacature</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {vacancy.description}
            </p>
          </div>

          {/* Skills */}
          {vacancy.skills && vacancy.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Gevraagde vaardigheden</h3>
              <div className="flex flex-wrap gap-1.5">
                {vacancy.skills.map(({ skill }) => (
                  <span
                    key={skill.id}
                    className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-100"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organisation info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Over de organisatie</h3>
            </div>
            <p className="text-sm font-medium text-gray-800">{vacancy.organisation.name}</p>
            {vacancy.organisation.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {vacancy.organisation.description}
              </p>
            )}
            {vacancy.organisation.city && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {vacancy.organisation.city}
              </p>
            )}
            {vacancy.organisation.website && (
              <a
                href={vacancy.organisation.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:underline mt-1 block"
              >
                {vacancy.organisation.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
