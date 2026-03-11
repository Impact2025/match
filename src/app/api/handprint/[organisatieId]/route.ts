/**
 * GET  /api/handprint/[organisatieId]   — return cached handprint (or calculate if missing)
 * POST /api/handprint/[organisatieId]   — force recalculate and save
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { recalculateOrgHandprint } from "@/lib/handprint/recalculate"

export const dynamic = "force-dynamic"

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ organisatieId: string }> },
) {
  const { organisatieId } = await params

  // Return cached handprint if it exists
  let handprint = await prisma.orgHandprint.findUnique({
    where: { organisationId: organisatieId },
  })

  // Calculate on-the-fly if missing
  if (!handprint) {
    try {
      handprint = await recalculateOrgHandprint(organisatieId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Berekening mislukt"
      return NextResponse.json({ error: msg }, { status: 404 })
    }
  }

  return NextResponse.json(handprint)
}

// ── POST (herbereken) ──────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ organisatieId: string }> },
) {
  const { organisatieId } = await params

  try {
    const handprint = await recalculateOrgHandprint(organisatieId)
    return NextResponse.json(handprint)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Berekening mislukt"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
