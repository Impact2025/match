import Link from "next/link"
import { MapPin, Video, Users } from "lucide-react"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import type { ActivityType } from "@prisma/client"

const TYPE_ICONS: Record<string, string> = {
  BIJEENKOMST: "🤝", WORKSHOP: "🛠️", CURSUS: "📚", EVENEMENT: "🎉", INLOOPSPREEKUUR: "🚪",
}

interface ActivityMiniCardProps {
  activity: {
    id: string
    title: string
    type: ActivityType | string
    startDateTime: Date | string
    online: boolean
    city?: string | null
    maxCapacity?: number | null
    organisation?: { name: string }
    registrations?: { status: string }[]
  }
  accentColor?: string
  registered?: boolean
}

export function ActivityMiniCard({ activity, accentColor = "#f97316", registered }: ActivityMiniCardProps) {
  const start = new Date(activity.startDateTime)
  const activeRegs = (activity.registrations ?? []).filter(
    (r) => r.status === "REGISTERED" || r.status === "WAITLISTED"
  ).length
  const isFull = activity.maxCapacity ? activeRegs >= activity.maxCapacity : false

  return (
    <Link href={`/activiteiten/${activity.id}`} className="block flex-shrink-0 w-44">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col gap-2">
        {/* Datum */}
        <div className="flex items-center gap-2">
          <div
            className="flex-shrink-0 rounded-xl px-2 py-1.5 text-center min-w-[34px]"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <div className="text-sm font-black leading-none" style={{ color: accentColor }}>
              {start.getDate()}
            </div>
            <div className="text-[9px] font-bold uppercase leading-none mt-0.5" style={{ color: accentColor }}>
              {start.toLocaleDateString("nl-NL", { month: "short" })}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {activity.title}
          </div>
        </div>

        {/* Type + locatie */}
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] text-gray-500 font-medium">
            {TYPE_ICONS[activity.type as string]} {ACTIVITY_TYPE_LABELS[activity.type as ActivityType] ?? activity.type}
          </span>
          {activity.online ? (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Video className="w-2.5 h-2.5" /> Online
            </span>
          ) : activity.city ? (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <MapPin className="w-2.5 h-2.5" /> {activity.city}
            </span>
          ) : null}
        </div>

        {/* Status */}
        <div className="mt-auto">
          {registered ? (
            <span className="text-[10px] font-bold text-green-600">✓ Aangemeld</span>
          ) : isFull ? (
            <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
              <Users className="w-2.5 h-2.5" /> Vol
            </span>
          ) : activity.maxCapacity ? (
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (activeRegs / activity.maxCapacity) * 100)}%`,
                    backgroundColor: accentColor,
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-400">{activity.maxCapacity - activeRegs} vrij</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
