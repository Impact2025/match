export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Settings, Pencil, Heart, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/profile/logout-button"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { category: true } },
      _count: {
        select: {
          swipesGiven: true,
          matchesAsVol: true,
        },
      },
    },
    // streakDays is a top-level field on User
  })

  if (!user) redirect("/login")

  const acceptedMatches = await prisma.match.count({
    where: { volunteerId: session.user.id, status: "ACCEPTED" },
  })

  const totalMatches = user._count.matchesAsVol
  const totalSwipes = user._count.swipesGiven
  const respons = totalSwipes > 0 ? Math.round((totalMatches / totalSwipes) * 100) : 0

  const availability: string[] = user.availability
    ? (() => {
        try {
          return JSON.parse(user.availability)
        } catch {
          return []
        }
      })()
    : []

  // Parse name + age (stored as "Name, Age" or just "Name")
  const displayName = user.name ?? "Mijn profiel"
  const firstInterest = user.interests[0]?.category?.name

  const availabilityLabels: Record<string, string> = {
    monday: "Maandag",
    tuesday: "Dinsdag",
    wednesday: "Woensdag",
    thursday: "Donderdag",
    friday: "Vrijdag",
    saturday: "Zaterdag",
    sunday: "Zondag",
    morning: "Ochtend",
    afternoon: "Middag",
    evening: "Avond",
  }

  const availabilityDisplay = availability
    .map((a) => availabilityLabels[a] ?? a)
    .join(", ")

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-8" />
        <h1 className="text-base font-semibold text-gray-900">Mijn Profiel</h1>
        <Link
          href="/profile/edit"
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-4 pb-4">
        <div className="relative mb-3">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarImage src={user.image ?? ""} alt={displayName} />
            <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Verification badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
            <span className="text-white text-[10px] font-black">✓</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>

        {user.location && (
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="mx-4 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: "MATCHES", value: acceptedMatches },
            { label: "VIEWS", value: totalSwipes },
            { label: "RESPONS", value: `${respons}%` },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak card */}
      {user.streakDays > 0 && (
        <div className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-base font-bold text-gray-900">
              {user.streakDays} dag{user.streakDays !== 1 ? "en" : ""} streak!
            </p>
            <p className="text-xs text-gray-500">Blijf dagelijks swipen om je streak te bewaren</p>
          </div>
        </div>
      )}

      {/* Over mij */}
      {user.bio && (
        <div className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">Over mij</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Interesses */}
      {user.interests.length > 0 && (
        <div className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">Interesses</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.interests.map(({ category }) => (
              <span
                key={category.id}
                className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Match Inzicht */}
      <div className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-sm font-bold">AI</span>
            <h3 className="text-sm font-semibold text-gray-900">Match Inzicht</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
            BETA
          </span>
        </div>

        {[
          {
            label: "Profiel Volledigheid",
            value: Math.min(
              100,
              Math.round(
                ((user.bio ? 25 : 0) +
                  (user.location ? 15 : 0) +
                  (user.image ? 20 : 0) +
                  Math.min(user.skills.length * 5, 20) +
                  Math.min(user.interests.length * 5, 20)) /
                  1
              )
            ),
            color: "bg-orange-500",
          },
          {
            label: "Match Accuraatheid",
            value: Math.min(100, respons + 30),
            color: "bg-orange-400",
          },
        ].map((bar) => (
          <div key={bar.label} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{bar.label}</span>
              <span className="text-xs font-semibold text-gray-700">{bar.value}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${bar.color} rounded-full`}
                style={{ width: `${bar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Doelgroepen + beschikbaarheid */}
      {(firstInterest || availabilityDisplay) && (
        <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
          {firstInterest && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">
                DOELGROEPEN
              </p>
              <p className="text-sm font-medium text-gray-700">{firstInterest}</p>
            </div>
          )}
          {availabilityDisplay && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">
                BESCHIKBAARHEID
              </p>
              <p className="text-sm font-medium text-gray-700 truncate">{availabilityDisplay}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit + logout buttons */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        <Link
          href="/profile/edit"
          className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Profiel Bewerken
        </Link>
        <LogoutButton />
      </div>
    </div>
  )
}
