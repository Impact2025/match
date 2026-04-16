export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SwipeDeck } from "@/components/swipe/swipe-deck"
import { ProfileCompleteness } from "@/components/swipe/profile-completeness"
import { ActivityMiniCard } from "@/components/activities/activity-mini-card"
import { getCurrentGemeente } from "@/lib/gemeente"

function computeCompleteness(user: {
  bio: string | null
  location: string | null
  postcode: string | null
  image: string | null
  availability: string | null
  motivationProfile: string | null
  skills: unknown[]
  interests: unknown[]
}): { percent: number; missing: string[] } {
  const fields: { label: string; ok: boolean }[] = [
    { label: "bio", ok: !!user.bio },
    { label: "locatie", ok: !!(user.location || user.postcode) },
    { label: "profielfoto", ok: !!user.image },
    { label: "beschikbaarheid", ok: !!user.availability },
    { label: "vaardigheden", ok: user.skills.length > 0 },
    { label: "interesses", ok: user.interests.length > 0 },
    { label: "motivatieprofiel", ok: !!user.motivationProfile },
  ]
  const done = fields.filter((f) => f.ok).length
  const missing = fields.filter((f) => !f.ok).map((f) => f.label)
  return { percent: Math.round((done / fields.length) * 100), missing }
}

export default async function SwipePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, gemeente] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        bio: true,
        location: true,
        postcode: true,
        image: true,
        availability: true,
        motivationProfile: true,
        skills: { select: { skillId: true } },
        interests: { select: { categoryId: true } },
      },
    }),
    getCurrentGemeente(),
  ])

  const { percent, missing } = user
    ? computeCompleteness(user)
    : { percent: 0, missing: ["profiel"] }

  // Gemeente-id ophalen voor activiteiten-filter
  let gemeenteId: string | null = null
  if (gemeente) {
    const gr = await prisma.gemeente.findUnique({ where: { slug: gemeente.slug }, select: { id: true } })
    gemeenteId = gr?.id ?? null
  }

  const accentColor = gemeente?.primaryColor ?? "#f97316"

  // Aankomende activiteiten (max 5) + eigen aanmeldingen
  const [upcomingActivities, myRegistrations] = await Promise.all([
    prisma.groupActivity.findMany({
      where: {
        status: "PUBLISHED",
        startDateTime: { gte: new Date() },
        ...(gemeenteId ? { gemeenteId } : {}),
      },
      include: {
        organisation: { select: { name: true } },
        registrations: {
          where: { status: { in: ["REGISTERED", "WAITLISTED"] } },
          select: { status: true },
        },
      },
      orderBy: { startDateTime: "asc" },
      take: 5,
    }),
    prisma.activityRegistration.findMany({
      where: { volunteerId: session.user.id, status: { in: ["REGISTERED", "WAITLISTED"] } },
      select: { activityId: true },
    }),
  ])

  const myRegSet = new Set(myRegistrations.map((r) => r.activityId))

  return (
    <div className="min-h-[calc(100svh-8.5rem)] bg-gray-50 flex flex-col items-center px-4 pt-3 pb-4 gap-3">
      <div className="w-full max-w-sm" data-tour-id="profile-completeness">
        <ProfileCompleteness percent={percent} missing={missing} />
      </div>

      <div className="w-full max-w-sm flex-1" data-tour-id="swipe-deck">
        <SwipeDeck />
      </div>

      {/* Activiteiten ontdekkingsstrip */}
      {upcomingActivities.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Aankomende activiteiten</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Kennismaken zonder commitment</p>
            </div>
            <Link
              href="/activiteiten"
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
              style={{ color: accentColor }}
            >
              Bekijk alles <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {upcomingActivities.map((activity) => (
              <ActivityMiniCard
                key={activity.id}
                activity={activity}
                accentColor={accentColor}
                registered={myRegSet.has(activity.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
