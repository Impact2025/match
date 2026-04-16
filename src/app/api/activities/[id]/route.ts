import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { activitySchema } from "@/validators"

async function getOrgForUser(userId: string) {
  return prisma.organisation.findUnique({ where: { adminId: userId } })
}

// GET /api/activities/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const activity = await prisma.groupActivity.findUnique({
    where: { id },
    include: {
      organisation: { select: { id: true, name: true, logo: true, slug: true, city: true } },
      categories: { include: { category: true } },
      skills: { include: { skill: true } },
      registrations: {
        include: { volunteer: { select: { id: true, name: true, image: true } } },
        orderBy: { registeredAt: "asc" },
      },
    },
  })

  if (!activity) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  return NextResponse.json(activity)
}

// PATCH /api/activities/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await getOrgForUser(session.user.id)
  if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

  const activity = await prisma.groupActivity.findUnique({ where: { id } })
  if (!activity) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  if (activity.organisationId !== org.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  // Statuswijziging (publish/cancel/complete) afzonderlijk afhandelen
  if (body.status !== undefined && Object.keys(body).length === 1) {
    const updated = await prisma.groupActivity.update({
      where: { id },
      data: { status: body.status },
    })
    return NextResponse.json(updated)
  }

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

  const skillRecords = await Promise.all(
    skills.map((name) => prisma.skill.upsert({ where: { name }, update: {}, create: { name } }))
  )
  const categoryRecords = await Promise.all(
    categories.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } }))
  )

  const updated = await prisma.groupActivity.update({
    where: { id },
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
      maxCapacity: maxCapacity ?? null,
      waitlistEnabled,
      imageUrl: imageUrl ?? null,
      skills: {
        deleteMany: {},
        create: skillRecords.map((s) => ({ skillId: s.id })),
      },
      categories: {
        deleteMany: {},
        create: categoryRecords.map((c) => ({ categoryId: c.id })),
      },
    },
    include: {
      categories: { include: { category: true } },
      skills: { include: { skill: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/activities/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await getOrgForUser(session.user.id)
  if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

  const activity = await prisma.groupActivity.findUnique({ where: { id } })
  if (!activity) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  if (activity.organisationId !== org.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.groupActivity.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
