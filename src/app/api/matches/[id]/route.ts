import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateIcebreaker } from "@/lib/ai"
import { pusherServer } from "@/lib/pusher"
import {
  sendMatchAcceptedEmail,
  sendMatchRejectedEmail,
  sendPlacementConfirmedEmail,
} from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { getCurrentGemeente } from "@/lib/gemeente"

async function updateOrgSla(orgId: string) {
  const resolvedMatches = await prisma.match.findMany({
    where: {
      vacancy: { organisationId: orgId },
      status: { in: ["ACCEPTED", "REJECTED", "CONFIRMED", "COMPLETED"] },
      startedAt: { not: null },
    },
    select: { createdAt: true, startedAt: true },
  })

  if (resolvedMatches.length === 0) return

  const totalHours = resolvedMatches.reduce((sum, m) => {
    const diffMs = m.startedAt!.getTime() - m.createdAt.getTime()
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

    if (!["ACCEPTED", "CONFIRMED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Ongeldige status" }, { status: 400 })
    }

    // Resolve gemeente branding for emails (non-blocking)
    const gemeente = await getCurrentGemeente()
    const emailBrand = gemeente
      ? { primaryColor: gemeente.primaryColor, accentColor: gemeente.accentColor ?? gemeente.primaryColor, name: gemeente.name, emailSignature: gemeente.emailSignature }
      : undefined

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
        conversation: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match niet gevonden" }, { status: 404 })
    }

    if (match.vacancy.organisationId !== org.id) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    // State transition guards
    if (status === "CONFIRMED" && match.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Alleen geaccepteerde matches kunnen worden bevestigd" },
        { status: 400 }
      )
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        status,
        ...(status === "ACCEPTED" ? { startedAt: new Date() } : {}),
        ...(status === "CONFIRMED" ? { confirmedAt: new Date() } : {}),
      },
    })

    // ── ACCEPTED: open conversation + icebreaker ──────────────────────────
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

      try {
        const icebreakerText = await generateIcebreaker(
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name
        )
        await prisma.message.create({
          data: {
            content: `✨ ${icebreakerText}`,
            type: "SYSTEM",
            conversationId: conversation.id,
            senderId: session.user.id,
          },
        })
        await pusherServer.trigger(
          `private-conversation-${conversation.id}`,
          "new-message",
          { conversationId: conversation.id }
        )
      } catch (err) {
        console.error("[ICEBREAKER_ERROR]", err)
      }

      if (match.volunteer.email) {
        sendMatchAcceptedEmail(
          match.volunteer.email,
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name,
          conversation.id,
          emailBrand
        ).catch((err) => console.error("[MATCH_ACCEPTED_EMAIL_ERROR]", err))
      }

      createNotification({
        userId: match.volunteerId,
        type: "MATCH_ACCEPTED",
        title: "Match geaccepteerd!",
        body: `${org.name} wil je ontmoeten voor "${match.vacancy.title}". Bekijk het gesprek.`,
        link: `/chat`,
      }).catch((err) => console.error("[NOTIFICATION_ERROR]", err))

      updateOrgSla(org.id).catch((err) => console.error("[SLA_UPDATE_ERROR]", err))

      return NextResponse.json({ ...updated, conversationId: conversation.id })
    }

    // ── CONFIRMED: placement confirmed, volunteer is active ───────────────
    if (status === "CONFIRMED") {
      if (match.volunteer.email) {
        sendPlacementConfirmedEmail(
          match.volunteer.email,
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name,
          emailBrand
        ).catch((err) => console.error("[PLACEMENT_CONFIRMED_EMAIL_ERROR]", err))
      }

      createNotification({
        userId: match.volunteerId,
        type: "MATCH_ACCEPTED",
        title: "Je bent officieel geplaatst! 🎉",
        body: `${org.name} heeft bevestigd dat jij van start gaat bij "${match.vacancy.title}".`,
        link: `/matches`,
      }).catch((err) => console.error("[NOTIFICATION_ERROR]", err))

      return NextResponse.json(updated)
    }

    // ── REJECTED ──────────────────────────────────────────────────────────
    if (status === "REJECTED") {
      if (match.volunteer.email) {
        sendMatchRejectedEmail(
          match.volunteer.email,
          match.volunteer.name ?? "Vrijwilliger",
          match.vacancy.title,
          org.name,
          emailBrand
        ).catch((err) => console.error("[MATCH_REJECTED_EMAIL_ERROR]", err))
      }
      createNotification({
        userId: match.volunteerId,
        type: "MATCH_REJECTED",
        title: "Match helaas niet doorgegaan",
        body: `${org.name} heeft je aanmelding voor "${match.vacancy.title}" niet kunnen accepteren.`,
        link: "/swipe",
      }).catch((err) => console.error("[NOTIFICATION_ERROR]", err))

      updateOrgSla(org.id).catch((err) => console.error("[SLA_UPDATE_ERROR]", err))
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH_MATCH_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
