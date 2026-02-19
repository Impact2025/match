"use client"

import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { MatchWithDetails } from "@/types"

interface ConversationListProps {
  selectedId?: string
  onSelect: (conversationId: string, match: MatchWithDetails) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: matches = [], isLoading } = useQuery<MatchWithDetails[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await fetch("/api/matches")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const accepted = matches.filter(
    (m) => m.status === "ACCEPTED" && m.conversation
  )

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (accepted.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm text-gray-500">
          Nog geen gesprekken. Wacht totdat een organisatie je match accepteert.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {accepted.map((match) => {
        const conversationId = (match.conversation as any)?.id
        const isSelected = selectedId === conversationId
        const org = (match.vacancy as any).organisation

        return (
          <button
            key={match.id}
            onClick={() => conversationId && onSelect(conversationId, match)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
              isSelected && "bg-orange-50 border-r-2 border-orange-500"
            )}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={org?.logo ?? ""} alt={org?.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-sm">
                {org?.name?.charAt(0) ?? "O"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{org?.name}</p>
              <p className="text-xs text-gray-500 truncate">{match.vacancy.title}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
