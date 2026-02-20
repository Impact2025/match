import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Ongeldige status" }, { status: 400 })
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { organisation: { select: { adminId: true } } },
  })

  if (!invitation) {
    return NextResponse.json({ error: "Uitnodiging niet gevonden" }, { status: 404 })
  }

  // Only the volunteer can accept/decline
  if (invitation.volunteerId !== session.user.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Uitnodiging is al beantwoord" }, { status: 409 })
  }

  if (status === "DECLINED") {
    const updated = await prisma.invitation.update({
      where: { id },
      data: { status: "DECLINED" },
    })
    return NextResponse.json(updated)
  }

  // ACCEPTED: create a conversation between volunteer and org admin
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: invitation.volunteerId },
          { userId: invitation.organisation.adminId },
        ],
      },
      messages: {
        create: {
          senderId: invitation.organisation.adminId,
          content: invitation.message
            ? `Uitnodiging geaccepteerd! Origineel bericht van de organisatie:\n\n"${invitation.message}"`
            : "Je uitnodiging is geaccepteerd! Je kunt nu chatten.",
          type: "SYSTEM",
        },
      },
    },
  })

  const updated = await prisma.invitation.update({
    where: { id },
    data: { status: "ACCEPTED", conversationId: conversation.id },
  })

  return NextResponse.json({ ...updated, conversationId: conversation.id })
}
