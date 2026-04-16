import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { RegistrationStatus } from "@prisma/client"

// PATCH /api/activities/[id]/attendance
// Bulk-update aanwezigheidsstatus door org
// body: { updates: [{ regId, status }] } of { markAllPresent: true }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const activity = await prisma.groupActivity.findUnique({ where: { id } })
  if (!activity || activity.organisationId !== org.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  }

  const body = await req.json()

  // Bulk "alle aangemelden → ATTENDED"
  if (body.markAllPresent) {
    await prisma.activityRegistration.updateMany({
      where: { activityId: id, status: "REGISTERED" },
      data: { status: "ATTENDED", checkedInAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  // Individuele updates
  const updates = body.updates as { regId: string; status: RegistrationStatus }[]
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Ongeldige payload" }, { status: 400 })
  }

  await Promise.all(
    updates.map(({ regId, status }) =>
      prisma.activityRegistration.update({
        where: { id: regId },
        data: {
          status,
          ...(status === "ATTENDED" ? { checkedInAt: new Date() } : {}),
        },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
