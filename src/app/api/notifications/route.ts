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
    const rows = await prisma.$queryRaw<
      Array<{
        id: string
        type: string
        title: string
        body: string
        link: string | null
        read: boolean
        createdAt: Date
      }>
    >`
      SELECT id, type, title, body, link, read, created_at as "createdAt"
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `

    const unread = rows.filter((n) => !n.read).length

    return NextResponse.json({
      notifications: rows.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
      unread,
    })
  } catch (err) {
    console.error("[GET_NOTIFICATIONS_ERROR]", err)
    return NextResponse.json({ notifications: [], unread: 0 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const body = await req.json()

    if (body.action === "read-all") {
      await prisma.$executeRaw`
        UPDATE notifications SET read = true WHERE user_id = ${userId} AND read = false
      `
    } else if (body.id) {
      await prisma.$executeRaw`
        UPDATE notifications SET read = true WHERE id = ${body.id} AND user_id = ${userId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PATCH_NOTIFICATIONS_ERROR]", err)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
