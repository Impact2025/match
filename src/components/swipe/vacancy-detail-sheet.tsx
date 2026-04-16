"use client"

import { MapPin, Clock, Wifi, Calendar, Building2, Check, Heart, Navigation, Zap, Sparkles, CalendarDays, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CATEGORIES } from "@/config"
import { useGemeenteColor } from "@/lib/gemeente-context"
import type { MatchScore, VacancyWithOrgAndDistance } from "@/types"

const CAT_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, { color: c.color }])
)

const CAT_EMOJI: Record<string, string> = {
  "Kinderen (0–12 jaar)": "🧒",
  "Jongeren (12–18 jaar)": "🧑‍🎓",
  "Ouderen": "👴",
  "Mensen met een beperking": "♿",
  "Gezinnen & Ouderschap": "👨‍👩‍👧",
  "Daklozen & Armoede": "🤝",
  "Vluchtelingen & Integratie": "🌍",
  "Verslaving & Herstel": "💪",
  "Justitie & Re-integratie": "⚖️",
  "Onderwijs": "📚",
  "Zorg & Welzijn": "❤️",
  "Gezondheid": "🏥",
  "Sport & Recreatie": "⚽",
  "Cultuur & Kunst": "🎨",
  "Natuur & Milieu": "🌱",
  "Dieren": "🐾",
  "Levensbeschouwing & Religie": "🕊️",
  "Internationale samenwerking": "🌐",
  "Buurt & Gemeenschap": "🏘️",
  "Technologie": "💻",
  "Evenementen": "🎉",
  "Financieel / Schuldhulp": "💰",
  "Anders / Overig": "✨",
}

function orgInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

// Parse description: bullet lines (starting with •, -, *) → proper list items
function DescriptionBody({ text, primaryColor }: { text: string; primaryColor: string }) {
  const paragraphs = text.split(/\n{2,}/)
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean)
        const isList = lines.every((l) => /^[•\-\*]/.test(l))
        if (isList) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: primaryColor }} />
                  {l.replace(/^[•\-\*]\s*/, "")}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {para}
          </p>
        )
      })}
    </div>
  )
}

// ─── Match score breakdown panel ───────────────────────────────────────────

const SCORE_DIMS: { key: keyof MatchScore; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "motivation", label: "Motivatie",   Icon: Heart },
  { key: "distance",   label: "Nabijheid",   Icon: Navigation },
  { key: "skill",      label: "Skills",      Icon: Zap },
  { key: "freshness",  label: "Actualiteit", Icon: Sparkles },
]

function MatchScorePanel({ matchScore, primaryColor, accentColor }: { matchScore: MatchScore; primaryColor: string; accentColor: string }) {
  const total = Math.round(matchScore.rawTotal ?? matchScore.total)

  function scoreColor(score: number): string {
    if (score >= 75) return primaryColor
    if (score >= 50) return accentColor
    return "#fbbf24"
  }

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
        {SCORE_DIMS.map(({ key, label, Icon }) => {
          const val = Math.round(matchScore[key] as number)
          const barColor = scoreColor(val)
          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-500 w-[68px] flex-shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${val}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="text-[11px] font-semibold w-7 text-right flex-shrink-0" style={{ color: barColor }}>
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor, borderColor: `${primaryColor}33` }}
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

interface OrgActivity {
  id: string
  title: string
  type: string
  startDateTime: string
  online: boolean
  city?: string | null
  maxCapacity?: number | null
  registrations?: { status: string }[]
}

function OrgActivitiesSection({ orgId, primaryColor }: { orgId: string; primaryColor: string }) {
  const [activities, setActivities] = useState<OrgActivity[]>([])

  useEffect(() => {
    fetch(`/api/activities?organisationId=${orgId}&take=3`)
      .then((r) => r.json())
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => {})
  }, [orgId])

  if (activities.length === 0) return null

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          Eerst kennismaken?
        </h3>
        <Link
          href="/activiteiten"
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: primaryColor }}
        >
          Meer <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <p className="text-xs text-gray-400">Kom langs bij een activiteit voordat je je aanmeldt als vrijwilliger.</p>
      <div className="space-y-2">
        {activities.map((a) => {
          const start = new Date(a.startDateTime)
          const activeRegs = (a.registrations ?? []).filter(
            (r) => r.status === "REGISTERED" || r.status === "WAITLISTED"
          ).length
          const isFull = a.maxCapacity ? activeRegs >= a.maxCapacity : false
          return (
            <Link
              key={a.id}
              href={`/activiteiten/${a.id}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 transition-all"
            >
              <div
                className="flex-shrink-0 text-center rounded-lg px-2 py-1.5 min-w-[34px]"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <div className="text-sm font-black leading-none" style={{ color: primaryColor }}>
                  {start.getDate()}
                </div>
                <div className="text-[8px] font-bold uppercase leading-none mt-0.5" style={{ color: primaryColor }}>
                  {start.toLocaleDateString("nl-NL", { month: "short" })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{a.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {start.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  {a.city ? ` · ${a.city}` : a.online ? " · Online" : ""}
                </p>
              </div>
              {isFull ? (
                <span className="text-[10px] text-amber-500 font-semibold flex-shrink-0">Vol</span>
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function VacancyDetailSheet({ vacancy, open, onClose }: VacancyDetailSheetProps) {
  const { primaryColor, accentColor } = useGemeenteColor()
  if (!vacancy) return null

  const idx = vacancy.organisation.name.charCodeAt(0) % 2
  const [gradFrom, gradTo] = idx === 0 ? [primaryColor, accentColor] : [accentColor, primaryColor]
  const categories = vacancy.categories ?? []
  const firstCategory = categories[0]?.category?.name
  const catEmoji = firstCategory ? (CAT_EMOJI[firstCategory] ?? "🌟") : null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85svh] rounded-t-3xl p-0 overflow-hidden flex flex-col">
        {/* Header image/gradient — taller for more visual impact */}
        <div
          className="relative flex-shrink-0 h-48 flex items-end overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }}
        >
          {vacancy.imageUrl ? (
            <img
              src={vacancy.imageUrl}
              alt={vacancy.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Texture */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                  backgroundSize: "14px 14px",
                }}
              />
              {/* Glow blobs */}
              <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full opacity-30 blur-3xl" style={{ background: gradTo }} />
              <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full opacity-30 blur-3xl" style={{ background: gradFrom }} />
              {/* Category emoji centered */}
              {catEmoji && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-7xl drop-shadow-sm">{catEmoji}</span>
                </div>
              )}
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 p-4 flex items-end gap-3 w-full">
            <Avatar className="w-11 h-11 border-2 border-white/90 shadow-md flex-shrink-0">
              <AvatarImage src={vacancy.organisation.logo ?? ""} alt={vacancy.organisation.name} />
              <AvatarFallback
                className="text-white text-[12px] font-black"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
              >
                {orgInitials(vacancy.organisation.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-white font-bold text-base leading-tight line-clamp-2 text-left">
                {vacancy.title}
              </SheetTitle>
              <p className="text-white/70 text-[13px] truncate">{vacancy.organisation.name}</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {(vacancy.city || vacancy.location) && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {vacancy.city ?? vacancy.location}
                {vacancy.distanceKm != null && !vacancy.remote && (
                  <span className="font-semibold" style={{ color: primaryColor }}>· {vacancy.distanceKm} km</span>
                )}
              </span>
            )}
            {vacancy.remote && (
              <span
                className="flex items-center gap-1.5 text-sm rounded-full px-3 py-1"
                style={{ color: primaryColor, backgroundColor: `${primaryColor}18` }}
              >
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
          {vacancy.matchScore && <MatchScorePanel matchScore={vacancy.matchScore} primaryColor={primaryColor} accentColor={accentColor} />}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map(({ category }) => {
                const catInfo = CAT_MAP[category.name]
                const color = catInfo?.color ?? primaryColor
                const emoji = CAT_EMOJI[category.name] ?? "🌟"
                return (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border"
                    style={{
                      backgroundColor: `${color}18`,
                      borderColor: `${color}40`,
                      color,
                    }}
                  >
                    <span className="text-[11px]">{emoji}</span>
                    {category.name}
                  </span>
                )
              })}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Over deze vacature</h3>
            <DescriptionBody text={vacancy.description} primaryColor={primaryColor} />
          </div>

          {/* Skills */}
          {vacancy.skills && vacancy.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Gevraagde vaardigheden</h3>
              <div className="flex flex-wrap gap-1.5">
                {vacancy.skills.map(({ skill }) => (
                  <span
                    key={skill.id}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full border"
                    style={{ backgroundColor: `${primaryColor}18`, color: primaryColor, borderColor: `${primaryColor}33` }}
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
                className="text-xs hover:underline mt-1 block"
                style={{ color: primaryColor }}
              >
                {vacancy.organisation.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          {/* Kennismaken via activiteit */}
          <OrgActivitiesSection orgId={vacancy.organisation.id} primaryColor={primaryColor} />

          <div className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
