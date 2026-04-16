export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AttendanceTable } from "@/components/activities/attendance-table"
import { QRCodeDisplay } from "@/components/activities/qr-code-display"

function formatDateTime(date: Date) {
  return date.toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }) + " om " + date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
}

export default async function AanwezigheidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) redirect("/onboarding")

  const activity = await prisma.groupActivity.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          volunteer: { select: { id: true, name: true, image: true, email: true } },
        },
        orderBy: [{ status: "asc" }, { registeredAt: "asc" }],
      },
    },
  })

  if (!activity || activity.organisationId !== org.id) notFound()

  const checkinUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkin/${activity.qrToken}`

  const counts = {
    registered: activity.registrations.filter((r) => r.status === "REGISTERED").length,
    waitlisted: activity.registrations.filter((r) => r.status === "WAITLISTED").length,
    attended:   activity.registrations.filter((r) => r.status === "ATTENDED").length,
    absent:     activity.registrations.filter((r) => r.status === "ABSENT").length,
    cancelled:  activity.registrations.filter((r) => r.status === "CANCELLED").length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/organisation/activities"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Aanwezigheid</h1>
          <p className="text-gray-500 text-sm mt-0.5 truncate">{activity.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(activity.startDateTime)}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 flex-shrink-0">
          <a href={`/api/activities/${activity.id}/export`} download>
            <Download className="w-3.5 h-3.5" />
            CSV
          </a>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Aangemeld",  value: counts.registered, color: "text-blue-700",  bg: "bg-blue-50"   },
          { label: "Wachtlijst", value: counts.waitlisted, color: "text-amber-700", bg: "bg-amber-50"  },
          { label: "Aanwezig",   value: counts.attended,   color: "text-green-700", bg: "bg-green-50"  },
          { label: "Afwezig",    value: counts.absent,     color: "text-gray-600",  bg: "bg-gray-50"   },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* QR code + check-in tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceTable
            activityId={activity.id}
            registrations={activity.registrations.map((r) => ({
              id: r.id,
              status: r.status,
              registeredAt: r.registeredAt.toISOString(),
              checkedInAt: r.checkedInAt?.toISOString() ?? null,
              volunteer: {
                id: r.volunteer.id,
                name: r.volunteer.name ?? "Onbekend",
                image: r.volunteer.image ?? null,
                email: r.volunteer.email ?? "",
              },
            }))}
          />
        </div>
        <div>
          <QRCodeDisplay url={checkinUrl} activityTitle={activity.title} />
        </div>
      </div>
    </div>
  )
}
