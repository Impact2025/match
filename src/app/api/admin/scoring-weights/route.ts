/**
 * Admin: Scoring weights configuration
 *
 * GET  /api/admin/scoring-weights  — return current weights (merged with defaults)
 * PATCH /api/admin/scoring-weights — update weights (partial update ok)
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEFAULT_WEIGHTS, type ScoringWeights } from "@/lib/matching/scoring-engine"
import { invalidateWeightsCache } from "@/lib/matching/weights"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const u = session.user as { role?: string }
  return u.role === "ADMIN" ? session : null
}

async function getCurrentWeights(): Promise<ScoringWeights> {
  try {
    const rows = await prisma.$queryRaw<{ data: string }[]>`
      SELECT data FROM app_settings WHERE id = 'default' LIMIT 1
    `
    if (rows[0]?.data) {
      return { ...DEFAULT_WEIGHTS, ...JSON.parse(rows[0].data) }
    }
  } catch { /* first run — no row yet */ }
  return DEFAULT_WEIGHTS
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const weights = await getCurrentWeights()
  return NextResponse.json({ weights, defaults: DEFAULT_WEIGHTS })
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  try {
    const body = await req.json() as Partial<ScoringWeights>

    // Validate weight proportions (motivation + distance + skill + freshness must sum to ≈1)
    const { motivation, distance, skill, freshness } = { ...DEFAULT_WEIGHTS, ...body }
    const sum = motivation + distance + skill + freshness
    if (Math.abs(sum - 1.0) > 0.01) {
      return NextResponse.json(
        { error: `Gewichten moeten optellen tot 1.0 (nu: ${sum.toFixed(3)})` },
        { status: 400 }
      )
    }

    // Validate ranges
    for (const [key, val] of Object.entries(body)) {
      if (["motivation", "distance", "skill", "freshness"].includes(key)) {
        if (typeof val !== "number" || val < 0 || val > 1) {
          return NextResponse.json(
            { error: `${key} moet een getal zijn tussen 0 en 1` },
            { status: 400 }
          )
        }
      }
      if (["freshnessWindowDays", "smallOrgThreshold", "largeOrgThreshold"].includes(key)) {
        if (typeof val !== "number" || val < 1) {
          return NextResponse.json(
            { error: `${key} moet een positief getal zijn` },
            { status: 400 }
          )
        }
      }
    }

    const current = await getCurrentWeights()
    const updated: ScoringWeights = { ...current, ...body }
    const json = JSON.stringify(updated)

    // Upsert via raw SQL (Prisma client may not have AppSettings type yet)
    await prisma.$executeRaw`
      INSERT INTO app_settings (id, data, updated_at)
      VALUES ('default', ${json}, NOW())
      ON CONFLICT (id) DO UPDATE SET data = ${json}, updated_at = NOW()
    `

    // Bust the in-memory cache so next scoring call picks up new weights
    invalidateWeightsCache()

    return NextResponse.json({ ok: true, weights: updated })
  } catch (error) {
    console.error("[SCORING_WEIGHTS_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
