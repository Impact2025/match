import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateIcebreaker } from "@/lib/ai"
import { pusherServer } from "@/lib/pusher"
import { sendMatchAcceptedEmail, sendMatchRejectedEmail } from "@/lib/email"

async function updateOrgSla(orgId: string) {
  const resolvedMatches = await prisma.match.findMany({
    where: {
      vacancy: { organisationId: orgId },
      status: { in: ["ACCEPTED", "REJECTED"] },
      startedAt: { not: null },
    },
    select: { createdAt: true, startedAt: true },
  })

  if (resolvedMatches.length === 0) return

  const totalHours = resolvedMatches.reduce((sum, m) => {
    const diffMs = (m.startedAt!.getTime() - m.createdAt.getTime())
    return sum + diffMs / (1000 * 60 * 60)
  }, 0)

  const avgResponseHours = totalHours / resolvedMatches.length
  // slaScore: 100 at <=24h, 0 at >=168h (7 days)
  const slaScore = Math.max(0, Math.min(100, Math.round(100 - ((avgResponseHours - 24) / 144) * 100)))

  await prisma.organisation.update({
    where: { id: orgId },
    data: { avgResponseHours, slaScore },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const user = session.user as { role?: string }
  if (user.role !== "ORGANISATION") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { status } = body

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Ongeldige status" }, { status: 400 })
    }

    // Verify ownership
    const org = await prisma.organisation.findUnique({
      where: { adminId: session.user.id },
    })

    if (!org) {
      return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        volunteer: true,
        vacancy: { include: { organisation: true } },
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match niet gevonden" }, { status: 404 })
    }

    if (match.vacancy.organisationId !== org.id) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        status,
        ...(status === "ACCEPTED" ? { startedAt: new Date() } : {}),
      },
    })

    // On ACCEPTED: create conversation + icebreaker
    if (status === "ACCEPTED") {
      const conversation = await prisma.conversation.create({
        data: {
          matchId: id,
          participants: {
            create: [
              { userId: match.volunteerId },
              { userId: session.user.id },
            ],
          },
        },
      })

      // Generate icebreaker
      try {
        const icebreakerText = await generateIcebreaker(
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name
        )

        // Find a system user or use the org admin as sender
        await prisma.message.create({
          data: {
            content: `✨ ${icebreakerText}`,
            type: "SYSTEM",
            conversationId: conversation.id,
            senderId: session.user.id,
          },
        })

        // Trigger Pusher
        await pusherServer.trigger(
          `private-conversation-${conversation.id}`,
          "new-message",
          { conversationId: conversation.id }
        )
      } catch (err) {
        console.error("[ICEBREAKER_ERROR]", err)
      }

      // Notify volunteer (non-blocking)
      if (match.volunteer.email) {
        sendMatchAcceptedEmail(
          match.volunteer.email,
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name,
          conversation.id
        ).catch((err) => console.error("[MATCH_ACCEPTED_EMAIL_ERROR]", err))
      }

      // Non-blocking SLA update
      updateOrgSla(org.id).catch((err) => console.error("[SLA_UPDATE_ERROR]", err))

      return NextResponse.json({ ...updated, conversationId: conversation.id })
    }

    // Notify volunteer on rejection (non-blocking)
    if (status === "REJECTED" && match.volunteer.email) {
      sendMatchRejectedEmail(
        match.volunteer.email,
        match.volunteer.name ?? "Vrijwilliger",
        match.vacancy.title,
        org.name
      ).catch((err) => console.error("[MATCH_REJECTED_EMAIL_ERROR]", err))
    }

    // Non-blocking SLA update
    updateOrgSla(org.id).catch((err) => console.error("[SLA_UPDATE_ERROR]", err))

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH_MATCH_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
