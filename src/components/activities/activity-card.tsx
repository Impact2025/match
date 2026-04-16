import Link from "next/link"
import { MapPin, Video, Users, Clock } from "lucide-react"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import type { ActivityType } from "@prisma/client"

const TYPE_COLORS: Record<string, string> = {
  BIJEENKOMST:     "bg-blue-100 text-blue-700",
  WORKSHOP:        "bg-orange-100 text-orange-700",
  CURSUS:          "bg-purple-100 text-purple-700",
  EVENEMENT:       "bg-green-100 text-green-700",
  INLOOPSPREEKUUR: "bg-amber-100 text-amber-700",
}

const TYPE_ICONS: Record<string, string> = {
  BIJEENKOMST: "🤝", WORKSHOP: "🛠️", CURSUS: "📚", EVENEMENT: "🎉", INLOOPSPREEKUUR: "🚪",
}

interface ActivityCardProps {
  activity: {
    id: string
    title: string
    type: ActivityType
    startDateTime: Date
    endDateTime: Date
    online: boolean
    location?: string | null
    city?: string | null
    maxCapacity?: number | null
    registrations: { status: string }[]
    organisation: { name: string; logo?: string | null }
    imageUrl?: string | null
  }
  myRegistration?: { status: string } | null
}

export function ActivityCard({ activity, myRegistration }: ActivityCardProps) {
  const activeRegs = activity.registrations.filter(
    (r) => r.status === "REGISTERED" || r.status === "WAITLISTED"
  ).length
  const isFull = activity.maxCapacity !== null && activeRegs >= (activity.maxCapacity ?? Infinity)
  const isOnWaitlist = myRegistration?.status === "WAITLISTED"
  const isRegistered = myRegistration?.status === "REGISTERED" || myRegistration?.status === "ATTENDED"

  const startDate = new Date(activity.startDateTime)
  const endDate = new Date(activity.endDateTime)
  const day = startDate.getDate()
  const month = startDate.toLocaleDateString("nl-NL", { month: "short" })

  const durationMs = endDate.getTime() - startDate.getTime()
  const durationH = Math.round(durationMs / 36e5 * 10) / 10
  const durationLabel = durationH < 1 ? `${Math.round(durationMs / 60000)} min` : `${durationH} uur`

  const capacityPct = activity.maxCapacity ? Math.min(100, (activeRegs / activity.maxCapacity) * 100) : 0

  return (
    <Link href={`/activiteiten/${activity.id}`} className="block group">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {activity.imageUrl && (
          <div className="aspect-[16/7] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 flex gap-3">
          {/* Datum badge */}
          <div className="flex-shrink-0 text-center bg-orange-50 rounded-xl px-2.5 py-2 min-w-[44px]">
            <div className="text-xl font-bold text-orange-600 leading-none">{day}</div>
            <div className="text-[10px] font-bold uppercase text-orange-400 mt-0.5">{month}</div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                {activity.title}
              </h3>
              {(isRegistered || isOnWaitlist) && (
                <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isRegistered ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {isRegistered ? "✓ Aangemeld" : "Wachtlijst"}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-2">
              {activity.organisation.name}
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {startDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}–{endDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} · {durationLabel}
              </span>
              {activity.online ? (
                <span className="flex items-center gap-1">
                  <Video className="w-3 h-3" /> Online
                </span>
              ) : activity.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {activity.city}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[activity.type] ?? "bg-gray-100 text-gray-600"}`}>
                {TYPE_ICONS[activity.type]} {ACTIVITY_TYPE_LABELS[activity.type as ActivityType]}
              </span>

              {activity.maxCapacity ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPct >= 90 ? "bg-red-400" : capacityPct >= 70 ? "bg-amber-400" : "bg-green-400"
                      }`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {activeRegs}/{activity.maxCapacity}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" /> {activeRegs} aangemeld
                </span>
              )}
            </div>

            {isFull && !isRegistered && !isOnWaitlist && (
              <p className="text-[11px] text-amber-600 font-medium mt-1.5">Vol — wachtlijst beschikbaar</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
