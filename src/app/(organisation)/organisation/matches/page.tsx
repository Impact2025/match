export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MatchReviewCard } from "@/components/organisation/match-review-card"
import { Users } from "lucide-react"

const STATUS_ORDER: Record<string, number> = { PENDING: 0, ACCEPTED: 1, REJECTED: 2, COMPLETED: 3 }

export default async function OrgMatchesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
  })

  if (!org) redirect("/onboarding")

  const matches = await prisma.match.findMany({
    where: { vacancy: { organisationId: org.id } },
    include: {
      volunteer: {
        include: {
          skills: { include: { skill: true } },
        },
      },
      vacancy: true,
      conversation: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch match reasons from swipes in one batch
  const swipeKeys = matches.map((m) => ({ fromId: m.volunteerId, vacancyId: m.vacancyId }))
  const swipes = swipeKeys.length > 0
    ? await prisma.swipe.findMany({
        where: {
          OR: swipeKeys,
          direction: { in: ["LIKE", "SUPER_LIKE"] },
        },
        select: { fromId: true, vacancyId: true, matchReason: true },
      })
    : []

  const swipeMap = new Map(swipes.map((s) => [`${s.fromId}:${s.vacancyId}`, s.matchReason]))

  const matchesWithReason = matches.map((m) => ({
    ...m,
    matchReason: swipeMap.get(`${m.volunteerId}:${m.vacancyId}`) ?? null,
  }))

  const sorted = [...matchesWithReason].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
  )

  const pending = sorted.filter((m) => m.status === "PENDING")
  const others = sorted.filter((m) => m.status !== "PENDING")

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matches beoordelen</h1>
        <p className="text-gray-500 text-sm mt-1">
          {matches.length} totale match(es) · {pending.length} in afwachting
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto"><Users className="w-7 h-7 text-orange-400" /></div>
          <h3 className="text-lg font-semibold text-gray-900">Nog geen matches</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Vrijwilligers die interesse tonen in jouw vacatures verschijnen hier.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                  {pending.length}
                </span>
                In afwachting
              </h2>
              {pending.map((match) => (
                <MatchReviewCard key={match.id} match={match as any} />
              ))}
            </section>
          )}

          {others.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700">Afgerond</h2>
              {others.map((match) => (
                <MatchReviewCard key={match.id} match={match as any} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
