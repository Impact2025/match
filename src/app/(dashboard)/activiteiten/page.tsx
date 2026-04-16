export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { ActivityCard } from "@/components/activities/activity-card"
import { getCurrentGemeente } from "@/lib/gemeente"

export default async function ActiviteitenPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const gemeente = await getCurrentGemeente()

  // Gemeente filter: id ophalen via slug
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activiteiten</h1>
          <p className="text-gray-500 text-sm mt-1">Bijeenkomsten, workshops en evenementen bij jou in de buurt</p>
        </div>
        <Link
          href="/activiteiten/mijn"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          Mijn aanmeldingen →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Geen activiteiten gepland</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Er zijn momenteel geen aankomende activiteiten in jouw omgeving.
          </p>
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
