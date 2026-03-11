/**
 * GET /api/kaart/organisaties
 *
 * Retourneert alle goedgekeurde organisaties met coordinaten en handprint-samenvatting.
 * Gebruikt voor de interactieve impactkaart.
 *
 * Query params:
 *   ?gemeente=heemstede   filter op gemeente-slug
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600 // 1 uur cache

export async function GET(req: NextRequest) {
  const gemeenteSlug = req.nextUrl.searchParams.get("gemeente") ?? null

  let gemeenteWhere: { gemeenteId?: string } = {}
  if (gemeenteSlug) {
    const gemeente = await prisma.gemeente.findUnique({
      where: { slug: gemeenteSlug },
      select: { id: true },
    })
    if (gemeente) gemeenteWhere = { gemeenteId: gemeente.id }
  }

  const orgs = await prisma.organisation.findMany({
    where: {
      status: "APPROVED",
      lat: { not: null },
      lon: { not: null },
      ...gemeenteWhere,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      city: true,
      lat: true,
      lon: true,
      categories: { select: { category: { select: { name: true, color: true } } } },
      handprint: {
        select: {
          maatschappelijkeWaarde: true,
          sroiWaarde: true,
          retentieScore: true,
          totaalUrenJaarlijks: true,
          sdgScores: true,
          dominantMotivatie: true,
        },
      },
    },
  })

  const result = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    logo: org.logo,
    city: org.city,
    lat: org.lat!,
    lng: org.lon!,
    categories: org.categories.map((c) => c.category.name),
    handprint: org.handprint
      ? {
          waarde: org.handprint.maatschappelijkeWaarde,
          sroiWaarde: org.handprint.sroiWaarde,
          retentieScore: org.handprint.retentieScore,
          totalHours: org.handprint.totaalUrenJaarlijks,
          sdgScores: org.handprint.sdgScores,
          dominantMotivatie: org.handprint.dominantMotivatie,
        }
      : null,
  }))

  return NextResponse.json(result)
}
