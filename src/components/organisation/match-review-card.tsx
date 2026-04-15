"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X, MessageCircle, Loader2, MapPin, Briefcase, CheckCheck } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface MatchReviewCardProps {
  match: {
    id: string
    status: string
    createdAt: string | Date
    confirmedAt?: string | Date | null
    matchReason?: string | null
    scoreSnapshot?: number | null
    volunteer: {
      id: string
      name: string | null
      image: string | null
      bio: string | null
      location: string | null
      skills: { skill: { name: string } }[]
    }
    vacancy: {
      title: string
    }
    conversation?: { id: string } | null
  }
}

function relativeDate(d: string | Date) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return "vandaag"
  if (days === 1) return "gisteren"
  if (days < 7) return `${days} dagen geleden`
  if (days < 30) return `${Math.floor(days / 7)} wk geleden`
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "In afwachting",  className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACCEPTED:  { label: "In gesprek",     className: "bg-blue-100 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "Actief",         className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED:  { label: "Afgewezen",      className: "bg-gray-100 text-gray-500 border-gray-200" },
  COMPLETED: { label: "Afgerond",       className: "bg-purple-100 text-purple-700 border-purple-200" },
}

export function MatchReviewCard({ match }: MatchReviewCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(status: string) {
    setLoading(status)
    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij bijwerken")
        return
      }

      if (status === "ACCEPTED")  toast.success("Match geaccepteerd! Chat is geopend.")
      if (status === "CONFIRMED") toast.success("Plaatsing bevestigd! De vrijwilliger is actief.")
      if (status === "REJECTED")  toast.info("Match afgewezen")

      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(null)
    }
  }

  const skills = match.volunteer.skills?.map((s) => s.skill.name) ?? []
  const badge = STATUS_BADGE[match.status] ?? STATUS_BADGE.PENDING

  // Days since accepted (for ACCEPTED status nudge)
  const daysSinceCreated = match.createdAt
    ? Math.floor((Date.now() - new Date(match.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
      match.status === "CONFIRMED" ? "border-green-200" :
      match.status === "ACCEPTED"  ? "border-blue-200" :
      "border-gray-100"
    }`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 flex-shrink-0">
          <AvatarImage src={match.volunteer.image ?? ""} alt={match.volunteer.name ?? ""} />
          <AvatarFallback className="bg-orange-100 text-orange-700 text-lg font-bold">
            {match.volunteer.name?.charAt(0)?.toUpperCase() ?? "V"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {match.volunteer.name ?? "Anonieme vrijwilliger"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{match.vacancy.title}</span>
              </div>
              {match.volunteer.location && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{match.volunteer.location}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                {badge.label}
              </span>
              {typeof match.scoreSnapshot === "number" && match.scoreSnapshot > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {Math.round(match.scoreSnapshot * 100)}% match
                </span>
              )}
              <span className="text-[10px] text-gray-400">{relativeDate(match.createdAt)}</span>
            </div>
          </div>

          {match.matchReason && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full">
              <span className="text-orange-500 text-xs">★</span>
              <span className="text-xs font-medium text-orange-700">{match.matchReason}</span>
            </div>
          )}

          {match.volunteer.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{match.volunteer.bio}</p>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.slice(0, 5).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">

            {/* PENDING: accept or reject */}
            {match.status === "PENDING" && (
              <>
                <Button size="sm" onClick={() => handleAction("ACCEPTED")} disabled={!!loading}
                  className="gap-1.5 bg-green-500 hover:bg-green-600 text-white">
                  {loading === "ACCEPTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Accepteren
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction("REJECTED")} disabled={!!loading}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                  {loading === "REJECTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Afwijzen
                </Button>
              </>
            )}

            {/* ACCEPTED: open chat + confirm placement */}
            {match.status === "ACCEPTED" && (
              <>
                {match.conversation && (
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href={`/chat?conversationId=${match.conversation.id}`}>
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat openen
                    </Link>
                  </Button>
                )}
                <Button size="sm" onClick={() => handleAction("CONFIRMED")} disabled={!!loading}
                  className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                  {loading === "CONFIRMED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                  Bevestig plaatsing
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction("REJECTED")} disabled={!!loading}
                  className="gap-1.5 text-red-500 border-red-100 hover:bg-red-50 text-xs">
                  {loading === "REJECTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3 h-3" />}
                  Sluiten
                </Button>
              </>
            )}

            {/* CONFIRMED: chat + confirmed indicator */}
            {match.status === "CONFIRMED" && (
              <>
                {match.conversation && (
                  <Button asChild size="sm" className="gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Link href={`/chat?conversationId=${match.conversation.id}`}>
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat openen
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Actief als vrijwilliger
                  {match.confirmedAt && (
                    <span className="text-gray-400 font-normal">
                      · sinds {new Date(match.confirmedAt).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                </div>
              </>
            )}

            {match.status === "REJECTED" && (
              <span className="text-xs text-gray-400 italic">Match afgewezen</span>
            )}

            {match.status === "COMPLETED" && (
              <span className="text-xs text-purple-500 font-medium">Vrijwilligerswerk afgerond</span>
            )}
          </div>

          {/* Nudge for long-pending ACCEPTED matches */}
          {match.status === "ACCEPTED" && daysSinceCreated >= 14 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-500 text-sm">⏰</span>
              <p className="text-xs text-amber-700">
                Al {daysSinceCreated} dagen in gesprek — is {match.volunteer.name ?? "deze vrijwilliger"} al gestart? Vergeet niet te bevestigen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
