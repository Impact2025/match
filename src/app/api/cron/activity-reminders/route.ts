import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendActivityReminderEmail } from "@/lib/email"

// GET /api/cron/activity-reminders
// Stuur 24u-herinneringen voor activiteiten die morgen beginnen.
// Aanroepen via bijv. Vercel Cron (dagelijks om 10:00).
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000) // 23u vanaf nu
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000) // 25u vanaf nu

  // Vind activiteiten die in het [23h, 25h] window starten
  const activities = await prisma.groupActivity.findMany({
    where: {
      status: "PUBLISHED",
      startDateTime: { gte: from, lte: to },
    },
    include: {
      organisation: { select: { name: true } },
      registrations: {
        where: {
          status: "REGISTERED",
          reminder24hSentAt: null,
        },
        include: {
          volunteer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  let sent = 0
  const errors: string[] = []

  for (const activity of activities) {
    for (const reg of activity.registrations) {
      if (!reg.volunteer.email) continue
      try {
        await sendActivityReminderEmail(
          reg.volunteer.email,
          reg.volunteer.name ?? "Vrijwilliger",
          activity.title,
          activity.startDateTime,
          activity.online,
          [activity.location, activity.address, activity.city].filter(Boolean).join(", ") || null,
          activity.meetUrl,
          activity.id,
        )
        await prisma.activityRegistration.update({
          where: { id: reg.id },
          data: { reminder24hSentAt: new Date() },
        })
        sent++
      } catch (err) {
        errors.push(`${reg.volunteer.email}: ${String(err)}`)
      }
    }
  }

  return NextResponse.json({
    ok: true,
    activitiesChecked: activities.length,
    remindersSent: sent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
