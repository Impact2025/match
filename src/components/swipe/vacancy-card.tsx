"use client"

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { MapPin, Clock, Wifi, ChevronRight, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiScoreBadge } from "./ai-score-badge"
import { CATEGORIES } from "@/config"
import { useGemeenteColor } from "@/lib/gemeente-context"
import type { VacancyWithOrgAndDistance } from "@/types"

interface VacancyCardProps {
  vacancy: VacancyWithOrgAndDistance
  stackIndex: number
  onSwipe: (direction: "LIKE" | "DISLIKE") => void
  isTop: boolean
  onExpand?: () => void
}

const SWIPE_THRESHOLD = 100

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
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function VacancyCard({ vacancy, stackIndex, onSwipe, isTop, onExpand }: VacancyCardProps) {
  const { primaryColor, accentColor } = useGemeenteColor()
  const { distanceKm, matchScore } = vacancy
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-15, 15])
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0])

  const scale = 1 - stackIndex * 0.04
  const yOffset = stackIndex * 10

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("LIKE")
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("DISLIKE")
  }

  const firstCategory = vacancy.categories?.[0]?.category?.name
  const catInfo = firstCategory ? CAT_MAP[firstCategory] : null
  const catEmoji = firstCategory ? (CAT_EMOJI[firstCategory] ?? "🌟") : "🌟"
  const catColor = catInfo?.color ?? primaryColor

  // Org gradient: alternate between primary→accent and accent→primary per org name
  const idx = vacancy.organisation.name.charCodeAt(0) % 2
  const [gradFrom, gradTo] = idx === 0 ? [primaryColor, accentColor] : [accentColor, primaryColor]

  const highlights = isTop ? (matchScore?.highlights ?? []).slice(0, 2) : []
  const hasHighlights = highlights.length > 0

  const chipBg = `${primaryColor}18`
  const chipBorder = `${primaryColor}33`

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale,
        y: yOffset,
        zIndex: 10 - stackIndex,
        touchAction: isTop ? "pan-y" : "none",
      }}
      drag={isTop ? "x" : false}
      dragElastic={0.75}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={{ scale, y: yOffset }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="h-full bg-white rounded-3xl shadow-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col">

        {/* ── LIKE / NOPE stamps ── */}
        {isTop && (
          <>
            <motion.div
              className="absolute inset-0 z-20 flex items-start justify-start pt-10 pl-5 pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              <span className="border-[3px] border-green-500 text-green-500 font-black text-2xl tracking-widest px-4 py-1 rounded-xl rotate-[-18deg] bg-white/10 backdrop-blur-sm">
                LEUK!
              </span>
            </motion.div>
            <motion.div
              className="absolute inset-0 z-20 flex items-start justify-end pt-10 pr-5 pointer-events-none"
              style={{ opacity: dislikeOpacity }}
            >
              <span className="border-[3px] border-red-500 text-red-500 font-black text-2xl tracking-widest px-4 py-1 rounded-xl rotate-[18deg] bg-white/10 backdrop-blur-sm">
                NOPE
              </span>
            </motion.div>
          </>
        )}

        {/* ── IMAGE AREA (60% of card) ── */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ flex: "0 0 60%" }}>
          {vacancy.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${vacancy.imageUrl}')` }}
            />
          ) : (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }}
            >
              {/* Subtle diagonal stripe texture */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                  backgroundSize: "14px 14px",
                }}
              />
              {/* Glow blobs */}
              <div
                className="absolute -top-12 -left-12 w-52 h-52 rounded-full opacity-30 blur-3xl"
                style={{ background: gradTo }}
              />
              <div
                className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full opacity-30 blur-3xl"
                style={{ background: gradFrom }}
              />
              {/* Category visual */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <span className="text-6xl drop-shadow-sm">{catEmoji}</span>
                {firstCategory && (
                  <span className="text-white/70 text-[11px] font-bold tracking-widest uppercase px-6 text-center line-clamp-1">
                    {firstCategory}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match score ring – top right */}
          <div className="absolute top-3 right-3 z-10">
            <AiScoreBadge score={matchScore?.rawTotal ?? matchScore?.total} />
          </div>

          {/* Org avatar – top left */}
          <div className="absolute top-3 left-3 z-10">
            <Avatar className="w-10 h-10 border-2 border-white/90 shadow-md">
              <AvatarImage src={vacancy.organisation.logo ?? ""} alt={vacancy.organisation.name} />
              <AvatarFallback
                className="text-white text-[11px] font-black"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
              >
                {orgInitials(vacancy.organisation.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Bottom gradient + text overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-4">
            {firstCategory && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[11px] font-bold"
                  style={{ backgroundColor: `${catColor}cc` }}
                >
                  <span className="text-[10px]">{catEmoji}</span>
                  {firstCategory}
                </span>
              </div>
            )}
            <h2 className="text-white font-bold text-[19px] leading-snug line-clamp-2 drop-shadow-sm">
              {vacancy.title}
            </h2>
            <p className="text-white/70 text-[13px] font-medium mt-0.5 truncate">
              {vacancy.organisation.name}
            </p>
          </div>
        </div>

        {/* ── CONTENT AREA (40% of card) ── */}
        <div className="flex-1 min-h-0 flex flex-col px-4 pt-3 pb-3 gap-2 overflow-hidden">

          {/* Meta chips */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 flex-shrink-0">
            {(vacancy.city || vacancy.location) && (
              <span className="flex items-center gap-1 text-[12px] text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                {vacancy.city ?? vacancy.location}
              </span>
            )}
            {distanceKm != null && !vacancy.remote && (
              <span className="text-[12px] font-semibold" style={{ color: primaryColor }}>
                · {distanceKm} km
              </span>
            )}
            {vacancy.remote && (
              <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: primaryColor }}>
                <Wifi className="w-3.5 h-3.5" /> Op afstand
              </span>
            )}
            {vacancy.hours && (
              <span className="flex items-center gap-1 text-[12px] text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                {vacancy.hours}u/week
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className={`text-[13px] text-gray-600 leading-relaxed flex-1 min-h-0 ${
              hasHighlights ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {vacancy.description}
          </p>

          {/* Match highlights */}
          {hasHighlights && (
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                  style={{ backgroundColor: chipBg, color: primaryColor, borderColor: chipBorder }}
                >
                  <Check className="w-2.5 h-2.5 flex-shrink-0" />
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Skill chips + details button */}
          <div className="flex items-end justify-between gap-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {vacancy.skills && vacancy.skills.length > 0 && (
                <>
                  {vacancy.skills.slice(0, 3).map(({ skill }) => (
                    <span
                      key={skill.id}
                      className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full border"
                      style={{ backgroundColor: chipBg, color: primaryColor, borderColor: chipBorder }}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {vacancy.skills.length > 3 && (
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-full">
                      +{vacancy.skills.length - 3}
                    </span>
                  )}
                </>
              )}
            </div>
            {isTop && onExpand && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onExpand()
                }}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 hover:bg-gray-700 text-white text-[11px] font-bold transition-colors"
                aria-label="Meer informatie"
              >
                Details <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
