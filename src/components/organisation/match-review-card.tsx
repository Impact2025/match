"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X, MessageCircle, Loader2, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface MatchReviewCardProps {
  match: {
    id: string
    status: string
    matchReason?: string | null
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

export function MatchReviewCard({ match }: MatchReviewCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"ACCEPTED" | "REJECTED" | null>(null)

  async function handleAction(status: "ACCEPTED" | "REJECTED") {
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

      if (status === "ACCEPTED") {
        toast.success("Match geaccepteerd! Icebreaker verzonden.")
      } else {
        toast.info("Match afgewezen")
      }

      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(null)
    }
  }

  const skills = match.volunteer.skills?.map((s) => s.skill.name) ?? []

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
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
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
                >
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

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {match.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAction("ACCEPTED")}
                  disabled={!!loading}
                  className="gap-1.5 bg-green-500 hover:bg-green-600 text-white"
                >
                  {loading === "ACCEPTED" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Accepteren
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction("REJECTED")}
                  disabled={!!loading}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {loading === "REJECTED" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Afwijzen
                </Button>
              </>
            )}

            {match.status === "ACCEPTED" && match.conversation && (
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
              >
                <Link href={`/chat?conversationId=${match.conversation.id}`}>
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat openen
                </Link>
              </Button>
            )}

            {match.status === "REJECTED" && (
              <span className="text-xs text-gray-400 italic">Match afgewezen</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
