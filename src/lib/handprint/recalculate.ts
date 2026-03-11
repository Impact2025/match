/**
 * Herbereken de OrgHandprint voor één organisatie en sla op in de DB.
 * Exporteerbaar zodat zowel de API route als de cron job dit kunnen aanroepen.
 */

import { prisma } from "@/lib/prisma"
import {
  berekenUurwaarde,
  berekenRetentieScore,
  berekenSDGScores,
  estimateMatchHours,
  berekenGemLooptijd,
} from "./berekeningen"

// ── Motivatie aggregatie ───────────────────────────────────────────────────────

const VFI_KEYS = ["waarden", "begrip", "sociaal", "loopbaan", "bescherming", "verbetering"] as const

function aggregateMotivatie(
  volunteers: { motivationProfile: string | null }[],
): { distributie: Record<string, number> | null; dominant: string | null } {
  const sums: Record<string, number> = {}
  let count = 0

  for (const v of volunteers) {
    if (!v.motivationProfile) continue
    try {
      const profile = JSON.parse(v.motivationProfile) as Record<string, number>
      for (const key of VFI_KEYS) {
        if (typeof profile[key] === "number") {
          sums[key] = (sums[key] ?? 0) + profile[key]
          count++
        }
      }
    } catch {
      // ignore malformed JSON
    }
  }

  if (count === 0) return { distributie: null, dominant: null }

  // Normalize: divide each sum by number of profiles contributing
  const profileCount = volunteers.filter((v) => v.motivationProfile).length
  const normalized: Record<string, number> = {}
  for (const key of VFI_KEYS) {
    normalized[key] = Math.round(((sums[key] ?? 0) / profileCount) * 100) / 100
  }

  const dominant = VFI_KEYS.reduce((a, b) =>
    (normalized[a] ?? 0) >= (normalized[b] ?? 0) ? a : b,
  )

  return { distributie: normalized, dominant }
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function recalculateOrgHandprint(organisationId: string) {
  // 1. Fetch org with categories
  const org = await prisma.organisation.findUnique({
    where: { id: organisationId },
    include: {
      categories: { include: { category: true } },
    },
  })
  if (!org) throw new Error(`Organisation not found: ${organisationId}`)

  // 2. Fetch all fulfilled matches with vacancy hours + volunteer motivation
  const matches = await prisma.match.findMany({
    where: {
      status: { in: ["ACCEPTED", "COMPLETED"] },
      vacancy: { organisationId },
    },
    select: {
      status: true,
      startedAt: true,
      updatedAt: true,
      vacancy: { select: { hours: true } },
      volunteer: { select: { motivationProfile: true } },
    },
  })

  // 3. Calculate total hours
  let totalHours = 0
  for (const m of matches) {
    totalHours += estimateMatchHours(m.vacancy.hours, m.status, m.startedAt)
  }

  // 4. Economic value (use 0.7 avg match score — good baseline for accepted matches)
  const { vervangingswaarde, sroiWaarde } = berekenUurwaarde(totalHours, 0.7)

  // 5. Retention score
  const activeCount    = matches.filter((m) => m.status === "ACCEPTED").length
  const completedCount = matches.filter((m) => m.status === "COMPLETED").length
  const avgDuration    = berekenGemLooptijd(
    matches.map((m) => ({ startedAt: m.startedAt, updatedAt: m.updatedAt, status: m.status })),
  )
  const retentieScore = berekenRetentieScore(activeCount, completedCount, avgDuration)

  // 6. SDG scores
  const catNames = org.categories.map((c) => c.category.name)
  const sdgScores = berekenSDGScores(catNames)

  // 7. Motivation distribution
  const { distributie, dominant } = aggregateMotivatie(matches.map((m) => m.volunteer))

  // 8. Upsert OrgHandprint
  const data = {
    totaalUrenJaarlijks:   Math.round(totalHours),
    maatschappelijkeWaarde: vervangingswaarde,
    sroiWaarde,
    retentieScore,
    aantalActieveMatches:   activeCount,
    aantalAfgerondMatches:  completedCount,
    gemLooptijdMaanden:     avgDuration,
    sdgScores:              Object.keys(sdgScores).length > 0 ? sdgScores : undefined,
    dominantMotivatie:      dominant,
    motivatieDistributie:   distributie,
    laasteBerekening:       new Date(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handprint = await (prisma as any).orgHandprint.upsert({
    where:  { organisationId },
    create: { organisationId, ...data },
    update: data,
  })

  return handprint
}
