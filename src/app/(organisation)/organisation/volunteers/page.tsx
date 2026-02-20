"use client"

import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal, Users, X, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { VolunteerInviteCard } from "@/components/organisation/volunteer-invite-card"
import { SKILLS, CATEGORIES } from "@/config"

export default function OrgVolunteersPage() {
  const [city, setCity] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedVacancyId, setSelectedVacancyId] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  // Fetch org's own active vacancies for the selector
  const { data: orgVacancies = [] } = useQuery<any[]>({
    queryKey: ["org-vacancies-list"],
    queryFn: async () => {
      const res = await fetch("/api/organisations/me")
      if (!res.ok) throw new Error("Failed")
      const org = await res.json()
      return (org.vacancies ?? []).filter((v: any) => v.status === "ACTIVE")
    },
  })

  // Build query params
  const buildParams = useCallback(() => {
    const p = new URLSearchParams()
    if (city) p.set("city", city)
    if (selectedSkills.length > 0) p.set("skills", selectedSkills.join(","))
    if (selectedCategories.length > 0) p.set("categories", selectedCategories.join(","))
    if (selectedVacancyId) p.set("vacancyId", selectedVacancyId)
    return p.toString()
  }, [city, selectedSkills, selectedCategories, selectedVacancyId])

  const { data: volunteers = [], isLoading } = useQuery<any[]>({
    queryKey: ["org-volunteers", city, selectedSkills, selectedCategories, selectedVacancyId],
    queryFn: async () => {
      const res = await fetch(`/api/volunteers?${buildParams()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function clearFilters() {
    setCity("")
    setSelectedSkills([])
    setSelectedCategories([])
    setSelectedVacancyId("")
    setSearchInput("")
  }

  const activeFilterCount =
    (city ? 1 : 0) + selectedSkills.length + selectedCategories.length + (selectedVacancyId ? 1 : 0)

  // Client-side name filter
  const filtered = volunteers.filter((v) =>
    searchInput
      ? v.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
        v.location?.toLowerCase().includes(searchInput.toLowerCase())
      : true
  )

  const rankingActive = !!selectedVacancyId && filtered.some((v) => v.matchScore !== null)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vrijwilligers zoeken</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vind vrijwilligers die open staan voor uitnodigingen en nodig ze uit voor jouw vacatures.
        </p>
      </div>

      {/* Vacancy selector — primary filter */}
      {orgVacancies.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-500" />
            <label className="text-sm font-semibold text-orange-900">
              Selecteer een vacature voor AI-ranking
            </label>
          </div>
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">— Toon alle vrijwilligers (geen ranking) —</option>
            {orgVacancies.map((v: any) => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
          {rankingActive && (
            <p className="text-xs text-orange-600 font-medium">
              ✨ Vrijwilligers worden gerangschikt op matchscore voor deze vacature
            </p>
          )}
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Zoek op naam of stad..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative gap-2 rounded-xl ${showFilters ? "border-orange-400 text-orange-600" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-orange-500 flex items-center gap-1 hover:underline">
                <X className="w-3 h-3" /> Wis alles
              </button>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Stad</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Amsterdam, Rotterdam, Utrecht..."
              className="rounded-xl text-sm"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Vaardigheden</label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    selectedSkills.includes(skill)
                      ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Interesses</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    selectedCategories.includes(cat.name)
                      ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Geen vrijwilligers gevonden</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Pas je filters aan of verwijder filters om meer vrijwilligers te zien.
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearFilters} className="rounded-xl">
              Filters wissen
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "vrijwilliger" : "vrijwilligers"} gevonden
            {rankingActive && " · gesorteerd op matchscore"}
          </p>
          <div className="space-y-4">
            {filtered.map((volunteer) => (
              <VolunteerInviteCard
                key={volunteer.id}
                volunteer={volunteer}
                vacancies={orgVacancies}
                defaultVacancyId={selectedVacancyId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
