import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/activities/[id]/registrations/[regId]
// Vrijwilliger: annuleren (status → CANCELLED)
// Org: status wijzigen (ATTENDED / ABSENT / REGISTERED)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  const { id, regId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { status } = body as { status: string }

  const registration = await prisma.activityRegistration.findUnique({
    where: { id: regId },
    include: { activity: { select: { organisationId: true } } },
  })
  if (!registration || registration.activityId !== id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  }

  // Vrijwilliger mag alleen eigen registratie annuleren
  if (status === "CANCELLED") {
    if (registration.volunteerId !== session.user.id) {
      // Org mag ook annuleren
      const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
      if (!org || org.id !== registration.activity.organisationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const updated = await prisma.activityRegistration.update({
      where: { id: regId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })

    // Eerste persoon van wachtlijst promoveren
    const waitlisted = await prisma.activityRegistration.findFirst({
      where: { activityId: id, status: "WAITLISTED" },
      orderBy: { registeredAt: "asc" },
    })
    if (waitlisted) {
      await prisma.activityRegistration.update({
        where: { id: waitlisted.id },
        data: { status: "REGISTERED" },
      })
    }

    return NextResponse.json(updated)
  }

  // Org-only statuswijzigingen (ATTENDED / ABSENT / REGISTERED / WAITLISTED)
  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org || org.id !== registration.activity.organisationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const data: Record<string, unknown> = { status }
  if (status === "ATTENDED" && !registration.checkedInAt) {
    data.checkedInAt = new Date()
  }

  const updated = await prisma.activityRegistration.update({ where: { id: regId }, data })
  return NextResponse.json(updated)
}
