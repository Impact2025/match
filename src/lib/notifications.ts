import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export type NotificationType =
  | "NEW_MATCH"
  | "MATCH_ACCEPTED"
  | "MATCH_REJECTED"
  | "NEW_INVITATION"
  | "INVITATION_ACCEPTED"
  | "NEW_MESSAGE"

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
}) {
  try {
    // Raw SQL: Notification model may not be in local Prisma client yet
    await prisma.$executeRawUnsafe(
      `INSERT INTO notifications (id, user_id, type, title, body, link, read, created_at)
       VALUES (gen_random_uuid()::text, $1, $2::"NotificationType", $3, $4, $5, false, now())`,
      userId,
      type,
      title,
      body,
      link ?? null
    )

    // Real-time push
    pusherServer
      .trigger(`private-user-${userId}`, "notification", { type, title, body, link })
      .catch((err) => console.error("[PUSHER_NOTIFICATION_ERROR]", err))
  } catch (err) {
    console.error("[CREATE_NOTIFICATION_ERROR]", err)
  }
}
