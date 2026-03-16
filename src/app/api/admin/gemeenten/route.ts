import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function isAdmin(session: any) {
  const role = session?.user?.role
  return session && (role === "ADMIN" || role === "GEMEENTE_ADMIN")
}

const createSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(80),
  displayName: z.string().min(2).max(80),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  tagline: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
})

export async function GET() {
  const session = await auth()
  if (!isAdmin(session)) return NextResponse.json({ error: "Geen toegang" }, { status: 403 })

  const gemeenten = await prisma.$queryRaw<Array<{
    id: string; slug: string; name: string; displayName: string
    primaryColor: string; tagline: string | null; logoUrl: string | null
    heroImageUrl: string | null; createdAt: Date
    orgCount: bigint
  }>>`
    SELECT g.id, g.slug, g.name, g."displayName", g."primaryColor",
           g.tagline, g."logoUrl", g."heroImageUrl", g."createdAt",
           COUNT(o.id) AS "orgCount"
    FROM gemeenten g
    LEFT JOIN organisations o ON o."gemeenteId" = g.id
    GROUP BY g.id
    ORDER BY g."displayName" ASC
  `

  return NextResponse.json(
    gemeenten.map((g) => ({ ...g, orgCount: Number(g.orgCount) }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!isAdmin(session)) return NextResponse.json({ error: "Geen toegang" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { slug, name, displayName, primaryColor, tagline, website, contactEmail } = parsed.data

  const existing = await prisma.gemeente.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: "Slug bestaat al" }, { status: 409 })

  const gemeente = await prisma.gemeente.create({
    data: { slug, name, displayName, primaryColor, tagline, website, contactEmail },
  })

  return NextResponse.json(gemeente, { status: 201 })
}
