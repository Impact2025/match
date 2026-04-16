import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(2000).nullable().optional(),
})

// POST /api/activities/[id]/registrations/[regId]/feedback
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  const { id, regId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 })

  const registration = await prisma.activityRegistration.findUnique({
    where: { id: regId },
    select: { id: true, volunteerId: true, activityId: true, status: true, feedback: true },
  })

  if (!registration || registration.activityId !== id)
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  if (registration.volunteerId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (registration.status !== "ATTENDED")
    return NextResponse.json({ error: "Feedback alleen mogelijk na bijwonen" }, { status: 400 })
  if (registration.feedback)
    return NextResponse.json({ error: "Feedback al ingevuld" }, { status: 409 })

  const updated = await prisma.activityRegistration.update({
    where: { id: regId },
    data: {
      rating: parsed.data.rating,
      feedback: parsed.data.feedback ?? null,
    },
  })

  return NextResponse.json(updated)
}
