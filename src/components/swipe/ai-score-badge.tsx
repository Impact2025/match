"use client"

import { useQuery } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"

interface AiScoreBadgeProps {
  vacancyId: string
}

export function AiScoreBadge({ vacancyId }: AiScoreBadgeProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["match-score", vacancyId],
    queryFn: async () => {
      const res = await fetch(`/api/ai/match-score?vacancyId=${vacancyId}`)
      if (!res.ok) return { score: 50 }
      return res.json() as Promise<{ score: number }>
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-400">Match...</span>
      </div>
    )
  }

  const score = data?.score ?? 50

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500 text-white shadow-md">
      <Sparkles className="w-3 h-3 text-white" />
      <span className="text-xs font-bold">{score}% AI Match</span>
    </div>
  )
}
