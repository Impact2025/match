"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { MessageCircle, Clock, Building2, MapPin, Mail, Check, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const MATCH_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "In afwachting", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Geaccepteerd", className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED: { label: "Afgewezen", className: "bg-gray-100 text-gray-600 border-gray-200" },
  COMPLETED: { label: "Afgerond", className: "bg-blue-100 text-blue-700 border-blue-200" },
}

const INV_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Nieuw", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Geaccepteerd", className: "bg-green-100 text-green-700 border-green-200" },
  DECLINED: { label: "Afgewezen", className: "bg-gray-100 text-gray-600 border-gray-200" },
}

function InvitationCard({ invitation, onUpdate }: { invitation: any; onUpdate: () => void }) {
  const [loading, setLoading] = useState<"ACCEPTED" | "DECLINED" | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(invitation.conversationId ?? null)

  async function handleAction(status: "ACCEPTED" | "DECLINED") {
    setLoading(status)
    try {
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij bijwerken")
        return
      }
      const data = await res.json()
      if (status === "ACCEPTED") {
        toast.success("Uitnodiging geaccepteerd! Je kunt nu chatten.")
        if (data.conversationId) setConversationId(data.conversationId)
      } else {
        toast.info("Uitnodiging afgewezen")
      }
      onUpdate()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(null)
    }
  }

  const currentStatus = loading ? invitation.status : invitation.status
  const statusConfig = INV_STATUS[invitation.status] ?? INV_STATUS.PENDING

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={invitation.organisation?.logo ?? ""} alt={invitation.organisation?.name} />
          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
            {invitation.organisation?.name?.charAt(0) ?? "O"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">
                {invitation.vacancy?.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{invitation.organisation?.name}</span>
              </div>
            </div>
            <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {invitation.vacancy?.city && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {invitation.vacancy.city}
              </div>
            )}
            {invitation.vacancy?.hours && (
              <span className="text-xs text-gray-400">{invitation.vacancy.hours} uur/week</span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {new Date(invitation.createdAt).toLocaleDateString("nl-NL")}
            </div>
          </div>

          {invitation.message && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Bericht van de organisatie</span>
              </div>
              <p className="text-sm text-blue-900 italic">"{invitation.message}"</p>
            </div>
          )}

          {invitation.status === "PENDING" && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => handleAction("ACCEPTED")}
                disabled={!!loading}
                className="gap-1.5 bg-green-500 hover:bg-green-600 text-white"
              >
                {loading === "ACCEPTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Accepteren
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction("DECLINED")}
                disabled={!!loading}
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                {loading === "DECLINED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Afwijzen
              </Button>
            </div>
          )}

          {invitation.status === "ACCEPTED" && conversationId && (
            <div className="mt-3">
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
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
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"matches" | "invitations">("matches")
  const queryClient = useQueryClient()

  const { data: matches = [], isLoading: loadingMatches } = useQuery<any[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await fetch("/api/matches")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery<any[]>({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await fetch("/api/invitations")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const pendingInvitations = invitations.filter((i) => i.status === "PENDING").length

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["invitations"] })
    queryClient.invalidateQueries({ queryKey: ["notificationCounts"] })
  }

  const isLoading = activeTab === "matches" ? loadingMatches : loadingInvitations

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijn matches</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === "matches"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Matches
          {matches.length > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">({matches.length})</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === "invitations"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Uitnodigingen
          {pendingInvitations > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full">
              {pendingInvitations}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "matches" ? (
        matches.length === 0 ? (
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
              const statusConfig = MATCH_STATUS[match.status] ?? MATCH_STATUS.PENDING
              const conversationId = match.conversation?.id
              return (
                <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={match.vacancy?.organisation?.logo ?? ""} alt={match.vacancy?.organisation?.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                        {match.vacancy?.organisation?.name?.charAt(0) ?? "O"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 leading-tight">{match.vacancy?.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-500">{match.vacancy?.organisation?.name}</span>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.className}`}>
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
                            {match.vacancy.distanceKm === 0 ? "Op afstand" : `${match.vacancy.distanceKm} km`}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(match.createdAt).toLocaleDateString("nl-NL")}
                        </div>
                      </div>
                      {match.status === "ACCEPTED" && conversationId && (
                        <div className="mt-3">
                          <Button asChild size="sm" className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600">
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
        )
      ) : (
        invitations.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Geen uitnodigingen</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Organisaties kunnen jou uitnodigen als je "open voor uitnodigingen" hebt ingesteld in je profiel.
            </p>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/profile/edit">Profiel aanpassen</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv: any) => (
              <InvitationCard key={inv.id} invitation={inv} onUpdate={invalidate} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
