/**
 * GET /api/gemeente/[slug]/stats
 *
 * Retourneert geaggregeerde statistieken voor een gemeente:
 * KPIs, SDG-impact, trend, en organisatietabel met handprints.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"

export const revalidate = 3600

function estimateHours(
  hoursPerWeek: number | null,
  status: string,
  startedAt: Date | null,
) {
  const h = hoursPerWeek ?? 2
  if (status === "COMPLETED") return h * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
  if (!startedAt) return h * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
  const weeks = Math.min(
    (Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
    IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS,
  )
  return h * Math.max(weeks, 1)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const gemeente = await prisma.gemeente.findUnique({
    where: { slug },
    select: { id: true, name: true, displayName: true, primaryColor: true, tagline: true },
  })
  if (!gemeente) return NextResponse.json({ error: "Gemeente niet gevonden" }, { status: 404 })

  const gid = gemeente.id

  // ── Basic counts ────────────────────────────────────────────────────────────
  const [orgCount, vacancyCount, allMatches, matchesWithCats] = await Promise.all([
    prisma.organisation.count({ where: { status: "APPROVED", gemeenteId: gid } }),
    prisma.vacancy.count({
      where: { status: "ACTIVE", organisation: { gemeenteId: gid } },
    }),
    prisma.match.findMany({
      where: { vacancy: { organisation: { gemeenteId: gid } } },
      select: { status: true, startedAt: true, checkIn12SentAt: true },
    }),
    prisma.match.findMany({
      where: {
        status: { in: ["ACCEPTED", "COMPLETED"] },
        vacancy: { organisation: { gemeenteId: gid } },
      },
      select: {
        status: true,
        startedAt: true,
        vacancy: {
          select: {
            hours: true,
            categories: { select: { category: { select: { name: true } } } },
          },
        },
      },
    }),
  ])

  const acceptedCount  = allMatches.filter((m) => m.status === "ACCEPTED").length
  const completedCount = allMatches.filter((m) => m.status === "COMPLETED").length
  const checkIn12Count = allMatches.filter((m) => m.checkIn12SentAt !== null).length

  // ── Hours + economic value ──────────────────────────────────────────────────
  let totalHours = 0
  for (const m of matchesWithCats) {
    totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  }
  const economicValue = Math.round(totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR)
  const sroiValue     = Math.round(economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER)

  // ── Retentie ────────────────────────────────────────────────────────────────
  const fulfilledMatches = acceptedCount + completedCount
  const retentionWeek12  = fulfilledMatches > 0
    ? Math.round((checkIn12Count / fulfilledMatches) * 100)
    : 0

  // ── SDG bijdrage ────────────────────────────────────────────────────────────
  const sdgHours = new Map<number, number>()
  for (const m of matchesWithCats) {
    const h    = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const sdgs = new Set<number>()
    for (const cat of cats) (CATEGORY_SDG_MAP[cat] ?? []).forEach((n) => sdgs.add(n))
    const share = sdgs.size > 0 ? h / sdgs.size : 0
    for (const n of sdgs) sdgHours.set(n, (sdgHours.get(n) ?? 0) + share)
  }
  const sdgImpact = SDG_DEFINITIONS.filter((s) => sdgHours.has(s.number)).map((s) => ({
    sdgNumber:      s.number,
    sdgNameNl:      s.nameNl,
    color:          s.color,
    emoji:          s.emoji,
    estimatedHours: Math.round(sdgHours.get(s.number)!),
  })).sort((a, b) => b.estimatedHours - a.estimatedHours)

  // ── Monthly trend ───────────────────────────────────────────────────────────
  type MonthRow = { month: string; cnt: bigint }
  const [matchRows, acceptedRows] = await Promise.all([
    prisma.$queryRaw<MonthRow[]>`
      SELECT TO_CHAR(m.created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt
      FROM matches m
      JOIN vacancies v ON m.vacancy_id = v.id
      JOIN organisations o ON v.organisation_id = o.id
      WHERE o.gemeente_id = ${gid}
        AND m.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month ORDER BY month`,
    prisma.$queryRaw<MonthRow[]>`
      SELECT TO_CHAR(m.started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt
      FROM matches m
      JOIN vacancies v ON m.vacancy_id = v.id
      JOIN organisations o ON v.organisation_id = o.id
      WHERE o.gemeente_id = ${gid}
        AND m.started_at >= NOW() - INTERVAL '12 months'
        AND m.status IN ('ACCEPTED','COMPLETED')
      GROUP BY month ORDER BY month`,
  ]).catch(() => [[], []] as [MonthRow[], MonthRow[]])

  type MonthPt = { month: string; newMatches: number; acceptedMatches: number }
  const monthMap = new Map<string, MonthPt>()
  const touch = (m: string) => {
    if (!monthMap.has(m)) monthMap.set(m, { month: m, newMatches: 0, acceptedMatches: 0 })
    return monthMap.get(m)!
  }
  for (const r of matchRows)   touch(r.month).newMatches      += Number(r.cnt)
  for (const r of acceptedRows) touch(r.month).acceptedMatches += Number(r.cnt)
  const monthlyTrend = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))

  // ── Organisatietabel ────────────────────────────────────────────────────────
  const orgs = await prisma.organisation.findMany({
    where: { status: "APPROVED", gemeenteId: gid },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      categories: { select: { category: { select: { name: true } } } },
      handprint: {
        select: {
          totaalUrenJaarlijks:    true,
          maatschappelijkeWaarde: true,
          sroiWaarde:             true,
          retentieScore:          true,
          sdgScores:              true,
          aantalActieveMatches:   true,
          laasteBerekening:       true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  // ── Nieuwste matches (deze maand) ────────────────────────────────────────────
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const newMatchesThisMonth = await prisma.match.count({
    where: {
      vacancy: { organisation: { gemeenteId: gid } },
      createdAt: { gte: startOfMonth },
    },
  })

  return NextResponse.json({
    gemeente,
    kpis: {
      totaalOrganisaties:   orgCount,
      totaalVacatures:      vacancyCount,
      totaalMatches:        allMatches.length,
      fulfilledMatches,
      totalHours:           Math.round(totalHours),
      economicValue,
      sroiValue,
      retentionWeek12,
      newMatchesThisMonth,
    },
    sdgImpact,
    monthlyTrend,
    organisaties: orgs.map((o) => ({
      id:         o.id,
      name:       o.name,
      slug:       o.slug,
      city:       o.city,
      categories: o.categories.map((c) => c.category.name),
      handprint:  o.handprint,
    })),
  })
}
