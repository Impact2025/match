/**
 * GET /api/impact
 *
 * Publiek endpoint dat impact-metrics retourneert voor een gemeente.
 * Query-param: ?gemeente=heemstede  (valt terug op x-gemeente-slug header)
 *
 * Berekeningen:
 *  - Vrijwilligersuren: accepted/completed matches × vacancy.hours × weken
 *  - Maatschappelijke waarde: uren × €15,38 (CBS 2024)
 *  - SROI: waarde × 4,2 (Movisie/SVI methodiek)
 *  - SDG-bijdrage: matches via vacancy_categories → CATEGORY_SDG_MAP
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"

export const dynamic = "force-dynamic"

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyPoint {
  month: string          // "2025-01"
  newMatches: number
  acceptedMatches: number
  newVolunteers: number
  estimatedHours: number
}

interface SdgImpactRow {
  sdgNumber: number
  sdgName: string
  sdgNameNl: string
  color: string
  emoji: string
  matchCount: number
  estimatedHours: number
  percentage: number
}

interface CategoryRow {
  category: string
  matchCount: number
  estimatedHours: number
  sdgs: number[]
}

// ── Hours helper ──────────────────────────────────────────────────────────────

function estimateHours(
  hoursPerWeek: number | null,
  status: string,
  startedAt: Date | null,
): number {
  const h = hoursPerWeek ?? 2
  if (status === "COMPLETED") {
    return h * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
  }
  if (!startedAt) {
    return h * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
  }
  const weeksActive = Math.min(
    (Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
    IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS,
  )
  return h * Math.max(weeksActive, 1)
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const gemeenteSlug =
    req.nextUrl.searchParams.get("gemeente") ??
    req.headers.get("x-gemeente-slug") ??
    null

  // ── Gemeente filter ──────────────────────────────────────────────────────
  let gemeenteWhere: { gemeenteId?: string } = {}
  let gemeente: { id: string; name: string; displayName: string; primaryColor: string; tagline: string | null } | null = null

  if (gemeenteSlug) {
    gemeente = await prisma.gemeente.findUnique({
      where: { slug: gemeenteSlug },
      select: { id: true, name: true, displayName: true, primaryColor: true, tagline: true },
    })
    if (gemeente) gemeenteWhere = { gemeenteId: gemeente.id }
  }

  const gid = gemeenteWhere.gemeenteId ?? null

  // ── Parallel basic counts ────────────────────────────────────────────────
  const [
    totalVolunteers,
    totalOrganisations,
    totalVacancies,
    totalMatches,
    pendingMatches,
    acceptedMatches,
    completedMatches,
    totalConversations,
    totalSwipes,
    likeSwipes,
    superLikeSwipes,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "VOLUNTEER",
        status: "ACTIVE",
        onboarded: true,
        ...(gemeenteSlug ? {} : {}), // volunteers are not org-linked, so no gemeente filter
      },
    }),
    prisma.organisation.count({ where: { status: "APPROVED", ...gemeenteWhere } }),
    prisma.vacancy.count({
      where: {
        status: "ACTIVE",
        organisation: { status: "APPROVED", ...gemeenteWhere },
      },
    }),
    prisma.match.count({
      where: { vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.match.count({
      where: { status: "PENDING", vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.match.count({
      where: { status: "ACCEPTED", vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.match.count({
      where: { status: "COMPLETED", vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.conversation.count(),
    prisma.swipe.count(),
    prisma.swipe.count({ where: { direction: "LIKE" } }),
    prisma.swipe.count({ where: { direction: "SUPER_LIKE" } }),
  ])

  // ── Active volunteers (matched last 90 days) ─────────────────────────────
  const activeVolunteers = await (gid
    ? prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT u.id)::bigint as cnt
        FROM users u
        JOIN matches m ON m.volunteer_id = u.id
        JOIN vacancies v ON m.vacancy_id = v.id
        JOIN organisations o ON v.organisation_id = o.id
        WHERE u.role = 'VOLUNTEER' AND u.status = 'ACTIVE'
          AND m.status IN ('ACCEPTED','COMPLETED')
          AND m.started_at >= NOW() - INTERVAL '90 days'
          AND o.gemeente_id = ${gid}
      `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)
    : prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT u.id)::bigint as cnt
        FROM users u JOIN matches m ON m.volunteer_id = u.id
        WHERE u.role = 'VOLUNTEER' AND u.status = 'ACTIVE'
          AND m.status IN ('ACCEPTED','COMPLETED')
          AND m.started_at >= NOW() - INTERVAL '90 days'
      `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)
  )

  // ── Volunteer hours & economic value ────────────────────────────────────
  const activeFulfilledMatches = await prisma.match.findMany({
    where: {
      status: { in: ["ACCEPTED", "COMPLETED"] },
      vacancy: { organisation: { ...gemeenteWhere } },
    },
    select: { status: true, startedAt: true, vacancy: { select: { hours: true } } },
  })

  let totalHours = 0
  for (const m of activeFulfilledMatches) {
    totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  }

  const economicValue = totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  const sroiValue = economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER

  // ── Retention rates ──────────────────────────────────────────────────────
  const [checkIn1Count, checkIn4Count, checkIn12Count] = await Promise.all([
    prisma.match.count({
      where: { checkIn1SentAt: { not: null }, vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.match.count({
      where: { checkIn4SentAt: { not: null }, vacancy: { organisation: { ...gemeenteWhere } } },
    }),
    prisma.match.count({
      where: { checkIn12SentAt: { not: null }, vacancy: { organisation: { ...gemeenteWhere } } },
    }),
  ])

  const retentionWeek1  = acceptedMatches > 0 ? (checkIn1Count  / acceptedMatches) * 100 : 0
  const retentionWeek4  = acceptedMatches > 0 ? (checkIn4Count  / acceptedMatches) * 100 : 0
  const retentionWeek12 = acceptedMatches > 0 ? (checkIn12Count / acceptedMatches) * 100 : 0
  const matchAcceptanceRate = totalMatches > 0 ? ((acceptedMatches + completedMatches) / totalMatches) * 100 : 0
  const likeRate = totalSwipes > 0 ? ((likeSwipes + superLikeSwipes) / totalSwipes) * 100 : 0

  // ── SDG impact (via vacancy categories) ─────────────────────────────────
  type MatchWithCats = {
    id: string
    status: string
    startedAt: Date | null
    vacancy: {
      hours: number | null
      categories: { category: { name: string } }[]
    }
  }

  const matchesWithCategories: MatchWithCats[] = await prisma.match.findMany({
    where: {
      status: { in: ["ACCEPTED", "COMPLETED"] },
      vacancy: { organisation: { ...gemeenteWhere } },
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
      vacancy: {
        select: {
          hours: true,
          categories: { select: { category: { select: { name: true } } } },
        },
      },
    },
  })

  // Accumulate hours per SDG
  const sdgHours = new Map<number, number>()
  const sdgMatches = new Map<number, number>()

  for (const m of matchesWithCategories) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const catNames = m.vacancy.categories.map((c) => c.category.name)
    const sdgNums = new Set<number>()
    for (const cat of catNames) {
      const mapped = CATEGORY_SDG_MAP[cat] ?? []
      mapped.forEach((n) => sdgNums.add(n))
    }
    // Distribute hours equally across all SDGs this match contributes to
    const share = sdgNums.size > 0 ? h / sdgNums.size : 0
    for (const sdg of sdgNums) {
      sdgHours.set(sdg, (sdgHours.get(sdg) ?? 0) + share)
      sdgMatches.set(sdg, (sdgMatches.get(sdg) ?? 0) + 1)
    }
  }

  const totalSdgHours = Array.from(sdgHours.values()).reduce((s, h) => s + h, 0) || 1

  const sdgImpact: SdgImpactRow[] = SDG_DEFINITIONS
    .filter((s) => sdgHours.has(s.number))
    .map((s) => ({
      sdgNumber: s.number,
      sdgName: s.name,
      sdgNameNl: s.nameNl,
      color: s.color,
      emoji: s.emoji,
      matchCount: sdgMatches.get(s.number) ?? 0,
      estimatedHours: Math.round(sdgHours.get(s.number) ?? 0),
      percentage: Math.round(((sdgHours.get(s.number) ?? 0) / totalSdgHours) * 100),
    }))
    .sort((a, b) => b.estimatedHours - a.estimatedHours)

  // ── Category breakdown ───────────────────────────────────────────────────
  const categoryHours = new Map<string, number>()
  const categoryMatches = new Map<string, number>()

  for (const m of matchesWithCategories) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const catNames = m.vacancy.categories.map((c) => c.category.name)
    const share = catNames.length > 0 ? h / catNames.length : 0
    for (const cat of catNames) {
      categoryHours.set(cat, (categoryHours.get(cat) ?? 0) + share)
      categoryMatches.set(cat, (categoryMatches.get(cat) ?? 0) + 1)
    }
  }

  const categoryBreakdown: CategoryRow[] = Array.from(categoryHours.entries())
    .map(([cat, hrs]) => ({
      category: cat,
      matchCount: categoryMatches.get(cat) ?? 0,
      estimatedHours: Math.round(hrs),
      sdgs: CATEGORY_SDG_MAP[cat] ?? [],
    }))
    .sort((a, b) => b.estimatedHours - a.estimatedHours)

  // ── Monthly trend (last 12 months) ───────────────────────────────────────
  type MonthRow = { month: string; cnt: bigint }

  const [matchesByMonth, acceptedByMonth, volunteersByMonth] = await Promise.all([
    gid
      ? prisma.$queryRaw<MonthRow[]>`
          SELECT TO_CHAR(m.created_at, 'YYYY-MM') as month, COUNT(*)::bigint as cnt
          FROM matches m
          JOIN vacancies v ON m.vacancy_id = v.id
          JOIN organisations o ON v.organisation_id = o.id
          WHERE o.gemeente_id = ${gid}
            AND m.created_at >= NOW() - INTERVAL '12 months'
          GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MonthRow[]>`
          SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::bigint as cnt
          FROM matches
          WHERE created_at >= NOW() - INTERVAL '12 months'
          GROUP BY month ORDER BY month`,
    gid
      ? prisma.$queryRaw<MonthRow[]>`
          SELECT TO_CHAR(m.started_at, 'YYYY-MM') as month, COUNT(*)::bigint as cnt
          FROM matches m
          JOIN vacancies v ON m.vacancy_id = v.id
          JOIN organisations o ON v.organisation_id = o.id
          WHERE o.gemeente_id = ${gid}
            AND m.started_at >= NOW() - INTERVAL '12 months'
            AND m.status IN ('ACCEPTED','COMPLETED')
          GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MonthRow[]>`
          SELECT TO_CHAR(started_at, 'YYYY-MM') as month, COUNT(*)::bigint as cnt
          FROM matches
          WHERE started_at >= NOW() - INTERVAL '12 months'
            AND status IN ('ACCEPTED','COMPLETED')
          GROUP BY month ORDER BY month`,
    prisma.$queryRaw<MonthRow[]>`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::bigint as cnt
      FROM users
      WHERE role = 'VOLUNTEER'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month ORDER BY month`,
  ]).catch(() => [[], [], []] as [MonthRow[], MonthRow[], MonthRow[]])

  // Build unified month map
  const monthMap = new Map<string, MonthlyPoint>()
  const toKey = (r: { month: string; cnt: bigint }) => {
    if (!monthMap.has(r.month)) {
      monthMap.set(r.month, { month: r.month, newMatches: 0, acceptedMatches: 0, newVolunteers: 0, estimatedHours: 0 })
    }
    return monthMap.get(r.month)!
  }
  for (const r of matchesByMonth)    toKey(r).newMatches      += Number(r.cnt)
  for (const r of acceptedByMonth)   toKey(r).acceptedMatches += Number(r.cnt)
  for (const r of volunteersByMonth) toKey(r).newVolunteers    += Number(r.cnt)

  // Add hours estimate per month (rough: accepted this month × 3h/w × 4w)
  for (const r of acceptedByMonth) {
    const pt = monthMap.get(r.month)
    if (pt) pt.estimatedHours = Number(r.cnt) * 3 * 4
  }

  const monthlyTrend: MonthlyPoint[] = Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))

  // ── Response ─────────────────────────────────────────────────────────────
  return NextResponse.json({
    gemeente: gemeente ?? { name: "Vrijwilligersmatch", displayName: "Platform", primaryColor: "#7c3aed", tagline: null },
    generatedAt: new Date().toISOString(),
    overview: {
      totalVolunteers,
      activeVolunteers,
      totalOrganisations,
      totalVacancies,
      totalMatches,
      pendingMatches,
      acceptedMatches,
      completedMatches,
      totalConversations,
      totalSwipes,
      likeRate: Math.round(likeRate * 10) / 10,
      matchAcceptanceRate: Math.round(matchAcceptanceRate * 10) / 10,
      retentionWeek1:  Math.round(retentionWeek1  * 10) / 10,
      retentionWeek4:  Math.round(retentionWeek4  * 10) / 10,
      retentionWeek12: Math.round(retentionWeek12 * 10) / 10,
      totalHours:       Math.round(totalHours),
      economicValue:    Math.round(economicValue),
      sroiValue:        Math.round(sroiValue),
      hourlyValueEur:   IMPACT_CONSTANTS.HOURLY_VALUE_EUR,
      sroiMultiplier:   IMPACT_CONSTANTS.SROI_MULTIPLIER,
    },
    sdgImpact,
    categoryBreakdown,
    monthlyTrend,
  })
}
