import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activitySchema } from "@/validators"
import { getCurrentGemeente } from "@/lib/gemeente"

// GET /api/activities — lijst activiteiten (publiek voor vrijwilligers, gefilterd op gemeente)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orgOnly = searchParams.get("orgOnly") === "true"
  const upcoming = searchParams.get("upcoming") !== "false" // default: aankomende
  const type = searchParams.get("type") ?? undefined
  const take = Math.min(Number(searchParams.get("take") ?? 50), 100)
  const skip = Number(searchParams.get("skip") ?? 0)

  const session = await auth()
  const gemeente = await getCurrentGemeente()

  // Org-only: alleen eigen activiteiten van ingelogde org-admin
  if (orgOnly) {
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
    if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

    const activities = await prisma.groupActivity.findMany({
      where: { organisationId: org.id },
      include: {
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        _count: { select: { registrations: true } },
        registrations: {
          where: { status: { in: ["REGISTERED", "WAITLISTED", "ATTENDED"] } },
          select: { status: true },
        },
      },
      orderBy: { startDateTime: "asc" },
    })
    return NextResponse.json(activities)
  }

  // Publiek / vrijwilliger: gepubliceerde activiteiten, optioneel gemeente-gefilterd
  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    ...(upcoming ? { startDateTime: { gte: new Date() } } : {}),
    ...(type ? { type } : {}),
  }

  // Gemeente filter: zoek id op via slug
  if (gemeente) {
    const gemeenteRecord = await prisma.gemeente.findUnique({
      where: { slug: gemeente.slug },
      select: { id: true },
    })
    if (gemeenteRecord) (where as Record<string, unknown>).gemeenteId = gemeenteRecord.id
    else delete (where as Record<string, unknown>).gemeenteId
  }

  const [activities, total] = await Promise.all([
    prisma.groupActivity.findMany({
      where,
      include: {
        organisation: { select: { id: true, name: true, logo: true, slug: true } },
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        _count: { select: { registrations: true } },
        registrations: {
          where: { status: { in: ["REGISTERED", "WAITLISTED"] } },
          select: { status: true },
        },
      },
      orderBy: { startDateTime: "asc" },
      take,
      skip,
    }),
    prisma.groupActivity.count({ where }),
  ])

  return NextResponse.json({ activities, total })
}

// POST /api/activities — aanmaken (alleen org-admin)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

  const body = await req.json()
  const parsed = activitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    title, description, type, startDateTime, endDateTime,
    online, meetUrl, location, address, city, postcode,
    maxCapacity, waitlistEnabled, imageUrl,
    skills, categories,
  } = parsed.data

  // Geocode postcode → lat/lon
  let lat: number | null = null
  let lon: number | null = null
  if (!online && postcode) {
    try {
      const geo = await fetch(
        `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/geocode?postcode=${encodeURIComponent(postcode)}`
      )
      if (geo.ok) {
        const geoData = await geo.json()
        lat = geoData.lat ?? null
        lon = geoData.lon ?? null
      }
    } catch { /* geocode is best-effort */ }
  }

  // Upsert skills en categories
  const skillRecords = await Promise.all(
    skills.map((name) => prisma.skill.upsert({ where: { name }, update: {}, create: { name } }))
  )
  const categoryRecords = await Promise.all(
    categories.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } }))
  )

  const activity = await prisma.groupActivity.create({
    data: {
      title,
      description,
      type,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      online,
      meetUrl: online ? (meetUrl || null) : null,
      location: location || null,
      address: address || null,
      city: city || null,
      postcode: postcode || null,
      lat,
      lon,
      maxCapacity: maxCapacity ?? null,
      waitlistEnabled,
      imageUrl: imageUrl ?? null,
      organisationId: org.id,
      gemeenteId: org.gemeenteId ?? null,
      skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
      categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
    },
    include: {
      categories: { include: { category: true } },
      skills: { include: { skill: true } },
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
