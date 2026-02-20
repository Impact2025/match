"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Send, Loader2, MapPin, Calendar, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { MatchScore } from "@/types"

interface ExistingInvitation {
  id: string
  status: string
  vacancyId: string
}

interface VolunteerInviteCardProps {
  volunteer: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    location: string | null
    age: number | null
    availability: string | null
    skills: { skill: { name: string } }[]
    interests: { category: { name: string } }[]
    receivedInvitations: ExistingInvitation[]
    matchScore?: MatchScore | null
  }
  vacancies: { id: string; title: string }[]
  defaultVacancyId?: string
}

const AVAILABILITY_LABELS: Record<string, string> = {
  monday: "Ma", tuesday: "Di", wednesday: "Wo", thursday: "Do",
  friday: "Vr", saturday: "Za", sunday: "Zo",
  morning: "Ochtend", afternoon: "Middag", evening: "Avond",
}

function scoreColor(score: number) {
  if (score >= 75) return { ring: "#22c55e", text: "text-green-600", bg: "bg-green-50" }
  if (score >= 55) return { ring: "#f97316", text: "text-orange-500", bg: "bg-orange-50" }
  return { ring: "#ef4444", text: "text-red-500", bg: "bg-red-50" }
}

function MatchRing({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const { ring, text } = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r}
          fill="none"
          stroke={ring}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ - fill}
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={ring}>
          {Math.round(score)}
        </text>
      </svg>
      <span className={`text-[9px] font-semibold ${text} uppercase tracking-wide`}>Match</span>
    </div>
  )
}

export function VolunteerInviteCard({ volunteer, vacancies, defaultVacancyId }: VolunteerInviteCardProps) {
  const [open, setOpen] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState(defaultVacancyId ?? vacancies[0]?.id ?? "")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const skills = volunteer.skills.map((s) => s.skill.name)
  const interests = volunteer.interests.map((i) => i.category.name)
  const availability: string[] = volunteer.availability
    ? JSON.parse(volunteer.availability)
    : []

  const existingForVacancy = volunteer.receivedInvitations.find(
    (inv) => inv.vacancyId === selectedVacancy
  )
  const alreadyInvited = !!existingForVacancy

  async function handleInvite() {
    if (!selectedVacancy) {
      toast.error("Selecteer een vacature")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: volunteer.id,
          vacancyId: selectedVacancy,
          message: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij versturen uitnodiging")
        return
      }

      toast.success(`Uitnodiging verstuurd naar ${volunteer.name}!`)
      setOpen(false)
      setMessage("")
      // Optimistically update
      volunteer.receivedInvitations.push({ id: "temp", status: "PENDING", vacancyId: selectedVacancy })
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 flex-shrink-0">
          <AvatarImage src={volunteer.image ?? ""} alt={volunteer.name ?? ""} />
          <AvatarFallback className="bg-orange-100 text-orange-700 text-lg font-bold">
            {volunteer.name?.charAt(0)?.toUpperCase() ?? "V"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">
                {volunteer.name ?? "Vrijwilliger"}
                {volunteer.age && (
                  <span className="ml-1.5 text-sm font-normal text-gray-400">{volunteer.age} jaar</span>
                )}
              </h3>
              {volunteer.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{volunteer.location}</span>
                </div>
              )}
            </div>

            {volunteer.matchScore != null && (
              <MatchRing score={volunteer.matchScore.total} />
            )}
          </div>

          {volunteer.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{volunteer.bio}</p>
          )}

          {/* Match highlights */}
          {volunteer.matchScore?.highlights && volunteer.matchScore.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {volunteer.matchScore.highlights.slice(0, 3).map((h) => (
                <span key={h} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                  ✓ {h}
                </span>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.slice(0, 5).map((s) => (
                <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
                  {s}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{skills.length - 5}</span>
              )}
            </div>
          )}

          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {interests.slice(0, 3).map((cat) => (
                <span key={cat} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-100">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {availability.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {availability.map((a) => AVAILABILITY_LABELS[a] ?? a).join(" · ")}
              </span>
            </div>
          )}

          {/* Invite panel */}
          {!open ? (
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="mt-4 gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              <Send className="w-3.5 h-3.5" />
              Uitnodiging sturen
            </Button>
          ) : (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Vacature</label>
                <select
                  value={selectedVacancy}
                  onChange={(e) => setSelectedVacancy(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              {alreadyInvited ? (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Check className="w-4 h-4" />
                  Al uitgenodigd voor deze vacature ({existingForVacancy?.status === "PENDING" ? "in afwachting" : existingForVacancy?.status === "ACCEPTED" ? "geaccepteerd" : "afgewezen"})
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Persoonlijk bericht <span className="text-gray-400 font-normal">(optioneel)</span>
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Vertel waarom je deze vrijwilliger uitnodigt..."
                      rows={3}
                      maxLength={500}
                      className="text-sm resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleInvite}
                      disabled={loading}
                      className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Versturen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setOpen(false); setMessage("") }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
