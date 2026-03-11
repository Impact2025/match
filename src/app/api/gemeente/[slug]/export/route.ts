/**
 * GET /api/gemeente/[slug]/export
 *
 * Genereert een CSV-download van de organisatietabel voor de gemeente.
 * Beveiligd: alleen ADMIN en GEMEENTE_ADMIN.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user?.id || !["ADMIN", "GEMEENTE_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const { slug } = await params

  const gemeente = await prisma.gemeente.findUnique({
    where: { slug },
    select: { id: true, displayName: true },
  })
  if (!gemeente) return NextResponse.json({ error: "Gemeente niet gevonden" }, { status: 404 })

  const orgs = await prisma.organisation.findMany({
    where: { status: "APPROVED", gemeenteId: gemeente.id },
    select: {
      name: true,
      city: true,
      email: true,
      categories: { select: { category: { select: { name: true } } } },
      handprint: {
        select: {
          totaalUrenJaarlijks:    true,
          maatschappelijkeWaarde: true,
          sroiWaarde:             true,
          retentieScore:          true,
          aantalActieveMatches:   true,
          aantalAfgerondMatches:  true,
          laasteBerekening:       true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  // ── Build CSV ───────────────────────────────────────────────────────────────
  const headers = [
    "Organisatie",
    "Stad",
    "E-mail",
    "Categorieën",
    "Actieve matches",
    "Afgeronde matches",
    "Vrijwilligersuren",
    "Maatsch. waarde (€)",
    "SROI-waarde (€)",
    "Retentiescore (%)",
    "Laatste berekening",
  ]

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "")
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const rows = orgs.map((o) => [
    escape(o.name),
    escape(o.city),
    escape(o.email),
    escape(o.categories.map((c) => c.category.name).join("; ")),
    escape(o.handprint?.aantalActieveMatches ?? 0),
    escape(o.handprint?.aantalAfgerondMatches ?? 0),
    escape(o.handprint?.totaalUrenJaarlijks ?? 0),
    escape(o.handprint?.maatschappelijkeWaarde ?? 0),
    escape(o.handprint?.sroiWaarde ?? 0),
    escape(o.handprint?.retentieScore ?? 0),
    escape(o.handprint?.laasteBerekening?.toISOString().split("T")[0] ?? ""),
  ])

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const dateStr = new Date().toISOString().split("T")[0]

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vrijwilligersrapport-${gemeente.displayName.toLowerCase()}-${dateStr}.csv"`,
    },
  })
}
