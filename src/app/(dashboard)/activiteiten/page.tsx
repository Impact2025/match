export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { ActivityCard } from "@/components/activities/activity-card"
import { getCurrentGemeente } from "@/lib/gemeente"
import type { ActivityType } from "@prisma/client"

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "",                label: "Alles" },
  { value: "WORKSHOP",       label: "🛠️ Workshop" },
  { value: "BIJEENKOMST",    label: "🤝 Bijeenkomst" },
  { value: "EVENEMENT",      label: "🎉 Evenement" },
  { value: "CURSUS",         label: "📚 Cursus" },
  { value: "INLOOPSPREEKUUR", label: "🚪 Inloop" },
]

export default async function ActiviteitenPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { type: typeParam } = await searchParams
  const activeType = TYPE_FILTERS.map((f) => f.value).includes(typeParam ?? "")
    ? (typeParam ?? "")
    : ""

  const gemeente = await getCurrentGemeente()
  const accentColor = gemeente?.primaryColor ?? "#f97316"

  let gemeenteId: string | null = null
  if (gemeente) {
    const gr = await prisma.gemeente.findUnique({ where: { slug: gemeente.slug }, select: { id: true } })
    gemeenteId = gr?.id ?? null
  }

  const [activities, myRegistrations] = await Promise.all([
    prisma.groupActivity.findMany({
      where: {
        status: "PUBLISHED",
        startDateTime: { gte: new Date() },
        ...(gemeenteId ? { gemeenteId } : {}),
        ...(activeType ? { type: activeType as ActivityType } : {}),
      },
      include: {
        organisation: { select: { id: true, name: true, logo: true, slug: true } },
        categories: { include: { category: true } },
        registrations: {
          where: { status: { in: ["REGISTERED", "WAITLISTED"] } },
          select: { status: true },
        },
      },
      orderBy: { startDateTime: "asc" },
    }),
    prisma.activityRegistration.findMany({
      where: { volunteerId: session.user.id },
      select: { activityId: true, status: true },
    }),
  ])

  const myRegMap = Object.fromEntries(myRegistrations.map((r) => [r.activityId, r]))

  // Spotlight: eerstvolgende activiteit waar user al voor aangemeld is
  const spotlightId = myRegistrations.find((r) =>
    r.status === "REGISTERED" && activities.some((a) => a.id === r.activityId)
  )?.activityId

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activiteiten</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {activities.length} {activeType ? "resultaten" : "aankomend"}
          </p>
        </div>
        <Link
          href="/activiteiten/mijn"
          className="text-sm font-semibold transition-colors"
          style={{ color: accentColor }}
        >
          Mijn aanmeldingen →
        </Link>
      </div>

      {/* Type-filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPE_FILTERS.map((f) => {
          const isActive = f.value === activeType
          const href = f.value ? `/activiteiten?type=${f.value}` : "/activiteiten"
          return (
            <Link
              key={f.value}
              href={href}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 border"
              style={
                isActive
                  ? { backgroundColor: accentColor, color: "#fff", borderColor: accentColor }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Spotlight: eerstvolgende eigen aanmelding */}
      {spotlightId && !activeType && (
        (() => {
          const a = activities.find((x) => x.id === spotlightId)
          if (!a) return null
          const start = new Date(a.startDateTime)
          const daysLeft = Math.ceil((start.getTime() - Date.now()) / 86_400_000)
          return (
            <Link href={`/activiteiten/${a.id}`}>
              <div
                className="rounded-2xl p-4 flex items-center gap-4 border"
                style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}
              >
                <div
                  className="flex-shrink-0 text-center rounded-xl px-3 py-2 min-w-[44px]"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <div className="text-xl font-black leading-none" style={{ color: accentColor }}>
                    {start.getDate()}
                  </div>
                  <div className="text-[9px] font-bold uppercase" style={{ color: accentColor }}>
                    {start.toLocaleDateString("nl-NL", { month: "short" })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
                    Jouw volgende activiteit
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500">
                    {daysLeft === 0 ? "Vandaag!" : daysLeft === 1 ? "Morgen" : `Over ${daysLeft} dagen`}
                    {" · "}{a.organisation.name}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-green-600 flex-shrink-0">✓ Aangemeld</span>
              </div>
            </Link>
          )
        })()
      )}

      {/* Lijst */}
      {activities.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Geen activiteiten gevonden</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            {activeType
              ? "Probeer een ander filter."
              : "Er zijn momenteel geen aankomende activiteiten in jouw omgeving."}
          </p>
          {activeType && (
            <Link href="/activiteiten" className="text-sm font-medium" style={{ color: accentColor }}>
              Toon alle activiteiten →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              myRegistration={myRegMap[activity.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
