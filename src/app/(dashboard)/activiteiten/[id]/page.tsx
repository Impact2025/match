export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin, Video, Users, Clock, Calendar } from "lucide-react"
import { RegisterButton } from "@/components/activities/register-button"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import type { ActivityType } from "@prisma/client"

const TYPE_COLORS: Record<string, string> = {
  BIJEENKOMST: "bg-blue-100 text-blue-700",
  WORKSHOP: "bg-orange-100 text-orange-700",
  CURSUS: "bg-purple-100 text-purple-700",
  EVENEMENT: "bg-green-100 text-green-700",
  INLOOPSPREEKUUR: "bg-amber-100 text-amber-700",
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [activity, myRegistration] = await Promise.all([
    prisma.groupActivity.findUnique({
      where: { id },
      include: {
        organisation: { select: { id: true, name: true, logo: true, slug: true, city: true } },
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        registrations: {
          where: { status: { in: ["REGISTERED", "WAITLISTED"] } },
          select: { status: true },
        },
      },
    }),
    prisma.activityRegistration.findUnique({
      where: { activityId_volunteerId: { activityId: id, volunteerId: session.user.id } },
    }),
  ])

  if (!activity || activity.status !== "PUBLISHED") notFound()

  const activeRegs = activity.registrations.length
  const isFull = activity.maxCapacity !== null && activeRegs >= activity.maxCapacity
  const hasWaitlist = activity.waitlistEnabled

  const startDate = new Date(activity.startDateTime)
  const endDate = new Date(activity.endDateTime)

  const durationMs = endDate.getTime() - startDate.getTime()
  const durationH = Math.round(durationMs / 36e5 * 10) / 10
  const durationLabel = durationH < 1 ? `${Math.round(durationMs / 60000)} min` : `${durationH} uur`

  // iCal download link genereren
  const icalData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `SUMMARY:${activity.title}`,
    `DESCRIPTION:${activity.description.slice(0, 200).replace(/\n/g, "\\n")}`,
    `LOCATION:${activity.online ? (activity.meetUrl ?? "Online") : [activity.location, activity.address, activity.city].filter(Boolean).join(", ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  const icalHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icalData)}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/activiteiten"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Terug naar activiteiten
      </Link>

      {/* Hero afbeelding */}
      {activity.imageUrl && (
        <div className="aspect-[16/7] rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header kaart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          {/* Datum badge */}
          <div className="flex-shrink-0 text-center bg-orange-50 rounded-2xl px-3 py-3 min-w-[56px]">
            <div className="text-2xl font-bold text-orange-600 leading-none">{startDate.getDate()}</div>
            <div className="text-xs font-bold uppercase text-orange-400 mt-0.5">
              {startDate.toLocaleDateString("nl-NL", { month: "short" })}
            </div>
            <div className="text-[10px] text-orange-300 mt-0.5">{startDate.getFullYear()}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{activity.title}</h1>
              <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[activity.type] ?? "bg-gray-100 text-gray-600"}`}>
                {ACTIVITY_TYPE_LABELS[activity.type as ActivityType]}
              </span>
            </div>

            <Link
              href={`/organisation/${activity.organisation.slug ?? activity.organisation.id}`}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              {activity.organisation.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activity.organisation.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
              )}
              {activity.organisation.name}
            </Link>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {startDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}–
                  {endDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} · {durationLabel}
                </span>
              </div>
              {activity.online ? (
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Online</span>
                  {activity.meetUrl && myRegistration?.status === "REGISTERED" && (
                    <a href={activity.meetUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline ml-1">
                      Link openen →
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {[activity.location, activity.address, activity.city].filter(Boolean).join(", ") || "Locatie volgt"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {activeRegs} aangemeld
                  {activity.maxCapacity ? ` / max. ${activity.maxCapacity}` : ""}
                  {isFull && hasWaitlist ? " · Wachtlijst beschikbaar" : ""}
                  {isFull && !hasWaitlist ? " · Vol" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aanmeld CTA */}
      <RegisterButton
        activityId={activity.id}
        myRegistration={myRegistration}
        isFull={isFull}
        hasWaitlist={hasWaitlist}
        icalHref={icalHref}
        activityTitle={activity.title}
      />

      {/* Beschrijving */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Over deze activiteit</h2>
        <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {activity.description}
        </div>
      </div>

      {/* Categorieën & vaardigheden */}
      {(activity.categories.length > 0 || activity.skills.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {activity.categories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categorieën</p>
              <div className="flex flex-wrap gap-2">
                {activity.categories.map(({ category }) => (
                  <span key={category.id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {activity.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gewenste vaardigheden</p>
              <div className="flex flex-wrap gap-2">
                {activity.skills.map(({ skill }) => (
                  <span key={skill.id} className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agenda toevoegen */}
      {myRegistration?.status === "REGISTERED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Zet het in je agenda</p>
            <p className="text-xs text-blue-600">Download de uitnodiging voor je agenda-app</p>
          </div>
          <a
            href={icalHref}
            download={`${activity.title.toLowerCase().replace(/\s+/g, "-")}.ics`}
            className="text-sm font-medium text-blue-700 hover:text-blue-900 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
          >
            .ics downloaden
          </a>
        </div>
      )}
    </div>
  )
}
