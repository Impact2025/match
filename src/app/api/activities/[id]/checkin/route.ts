import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/activities/[id]/checkin
// Vrijwilliger scant QR-code → self-check-in via qrToken
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { qrToken } = body as { qrToken?: string }

  // Zoek activiteit op via id óf qrToken
  const activity = await prisma.groupActivity.findFirst({
    where: { OR: [{ id }, { qrToken: qrToken ?? "" }] },
  })
  if (!activity) return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 })
  if (activity.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Activiteit is niet actief" }, { status: 400 })
  }

  const registration = await prisma.activityRegistration.findUnique({
    where: { activityId_volunteerId: { activityId: activity.id, volunteerId: session.user.id } },
  })

  if (!registration) {
    return NextResponse.json({ error: "Niet aangemeld voor deze activiteit" }, { status: 404 })
  }
  if (registration.status === "WAITLISTED") {
    return NextResponse.json({ error: "Je staat op de wachtlijst" }, { status: 400 })
  }
  if (registration.status === "CANCELLED") {
    return NextResponse.json({ error: "Je aanmelding is geannuleerd" }, { status: 400 })
  }
  if (registration.checkedInAt) {
    return NextResponse.json({ ok: true, alreadyCheckedIn: true, registration })
  }

  const updated = await prisma.activityRegistration.update({
    where: { id: registration.id },
    data: { checkedInAt: new Date(), status: "ATTENDED" },
  })

  return NextResponse.json({ ok: true, alreadyCheckedIn: false, registration: updated })
}
