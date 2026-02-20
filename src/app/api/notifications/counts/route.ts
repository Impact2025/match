import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Count conversations where latest message is newer than lastReadAt
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: {
        lastReadAt: true,
        conversation: {
          select: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true, senderId: true },
            },
          },
        },
      },
    })

    const unreadMessages = participations.filter(({ lastReadAt, conversation }) => {
      const lastMsg = conversation.messages[0]
      if (!lastMsg) return false
      if (lastMsg.senderId === userId) return false
      if (!lastReadAt) return true
      return lastMsg.createdAt > lastReadAt
    }).length

    // Determine role
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    let pendingItems = 0

    if (dbUser?.role === "VOLUNTEER") {
      const [pendingMatches, pendingInvitations] = await Promise.all([
        prisma.match.count({ where: { volunteerId: userId, status: "PENDING" } }),
        prisma.invitation.count({ where: { volunteerId: userId, status: "PENDING" } }),
      ])
      pendingItems = pendingMatches + pendingInvitations
    } else if (dbUser?.role === "ORGANISATION") {
      const org = await prisma.organisation.findUnique({
        where: { adminId: userId },
        select: { id: true },
      })
      if (org) {
        pendingItems = await prisma.match.count({
          where: {
            vacancy: { organisationId: org.id },
            status: "PENDING",
          },
        })
      }
    }

    return NextResponse.json({ unreadMessages, pendingItems })
  } catch (error) {
    console.error("[NOTIFICATION_COUNTS_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
