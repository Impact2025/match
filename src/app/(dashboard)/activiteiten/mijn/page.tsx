export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CalendarDays, Star } from "lucide-react"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import { FeedbackWidget } from "@/components/activities/feedback-widget"
import { getCurrentGemeente } from "@/lib/gemeente"
import type { ActivityType } from "@prisma/client"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  REGISTERED: { label: "Aangemeld",  className: "bg-green-100 text-green-700" },
  WAITLISTED: { label: "Wachtlijst", className: "bg-amber-100 text-amber-700" },
  ATTENDED:   { label: "Bijgewoond", className: "bg-blue-100 text-blue-700" },
  ABSENT:     { label: "Afwezig",    className: "bg-gray-100 text-gray-500" },
  CANCELLED:  { label: "Afgemeld",   className: "bg-red-100 text-red-500" },
}

export default async function MijnActiviteitenPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const gemeente = await getCurrentGemeente()
  const accentColor = gemeente?.primaryColor ?? "#f97316"

  const registrations = await prisma.activityRegistration.findMany({
    where: { volunteerId: session.user.id },
    include: {
      activity: {
        include: {
          organisation: { select: { name: true, logo: true } },
        },
      },
    },
    orderBy: { activity: { startDateTime: "asc" } },
  })

  const now = new Date()
  const upcoming = registrations.filter(
    (r) => r.activity.startDateTime >= now && r.status !== "CANCELLED"
  )
  const past = registrations.filter(
    (r) => r.activity.startDateTime < now || r.status === "CANCELLED"
  )

  const attended = past.filter((r) => r.status === "ATTENDED")
  const ratings = attended.filter((r) => r.rating !== null).map((r) => r.rating!)
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/activiteiten"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Mijn aanmeldingen</h1>
          <p className="text-gray-400 text-sm mt-0.5">{upcoming.length} aankomend</p>
        </div>
        {attended.length > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black leading-none" style={{ color: accentColor }}>{attended.length}×</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">bijgewoond</p>
            {avgRating && (
              <p className="text-[11px] text-amber-500 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {avgRating}
              </p>
            )}
          </div>
        )}
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">Je hebt je nog niet aangemeld voor activiteiten.</p>
          <Link href="/activiteiten" className="text-sm font-semibold" style={{ color: accentColor }}>
            Bekijk aankomende activiteiten →
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Aankomend</p>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.map((reg) => {
                  const a = reg.activity
                  const statusCfg = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.CANCELLED
                  const startDate = new Date(a.startDateTime)
                  return (
                    <div key={reg.id} className="p-4">
                      <Link href={`/activiteiten/${a.id}`} className="flex items-center gap-4 hover:bg-gray-50 -m-1 p-1 rounded-xl transition-colors">
                        <div
                          className="flex-shrink-0 text-center rounded-xl px-2 py-1.5 min-w-[40px]"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <div className="text-base font-bold leading-none" style={{ color: accentColor }}>
                            {startDate.getDate()}
                          </div>
                          <div className="text-[9px] font-bold uppercase" style={{ color: accentColor }}>
                            {startDate.toLocaleDateString("nl-NL", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                          <p className="text-xs text-gray-400">
                            {a.organisation.name} · {ACTIVITY_TYPE_LABELS[a.type as ActivityType]} ·{" "}
                            {startDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Afgerond / afgemeld</p>
              </div>
              <div className="divide-y divide-gray-50">
                {past.map((reg) => {
                  const a = reg.activity
                  const statusCfg = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.CANCELLED
                  const startDate = new Date(a.startDateTime)
                  const needsFeedback = reg.status === "ATTENDED" && !reg.feedback && !reg.rating

                  return (
                    <div key={reg.id} className="p-4">
                      <Link href={`/activiteiten/${a.id}`} className="flex items-center gap-4 hover:bg-gray-50 -m-1 p-1 rounded-xl transition-colors">
                        <div className="flex-shrink-0 text-center bg-gray-50 rounded-xl px-2 py-1.5 min-w-[40px]">
                          <div className="text-base font-bold text-gray-400 leading-none">{startDate.getDate()}</div>
                          <div className="text-[9px] font-bold uppercase text-gray-300">
                            {startDate.toLocaleDateString("nl-NL", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">{a.title}</p>
                          <p className="text-xs text-gray-400">
                            {a.organisation.name} · {ACTIVITY_TYPE_LABELS[a.type as ActivityType]}
                          </p>
                          {reg.rating && (
                            <span className="inline-flex items-center gap-0.5 mt-0.5">
                              {Array.from({ length: reg.rating }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                              ))}
                            </span>
                          )}
                        </div>
                        <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </Link>

                      {needsFeedback && (
                        <div className="mt-2 px-1">
                          <FeedbackWidget activityId={a.id} registrationId={reg.id} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
