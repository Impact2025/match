"use client"

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { MapPin, Clock, Wifi, Info } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiScoreBadge } from "./ai-score-badge"
import { CATEGORIES } from "@/config"
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
  CATEGORIES.map((c) => [c.name, { icon: c.icon, color: c.color }])
)

// Per-org deterministic gradient pair so every card looks unique
const GRADIENT_PAIRS = [
  ["#f97316", "#f59e0b"], // orange–amber
  ["#06b6d4", "#3b82f6"], // cyan–blue
  ["#a855f7", "#ec4899"], // purple–pink
  ["#22c55e", "#14b8a6"], // green–teal
  ["#f43f5e", "#f97316"], // rose–orange
  ["#6366f1", "#06b6d4"], // indigo–cyan
  ["#84cc16", "#22c55e"], // lime–green
  ["#f59e0b", "#f43f5e"], // amber–rose
]

function orgGradient(name: string): [string, string] {
  const idx = name.charCodeAt(0) % GRADIENT_PAIRS.length
  return GRADIENT_PAIRS[idx] as [string, string]
}

function orgInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

export function VacancyCard({ vacancy, stackIndex, onSwipe, isTop, onExpand }: VacancyCardProps) {
  const { distanceKm } = vacancy
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
  const [gradFrom, gradTo] = orgGradient(vacancy.organisation.name)

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
        <div className="relative flex-shrink-0" style={{ flex: "0 0 60%" }}>
          {vacancy.imageUrl ? (
            <img
              src={vacancy.imageUrl}
              alt={vacancy.title}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            /* Rich no-image fallback */
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }}
            >
              {/* Soft blurred circles for depth */}
              <div
                className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 blur-3xl"
                style={{ background: gradTo }}
              />
              <div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl"
                style={{ background: gradFrom }}
              />
              {/* Big category emoji */}
              <span className="text-[80px] leading-none drop-shadow-lg select-none z-10">
                {catInfo?.icon ?? "🧡"}
              </span>
            </div>
          )}

          {/* AI badge – top right */}
          <div className="absolute top-3 right-3 z-10">
            <AiScoreBadge vacancyId={vacancy.id} />
          </div>

          {/* Org avatar – top left */}
          <div className="absolute top-3 left-3 z-10">
            <Avatar className="w-9 h-9 border-2 border-white/90 shadow-md">
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
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-14 pb-3 px-4">
            {firstCategory && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-[11px] font-semibold">
                  {catInfo?.icon} {firstCategory}
                </span>
              </div>
            )}
            <h2 className="text-white font-bold text-[19px] leading-snug line-clamp-2 drop-shadow-sm">
              {vacancy.title}
            </h2>
            <p className="text-white/75 text-[13px] font-medium mt-0.5 truncate">
              {vacancy.organisation.name}
            </p>
          </div>
        </div>

        {/* ── CONTENT AREA (40% of card) ── */}
        <div className="flex-1 min-h-0 flex flex-col px-4 pt-3 pb-3 gap-2.5 overflow-hidden">
          {/* Meta chips */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            {(vacancy.city || vacancy.location) && (
              <span className="flex items-center gap-1 text-[12px] text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                {vacancy.city ?? vacancy.location}
              </span>
            )}
            {distanceKm != null && !vacancy.remote && (
              <span className="text-[12px] text-orange-600 font-semibold">· {distanceKm} km</span>
            )}
            {vacancy.remote && (
              <span className="flex items-center gap-1 text-[12px] text-green-600 font-semibold">
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
          <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 flex-1 min-h-0">
            {vacancy.description}
          </p>

          {/* Skill chips + info button row */}
          <div className="flex items-end justify-between gap-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {vacancy.skills && vacancy.skills.length > 0 && (
                <>
                  {vacancy.skills.slice(0, 3).map(({ skill }) => (
                    <span
                      key={skill.id}
                      className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-semibold rounded-full border border-orange-100"
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
                onClick={(e) => { e.stopPropagation(); onExpand() }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Meer informatie"
              >
                <Info className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
