"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { TOURS } from "@/config/tours"
import type { TourId, TourConfig, TourStep } from "./types"

// ── Storage ─────────────────────────────────────────────────────────────────
const STORAGE_VERSION = "v2"
const storageKey = (id: TourId) => `tour_completed_${STORAGE_VERSION}_${id}`

// ── Geometry helpers ─────────────────────────────────────────────────────────
interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
  borderRadius: number
}

interface TooltipPos {
  top?: number
  left?: number
}

const TOOLTIP_W = 296
const TOOLTIP_H = 168

function getTargetRect(target: string, padding = 8): SpotlightRect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour-id="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  // Element must be visible on screen
  if (r.width === 0 && r.height === 0) return null
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
    borderRadius: 14,
  }
}

function calcTooltipPos(s: SpotlightRect, placement: TourStep["placement"]): TooltipPos {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 14

  const clampLeft = (l: number) => Math.max(8, Math.min(l, vw - TOOLTIP_W - 8))
  const clampTop = (t: number) => Math.max(8, Math.min(t, vh - TOOLTIP_H - 8))

  switch (placement) {
    case "top":
      return {
        top: clampTop(s.top - TOOLTIP_H - gap),
        left: clampLeft(s.left + s.width / 2 - TOOLTIP_W / 2),
      }
    case "bottom":
      return {
        top: clampTop(s.top + s.height + gap),
        left: clampLeft(s.left + s.width / 2 - TOOLTIP_W / 2),
      }
    case "left":
      return {
        top: clampTop(s.top + s.height / 2 - TOOLTIP_H / 2),
        left: clampLeft(s.left - TOOLTIP_W - gap),
      }
    case "right":
      return {
        top: clampTop(s.top + s.height / 2 - TOOLTIP_H / 2),
        left: clampLeft(s.left + s.width + gap),
      }
  }
}

function centeredPos(): TooltipPos {
  return {
    top: Math.max(8, window.innerHeight / 2 - TOOLTIP_H / 2),
    left: Math.max(8, window.innerWidth / 2 - TOOLTIP_W / 2),
  }
}

// ── WelcomeModal ─────────────────────────────────────────────────────────────
function WelcomeModal({
  tour,
  color,
  onStart,
  onSkip,
}: {
  tour: TourConfig
  color: string
  onStart: () => void
  onSkip: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onSkip}
        aria-hidden
      />

      {/* Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-welcome-title"
        className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
        initial={{ y: 48, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 48, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.06 }}
      >
        {/* Gradient top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Sluiten"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>

        <div className="text-4xl mb-3 select-none" aria-hidden>
          {tour.welcomeEmoji}
        </div>
        <h2 id="tour-welcome-title" className="text-xl font-bold text-gray-900 mb-1.5">
          {tour.welcomeTitle}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{tour.welcomeSubtitle}</p>

        {/* Steps preview */}
        <div className="space-y-2.5 mb-6">
          {tour.steps.slice(0, 4).map((step, i) => (
            <div key={step.id} className="flex items-start gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: color }}
              >
                {i + 1}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{step.title}</p>
            </div>
          ))}
          {tour.steps.length > 4 && (
            <p className="text-xs text-gray-400 pl-7">+ {tour.steps.length - 4} meer…</p>
          )}
        </div>

        {/* Primary CTA */}
        <button
          onClick={onStart}
          className="w-full py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Sparkles className="w-4 h-4" />
          Start rondleiding
        </button>
        <button
          onClick={onSkip}
          className="w-full mt-2 py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
        >
          Overslaan, ik zoek het zelf uit
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── TourLauncher ─────────────────────────────────────────────────────────────
export interface TourLauncherProps {
  tourId: TourId
  /** Override accent colour (e.g. gemeente branding) */
  accentColor?: string
  /** Override welcome modal title (e.g. "Welkom bij WijHeemstede!") */
  welcomeTitle?: string
}

type Phase = "idle" | "welcome" | "touring" | "done"

export function TourLauncher({ tourId, accentColor, welcomeTitle }: TourLauncherProps) {
  const tour = TOURS[tourId]
  const color = accentColor ?? tour.accentColor
  const resolvedTour = welcomeTitle ? { ...tour, welcomeTitle } : tour

  const [phase, setPhase] = useState<Phase>("idle")
  const [stepIdx, setStepIdx] = useState(0)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null)
  const [mounted, setMounted] = useState(false)

  const key = storageKey(tourId)

  // Mount + always show (demo mode — remove localStorage guard to restore normal behaviour)
  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setPhase("welcome"), 750)
    return () => clearTimeout(t)
  }, [key])

  // Re-position spotlight whenever step changes
  useEffect(() => {
    if (phase !== "touring") return
    const step = tour.steps[stepIdx]
    if (!step) return

    const update = () => {
      const rect = getTargetRect(step.target, step.spotlightPadding ?? 8)
      if (rect) {
        setSpotlight(rect)
        setTooltipPos(calcTooltipPos(rect, step.placement))
        if (step.scrollIntoView !== false) {
          document
            .querySelector(`[data-tour-id="${step.target}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
      } else {
        setSpotlight(null)
        setTooltipPos(centeredPos())
      }
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [phase, stepIdx, tour.steps])

  const finish = useCallback(() => {
    localStorage.setItem(key, "1")
    setPhase("done")
    setSpotlight(null)
    setTooltipPos(null)
  }, [key])

  const advance = useCallback(() => {
    if (stepIdx < tour.steps.length - 1) setStepIdx((i) => i + 1)
    else finish()
  }, [stepIdx, tour.steps.length, finish])

  const back = useCallback(() => {
    if (stepIdx > 0) setStepIdx((i) => i - 1)
  }, [stepIdx])

  // Keyboard navigation
  useEffect(() => {
    if (phase === "idle" || phase === "done") return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish()
      if (phase === "touring") {
        if (e.key === "ArrowRight" || e.key === "Enter") advance()
        if (e.key === "ArrowLeft") back()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [phase, advance, back, finish])

  // Expose restart function on window for RestartTourButton
  useEffect(() => {
    const restart = () => {
      localStorage.removeItem(key)
      setStepIdx(0)
      setPhase("welcome")
    }
    const wKey = `__restartTour_${tourId}` as keyof Window
    ;(window as unknown as Record<string, unknown>)[wKey as string] = restart
    return () => {
      delete (window as unknown as Record<string, unknown>)[wKey as string]
    }
  }, [key, tourId])

  if (!mounted || phase === "idle" || phase === "done") return null

  const step = tour.steps[stepIdx]

  return createPortal(
    <AnimatePresence>
      {phase === "welcome" && (
        <WelcomeModal
          key="welcome"
          tour={resolvedTour}
          color={color}
          onStart={() => {
            setStepIdx(0)
            setPhase("touring")
          }}
          onSkip={finish}
        />
      )}

      {phase === "touring" && step && (
        <>
          {/* Click-to-skip overlay (behind spotlight) */}
          <motion.div
            key="click-overlay"
            className="fixed inset-0 z-[9997]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={finish}
            aria-hidden
          />

          {/* Spotlight box — uses huge box-shadow to darken rest of screen */}
          {spotlight ? (
            <motion.div
              key="spotlight"
              layout
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed z-[9998] pointer-events-none"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                borderRadius: spotlight.borderRadius,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
                border: `2px solid ${color}55`,
              }}
            />
          ) : (
            /* Fallback: full dark overlay when element not in DOM */
            <motion.div
              key="full-overlay"
              className="fixed inset-0 z-[9998] pointer-events-none"
              style={{ background: "rgba(0,0,0,0.62)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Tooltip card */}
          {tooltipPos && (
            <motion.div
              key={`tip-${stepIdx}`}
              role="tooltip"
              className="fixed z-[9999] bg-white rounded-2xl shadow-2xl p-4 pointer-events-auto"
              style={{ width: TOOLTIP_W, ...tooltipPos }}
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* Progress dots */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  {tour.steps.map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 rounded-full"
                      animate={{
                        width: i === stepIdx ? 20 : 6,
                        backgroundColor: i === stepIdx ? color : "#e5e7eb",
                      }}
                      transition={{ duration: 0.22 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium tabular-nums">
                  {stepIdx + 1} / {tour.steps.length}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{step.content}</p>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={finish}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Overslaan
                </button>
                <div className="flex items-center gap-2">
                  {stepIdx > 0 && (
                    <button
                      onClick={back}
                      className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      aria-label="Vorige stap"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={advance}
                    className="h-8 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-1 transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ backgroundColor: color }}
                    aria-label={
                      stepIdx === tour.steps.length - 1
                        ? "Rondleiding afsluiten"
                        : "Volgende stap"
                    }
                  >
                    {stepIdx === tour.steps.length - 1 ? (
                      "Klaar 🎉"
                    ) : (
                      <>
                        Volgende <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
