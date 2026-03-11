/**
 * GET /api/cron/herbereken-handprints
 *
 * Nachtelijke cron-job (02:00 UTC) die alle organisaties doorloopt,
 * hun OrgHandprint herberekent en de GemeenteDashboard-cache bijwerkt.
 *
 * Beveiligd met CRON_SECRET environment variable.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { recalculateOrgHandprint } from "@/lib/handprint/recalculate"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Auth via Authorization header of query param
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "") ?? req.nextUrl.searchParams.get("token")

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startedAt = Date.now()
  const results = { success: 0, failed: 0, errors: [] as string[] }

  // ── Herbereken alle organisaties ────────────────────────────────────────────
  const orgs = await prisma.organisation.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
  })

  for (const org of orgs) {
    try {
      await recalculateOrgHandprint(org.id)
      results.success++
    } catch (err) {
      results.failed++
      results.errors.push(`${org.name}: ${err instanceof Error ? err.message : "onbekend"}`)
    }
  }

  // ── Update GemeenteDashboard cache ──────────────────────────────────────────
  const gemeenten = await prisma.gemeente.findMany({
    select: {
      id: true,
      organisations: {
        where: { status: "APPROVED" },
        select: {
          handprint: {
            select: {
              totaalUrenJaarlijks:    true,
              maatschappelijkeWaarde: true,
              retentieScore:          true,
            },
          },
        },
      },
    },
  })

  let gemeentenUpdated = 0
  for (const g of gemeenten) {
    const orgsWithHandprint = g.organisations.filter((o) => o.handprint !== null)
    const totaalUren   = orgsWithHandprint.reduce((s, o) => s + (o.handprint?.totaalUrenJaarlijks    ?? 0), 0)
    const totaalWaarde = orgsWithHandprint.reduce((s, o) => s + (o.handprint?.maatschappelijkeWaarde ?? 0), 0)
    const gemRetentie  = orgsWithHandprint.length > 0
      ? orgsWithHandprint.reduce((s, o) => s + (o.handprint?.retentieScore ?? 0), 0) / orgsWithHandprint.length
      : 0

    await prisma.gemeenteDashboard.upsert({
      where:  { gemeenteId: g.id },
      create: {
        gemeenteId:          g.id,
        aantalOrganisaties:  g.organisations.length,
        totaalUren,
        totaalWaarde,
        gemRetentieScore:    Math.round(gemRetentie),
        laasteSync:          new Date(),
      },
      update: {
        aantalOrganisaties:  g.organisations.length,
        totaalUren,
        totaalWaarde,
        gemRetentieScore:    Math.round(gemRetentie),
        laasteSync:          new Date(),
      },
    })
    gemeentenUpdated++
  }

  const duration = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`[cron] herbereken-handprints: ${results.success} ok, ${results.failed} failed in ${duration}s`)

  return NextResponse.json({
    ...results,
    gemeentenUpdated,
    durationSeconds: duration,
  })
}
