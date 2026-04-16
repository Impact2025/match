export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Pencil, Users, Calendar, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActivityStatusToggle } from "@/components/activities/activity-status-toggle"
import { ActivityDeleteButton } from "@/components/activities/activity-delete-button"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import type { ActivityType, ActivityStatus } from "@prisma/client"

const STATUS_CONFIG: Record<ActivityStatus, { label: string; className: string }> = {
  DRAFT:     { label: "Concept",    className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Gepubliceerd", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Geannuleerd", className: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Afgerond",   className: "bg-purple-100 text-purple-700" },
}

function formatDate(date: Date) {
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
}

export default async function ActivitiesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) redirect("/onboarding")

  const activities = await prisma.groupActivity.findMany({
    where: { organisationId: org.id },
    include: {
      _count: { select: { registrations: true } },
      registrations: {
        where: { status: { in: ["REGISTERED", "ATTENDED"] } },
        select: { status: true },
      },
    },
    orderBy: { startDateTime: "asc" },
  })

  const now = new Date()
  const upcoming = activities.filter((a) => a.startDateTime >= now)
  const past = activities.filter((a) => a.startDateTime < now)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activiteiten</h1>
          <p className="text-gray-500 text-sm mt-1">
            {upcoming.length} aankomend · {past.length} afgerond
          </p>
        </div>
        <Button
          asChild
          className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
        >
          <Link href="/organisation/activities/new">
            <PlusCircle className="w-4 h-4" />
            Nieuwe activiteit
          </Link>
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nog geen activiteiten</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Maak je eerste bijeenkomst, workshop of evenement aan.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
            <Link href="/organisation/activities/new">Aanmaken</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activiteit</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">Aanmeldingen</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((activity) => {
                const statusConfig = STATUS_CONFIG[activity.status]
                const registered = activity.registrations.filter((r) => r.status === "REGISTERED").length
                const attended = activity.registrations.filter((r) => r.status === "ATTENDED").length
                const total = activity._count.registrations
                const isPast = activity.startDateTime < now
                return (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-center min-w-[44px] rounded-xl px-2 py-1.5 ${isPast ? "bg-gray-100" : "bg-orange-50"}`}>
                          <div className={`text-lg font-bold leading-none ${isPast ? "text-gray-400" : "text-orange-600"}`}>
                            {activity.startDateTime.getDate()}
                          </div>
                          <div className={`text-[10px] font-semibold uppercase ${isPast ? "text-gray-400" : "text-orange-400"}`}>
                            {activity.startDateTime.toLocaleDateString("nl-NL", { month: "short" })}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(activity.startDateTime)} · {formatTime(activity.startDateTime)}–{formatTime(activity.endDateTime)}
                            {activity.city ? ` · ${activity.city}` : ""}
                            {activity.online ? " · Online" : ""}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {ACTIVITY_TYPE_LABELS[activity.type as ActivityType]}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{total}</span>
                        {activity.maxCapacity && (
                          <span className="text-xs text-gray-400">/ {activity.maxCapacity}</span>
                        )}
                        {attended > 0 && (
                          <span className="ml-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            {attended} aanwezig
                          </span>
                        )}
                        {registered > 0 && activity.status === "DRAFT" && (
                          <span className="ml-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {registered} aangemeld
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <ActivityStatusToggle activityId={activity.id} currentStatus={activity.status} />
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Aanwezigheid">
                          <Link href={`/organisation/activities/${activity.id}/aanwezigheid`}>
                            <QrCode className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bewerken">
                          <Link href={`/organisation/activities/${activity.id}/edit`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <ActivityDeleteButton activityId={activity.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
