"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { MessageCircle, Clock, Building2, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "In afwachting", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Geaccepteerd", className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED: { label: "Afgewezen", className: "bg-gray-100 text-gray-600 border-gray-200" },
  COMPLETED: { label: "Afgerond", className: "bg-blue-100 text-blue-700 border-blue-200" },
}

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useQuery<any[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await fetch("/api/matches")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijn matches</h1>
        <p className="text-sm text-gray-500 mt-1">
          {matches.length} {matches.length === 1 ? "match" : "matches"} gevonden
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nog geen matches</h3>
          <p className="text-gray-500 text-sm">Ga swipen om je eerste match te vinden!</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
            <Link href="/swipe">Begin met swipen</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: any) => {
            const statusConfig = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.PENDING
            const conversationId = match.conversation?.id

            return (
              <div
                key={match.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage
                      src={match.vacancy?.organisation?.logo ?? ""}
                      alt={match.vacancy?.organisation?.name}
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                      {match.vacancy?.organisation?.name?.charAt(0) ?? "O"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {match.vacancy?.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {match.vacancy?.organisation?.name}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {match.vacancy?.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {match.vacancy.city}
                        </div>
                      )}
                      {match.vacancy?.distanceKm != null && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.vacancy.distanceKm === 0
                            ? "Op afstand"
                            : `${match.vacancy.distanceKm} km`}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(match.createdAt).toLocaleDateString("nl-NL")}
                      </div>
                    </div>

                    {match.status === "ACCEPTED" && conversationId && (
                      <div className="mt-3">
                        <Button
                          asChild
                          size="sm"
                          className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                        >
                          <Link href={`/chat?conversationId=${conversationId}`}>
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat openen
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
