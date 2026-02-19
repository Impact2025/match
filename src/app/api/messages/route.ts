import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { messageSchema } from "@/validators"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get("conversationId")

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is verplicht" }, { status: 400 })
  }

  try {
    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    })

    // Update lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = messageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { conversationId } = body
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is verplicht" }, { status: 400 })
    }

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content: result.data.content,
        conversationId,
        senderId: session.user.id,
      },
      include: { sender: true },
    })

    // Trigger Pusher
    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "new-message",
      { message }
    )

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("[POST_MESSAGE_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
