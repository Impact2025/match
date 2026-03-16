import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function isAdmin(session: any) {
  const role = session?.user?.role
  return session && (role === "ADMIN" || role === "GEMEENTE_ADMIN")
}

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  displayName: z.string().min(2).max(80).optional(),
  tagline: z.string().max(200).optional().nullable(),
  website: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  welcomeTitle: z.string().max(120).optional().nullable(),
  welcomeMessage: z.string().max(2000).optional().nullable(),
  contactPhone: z.string().max(30).optional().nullable(),
  contactAddress: z.string().max(300).optional().nullable(),
  socialLinks: z.object({
    facebook: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
  }).optional().nullable(),
  emailSignature: z.string().max(1000).optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!isAdmin(session)) return NextResponse.json({ error: "Geen toegang" }, { status: 403 })

  const { slug } = await params
  const gemeente = await prisma.gemeente.findUnique({ where: { slug } })
  if (!gemeente) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })

  return NextResponse.json(gemeente)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!isAdmin(session)) return NextResponse.json({ error: "Geen toegang" }, { status: 403 })

  const { slug } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const gemeente = await prisma.gemeente.findUnique({ where: { slug } })
  if (!gemeente) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })

  // Use raw SQL to handle new columns that may not be in the Prisma client yet
  const data = parsed.data
  await prisma.$executeRawUnsafe(`
    UPDATE gemeenten SET
      name = $1,
      "displayName" = $2,
      tagline = $3,
      website = $4,
      "contactEmail" = $5,
      "primaryColor" = $6,
      "accentColor" = $7,
      "logoUrl" = $8,
      "heroImageUrl" = $9,
      "faviconUrl" = $10,
      "welcomeTitle" = $11,
      "welcomeMessage" = $12,
      "contactPhone" = $13,
      "contactAddress" = $14,
      "socialLinks" = $15::jsonb,
      "emailSignature" = $16,
      "updatedAt" = NOW()
    WHERE slug = $17
  `,
    data.name ?? gemeente.name,
    data.displayName ?? gemeente.displayName,
    data.tagline !== undefined ? data.tagline : gemeente.tagline,
    data.website !== undefined ? data.website : gemeente.website,
    data.contactEmail !== undefined ? data.contactEmail : gemeente.contactEmail,
    data.primaryColor ?? gemeente.primaryColor,
    data.accentColor !== undefined ? data.accentColor : null,
    data.logoUrl !== undefined ? data.logoUrl : gemeente.logoUrl,
    data.heroImageUrl !== undefined ? data.heroImageUrl : null,
    data.faviconUrl !== undefined ? data.faviconUrl : null,
    data.welcomeTitle !== undefined ? data.welcomeTitle : null,
    data.welcomeMessage !== undefined ? data.welcomeMessage : null,
    data.contactPhone !== undefined ? data.contactPhone : null,
    data.contactAddress !== undefined ? data.contactAddress : null,
    data.socialLinks !== undefined ? JSON.stringify(data.socialLinks) : null,
    data.emailSignature !== undefined ? data.emailSignature : null,
    slug,
  )

  return NextResponse.json({ ok: true })
}
