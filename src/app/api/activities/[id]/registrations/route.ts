import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/activities/[id]/registrations — org ziet alle aanmeldingen
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const activity = await prisma.groupActivity.findUnique({ where: { id } })
  if (!activity || activity.organisationId !== org.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  }

  const registrations = await prisma.activityRegistration.findMany({
    where: { activityId: id },
    include: {
      volunteer: { select: { id: true, name: true, image: true, email: true, postcode: true } },
    },
    orderBy: [{ status: "asc" }, { registeredAt: "asc" }],
  })

  return NextResponse.json(registrations)
}

// POST /api/activities/[id]/registrations — vrijwilliger meldt zich aan
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const activity = await prisma.groupActivity.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: { in: ["REGISTERED", "WAITLISTED"] } },
        select: { id: true },
      },
    },
  })

  if (!activity) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  if (activity.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Activiteit is niet beschikbaar" }, { status: 400 })
  }

  // Check: al aangemeld?
  const existing = await prisma.activityRegistration.findUnique({
    where: { activityId_volunteerId: { activityId: id, volunteerId: session.user.id } },
  })
  if (existing) {
    if (existing.status === "CANCELLED") {
      // Opnieuw aanmelden na annulering
    } else {
      return NextResponse.json({ error: "Al aangemeld" }, { status: 409 })
    }
  }

  // Bepaal status: REGISTERED of WAITLISTED
  const activeCount = activity.registrations.length
  const isFull = activity.maxCapacity !== null && activeCount >= activity.maxCapacity
  const registrationStatus =
    isFull && activity.waitlistEnabled ? "WAITLISTED" : isFull ? null : "REGISTERED"

  if (registrationStatus === null) {
    return NextResponse.json({ error: "Activiteit is vol en heeft geen wachtlijst" }, { status: 400 })
  }

  const registration = existing
    ? await prisma.activityRegistration.update({
        where: { id: existing.id },
        data: { status: registrationStatus, registeredAt: new Date(), cancelledAt: null },
      })
    : await prisma.activityRegistration.create({
        data: { activityId: id, volunteerId: session.user.id, status: registrationStatus },
      })

  return NextResponse.json(registration, { status: 201 })
}
