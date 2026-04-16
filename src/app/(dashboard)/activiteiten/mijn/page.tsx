export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CalendarDays } from "lucide-react"
import { ACTIVITY_TYPE_LABELS } from "@/validators"
import type { ActivityType } from "@prisma/client"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  REGISTERED: { label: "Aangemeld",   className: "bg-green-100 text-green-700" },
  WAITLISTED: { label: "Wachtlijst",  className: "bg-amber-100 text-amber-700" },
  ATTENDED:   { label: "Bijgewoond",  className: "bg-blue-100 text-blue-700" },
  ABSENT:     { label: "Afwezig",     className: "bg-gray-100 text-gray-500" },
  CANCELLED:  { label: "Afgemeld",    className: "bg-red-100 text-red-500" },
}

export default async function MijnActiviteitenPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

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

  function RegistrationRow({ reg }: { reg: typeof registrations[0] }) {
    const a = reg.activity
    const statusCfg = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.CANCELLED
    const startDate = new Date(a.startDateTime)
    return (
      <Link
        href={`/activiteiten/${a.id}`}
        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
      >
        {/* Datum badge */}
        <div className="flex-shrink-0 text-center bg-orange-50 rounded-xl px-2 py-1.5 min-w-[40px]">
          <div className="text-base font-bold text-orange-600 leading-none">{startDate.getDate()}</div>
          <div className="text-[9px] font-bold uppercase text-orange-400">
            {startDate.toLocaleDateString("nl-NL", { month: "short" })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
          <p className="text-xs text-gray-500">
            {a.organisation.name} ·{" "}
            {ACTIVITY_TYPE_LABELS[a.type as ActivityType]} ·{" "}
            {startDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
      </Link>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/activiteiten"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mijn aanmeldingen</h1>
          <p className="text-gray-500 text-sm mt-0.5">{upcoming.length} aankomend</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">Je hebt je nog niet aangemeld voor activiteiten.</p>
          <Link href="/activiteiten" className="text-sm font-medium text-orange-600 hover:underline">
            Bekijk aankomende activiteiten →
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aankomend</p>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.map((reg) => <RegistrationRow key={reg.id} reg={reg} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Afgerond / afgemeld</p>
              </div>
              <div className="divide-y divide-gray-50">
                {past.map((reg) => <RegistrationRow key={reg.id} reg={reg} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
