"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle } from "lucide-react"
import { VacancyCard } from "./vacancy-card"
import { SwipeActions } from "./swipe-actions"
import { MatchModal } from "./match-modal"
import { MatchReasonSheet } from "./match-reason-sheet"
import { DailyLimitScreen } from "./daily-limit-screen"
import { VacancyDetailSheet } from "./vacancy-detail-sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { VacancyWithOrgAndDistance, MatchReason } from "@/types"

const DAILY_LIMIT = 15

function getTodaySwipeCount(): number {
  if (typeof window === "undefined") return 0
  try {
    const s = localStorage.getItem("swipeSession")
    if (!s) return 0
    const p = JSON.parse(s)
    return p.date === new Date().toDateString() ? (p.count ?? 0) : 0
  } catch {
    return 0
  }
}

function persistSwipeCount(count: number) {
  if (typeof window === "undefined") return
  localStorage.setItem("swipeSession", JSON.stringify({ date: new Date().toDateString(), count }))
}

export function SwipeDeck() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [currentIndex, setCurrentIndex] = useState(0)
  const prevDataRef = useRef<VacancyWithOrgAndDistance[] | undefined>(undefined)
  const [exiting, setExiting] = useState<{ id: string; dir: "left" | "right" } | null>(null)
  const [matchModal, setMatchModal] = useState<{
    open: boolean
    matchId?: string
    conversationId?: string
    orgName?: string
    orgLogo?: string
  }>({ open: false })

  const [reasonSheet, setReasonSheet] = useState<{
    open: boolean
    pendingDir: "LIKE" | "SUPER_LIKE" | null
    pendingId: string | null
  }>({ open: false, pendingDir: null, pendingId: null })

  const [streakDays, setStreakDays] = useState(0)
  const [todayCount, setTodayCount] = useState<number>(getTodaySwipeCount)
  const [lastSwipe, setLastSwipe] = useState<VacancyWithOrgAndDistance | null>(null)
  const [detailVacancy, setDetailVacancy] = useState<VacancyWithOrgAndDistance | null>(null)

  const { data: vacancies, isLoading, isFetching, error } = useQuery<VacancyWithOrgAndDistance[]>({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies?take=15")
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
      }
      return res.json()
    },
  })

  // Fetch today's swipe count from server on mount
  useEffect(() => {
    fetch("/api/swipes?count=today")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.todayCount != null) {
          setTodayCount(data.todayCount)
          persistSwipeCount(data.todayCount)
        }
      })
      .catch(() => {/* fall back to localStorage */})
  }, [])

  // Reset currentIndex when fresh data arrives after an invalidation refetch
  useEffect(() => {
    if (vacancies && vacancies !== prevDataRef.current) {
      if (prevDataRef.current !== undefined) {
        setCurrentIndex(0)
      }
      prevDataRef.current = vacancies
    }
  }, [vacancies])

  const deck = vacancies ?? []

  const swipeMutation = useMutation({
    mutationFn: async ({
      vacancyId,
      direction,
      matchReason,
      scoreSnapshot,
    }: {
      vacancyId: string
      direction: "LIKE" | "DISLIKE" | "SUPER_LIKE"
      matchReason?: MatchReason
      scoreSnapshot?: Record<string, unknown>
    }) => {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId, direction, matchReason, scoreSnapshot }),
      })
      if (!res.ok) throw new Error("Failed to swipe")
      return res.json() as Promise<{
        matched: boolean
        matchId?: string
        conversationId?: string
        streakDays?: number
        todaySwipeCount?: number
      }>
    },
    onSuccess: (data, variables) => {
      // Update streak + count from server response
      if (data.streakDays !== undefined) setStreakDays(data.streakDays)
      if (data.todaySwipeCount !== undefined) {
        setTodayCount(data.todaySwipeCount)
        persistSwipeCount(data.todaySwipeCount)
      }

      if (data.matched) {
        const vacancy = deck.find((v) => v.id === variables.vacancyId)
        setMatchModal({
          open: true,
          matchId: data.matchId,
          conversationId: data.conversationId,
          orgName: vacancy?.organisation.name,
          orgLogo: vacancy?.organisation.logo ?? undefined,
        })
        queryClient.invalidateQueries({ queryKey: ["matches"] })
      }
    },
  })

  const undoMutation = useMutation({
    mutationFn: async (vacancyId: string) => {
      const res = await fetch("/api/swipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId }),
      })
      if (!res.ok) throw new Error("Failed to undo swipe")
      return res.json()
    },
    onSuccess: () => {
      if (lastSwipe) {
        // Put card back at top of deck
        setCurrentIndex((prev) => Math.max(0, prev - 1))
        const newCount = Math.max(0, todayCount - 1)
        setTodayCount(newCount)
        persistSwipeCount(newCount)
        setLastSwipe(null)
        queryClient.invalidateQueries({ queryKey: ["matches"] })
      }
    },
  })

  const handleUndo = useCallback(() => {
    if (!lastSwipe || undoMutation.isPending) return
    undoMutation.mutate(lastSwipe.id)
  }, [lastSwipe, undoMutation])

  const executeSwipe = useCallback(
    (vacancyId: string, direction: "LIKE" | "DISLIKE" | "SUPER_LIKE", matchReason?: MatchReason) => {
      const exitDir = direction === "DISLIKE" ? "left" : "right"
      const swipedVacancy = deck.find((v) => v.id === vacancyId) ?? null
      setExiting({ id: vacancyId, dir: exitDir })

      swipeMutation.mutate(
        { vacancyId, direction, matchReason, scoreSnapshot: swipedVacancy?.matchScore ?? undefined },
        {
          onSettled: () => {
            setExiting(null)
            setCurrentIndex((prev) => prev + 1)
            setLastSwipe(swipedVacancy)
            if (deck.length - currentIndex <= 3) {
              queryClient.invalidateQueries({ queryKey: ["vacancies"] })
            }
          },
        }
      )
    },
    [deck, currentIndex, swipeMutation, queryClient]
  )

  const handleSwipe = useCallback(
    (direction: "LIKE" | "DISLIKE" | "SUPER_LIKE") => {
      if (todayCount >= DAILY_LIMIT) return

      const vacancy = deck[currentIndex]
      if (!vacancy || swipeMutation.isPending) return

      if (direction === "DISLIKE") {
        executeSwipe(vacancy.id, direction)
      } else {
        // LIKE or SUPER_LIKE → open reason sheet
        setReasonSheet({ open: true, pendingDir: direction, pendingId: vacancy.id })
      }
    },
    [deck, currentIndex, swipeMutation.isPending, todayCount, executeSwipe]
  )

  const handleReasonSelect = useCallback(
    (reason: MatchReason) => {
      setReasonSheet({ open: false, pendingDir: null, pendingId: null })
      if (reasonSheet.pendingId && reasonSheet.pendingDir) {
        executeSwipe(reasonSheet.pendingId, reasonSheet.pendingDir, reason)
      }
    },
    [reasonSheet, executeSwipe]
  )

  const handleReasonCancel = useCallback(() => {
    setReasonSheet({ open: false, pendingDir: null, pendingId: null })
  }, [])

  // Show skeleton on initial load or while refetching with no data
  if (isLoading || (isFetching && deck.length === 0)) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Skeleton className="w-full h-[min(520px,calc(100svh-13rem))] rounded-3xl" />
        <div className="flex gap-6">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
      </div>
    )
  }

  // Daily limit reached
  if (todayCount >= DAILY_LIMIT) {
    return <DailyLimitScreen streakDays={streakDays} />
  }

  const remaining = deck.slice(currentIndex, currentIndex + 3)

  if (remaining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          <Shuffle className="w-10 h-10 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Alle vacatures bekeken!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Je hebt alle beschikbare vacatures gezien. Kom later terug voor nieuwe matches.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Opnieuw laden
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Card stack */}
      <div className="relative w-full h-[min(540px,calc(100svh-13rem))]">
        <AnimatePresence>
          {remaining.map((vacancy, i) => {
            const isTop = i === 0
            const isExiting = exiting?.id === vacancy.id

            if (isExiting) {
              return (
                <motion.div
                  key={vacancy.id}
                  className="absolute inset-0"
                  initial={{ x: 0, rotate: 0, opacity: 1 }}
                  animate={{
                    x: exiting.dir === "right" ? 400 : -400,
                    rotate: exiting.dir === "right" ? 30 : -30,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ zIndex: 20 }}
                >
                  <VacancyCard
                    vacancy={vacancy}
                    stackIndex={0}
                    onSwipe={() => {}}
                    isTop={false}
                  />
                </motion.div>
              )
            }

            return (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                stackIndex={i}
                onSwipe={(dir) => handleSwipe(dir === "LIKE" ? "LIKE" : "DISLIKE")}
                isTop={isTop}
                onExpand={isTop ? () => setDetailVacancy(vacancy) : undefined}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <SwipeActions
        onDislike={() => handleSwipe("DISLIKE")}
        onLike={() => handleSwipe("LIKE")}
        onSuperLike={() => handleSwipe("SUPER_LIKE")}
        onUndo={handleUndo}
        canUndo={!!lastSwipe}
        disabled={swipeMutation.isPending || undoMutation.isPending}
      />

      {/* Match modal */}
      <MatchModal
        open={matchModal.open}
        matchId={matchModal.matchId}
        conversationId={matchModal.conversationId}
        orgName={matchModal.orgName}
        orgLogo={matchModal.orgLogo}
        userImage={session?.user?.image ?? undefined}
        onClose={() => setMatchModal({ open: false })}
      />

      {/* Match reason sheet */}
      <MatchReasonSheet
        open={reasonSheet.open}
        onSelect={handleReasonSelect}
        onCancel={handleReasonCancel}
      />

      {/* Vacancy detail sheet */}
      <VacancyDetailSheet
        vacancy={detailVacancy}
        open={!!detailVacancy}
        onClose={() => setDetailVacancy(null)}
      />
    </div>
  )
}
