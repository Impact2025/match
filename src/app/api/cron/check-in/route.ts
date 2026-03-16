export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendCheckInEmail, sendConfirmationReminderEmail } from "@/lib/email"

const DAY_MS = 1000 * 60 * 60 * 24

export async function GET(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const now = Date.now()
  let checkInsSent = 0
  let remindersSent = 0

  // ── 1. Check-ins voor CONFIRMED matches (timed from confirmedAt) ──────────
  const confirmedMatches = await prisma.match.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      confirmedAt: { not: null },
    },
    include: {
      volunteer: { select: { email: true, name: true } },
      vacancy: { select: { title: true, organisation: { select: { name: true } } } },
    },
  })

  const checkIns: Array<{
    week: 1 | 4 | 12
    threshold: number
    sentField: "checkIn1SentAt" | "checkIn4SentAt" | "checkIn12SentAt"
  }> = [
    { week: 1,  threshold: 7,  sentField: "checkIn1SentAt" },
    { week: 4,  threshold: 28, sentField: "checkIn4SentAt" },
    { week: 12, threshold: 84, sentField: "checkIn12SentAt" },
  ]

  for (const match of confirmedMatches) {
    if (!match.confirmedAt || !match.volunteer.email) continue

    const elapsedDays = (now - new Date(match.confirmedAt).getTime()) / DAY_MS
    const to = match.volunteer.email
    const volunteerName = match.volunteer.name ?? "Vrijwilliger"
    const vacancyTitle = match.vacancy.title
    const orgName = match.vacancy.organisation.name

    for (const ci of checkIns) {
      if (elapsedDays >= ci.threshold && !match[ci.sentField]) {
        await sendCheckInEmail(to, volunteerName, vacancyTitle, orgName, ci.week)
          .then(async () => {
            await prisma.match.update({
              where: { id: match.id },
              data: { [ci.sentField]: new Date() },
            })
            checkInsSent++
          })
          .catch((err) => console.error(`[CHECKIN_EMAIL_ERROR] match ${match.id} week ${ci.week}`, err))
      }
    }
  }

  // ── 2. Reminders naar org voor stale ACCEPTED matches (14d en 28d) ────────
  const acceptedMatches = await prisma.match.findMany({
    where: {
      status: "ACCEPTED",
      startedAt: { not: null },
    },
    include: {
      volunteer: { select: { name: true } },
      vacancy: {
        select: {
          title: true,
          organisation: {
            select: { name: true, admin: { select: { email: true } } },
          },
        },
      },
    },
  })

  for (const match of acceptedMatches) {
    if (!match.startedAt) continue
    const orgEmail = match.vacancy.organisation.admin?.email
    if (!orgEmail) continue

    const daysSince = Math.floor((now - new Date(match.startedAt).getTime()) / DAY_MS)
    const volunteerName = match.volunteer.name ?? "Vrijwilliger"
    const vacancyTitle = match.vacancy.title
    const orgName = match.vacancy.organisation.name

    const send28 = daysSince >= 28 && !(match as any).reminder28SentAt
    const send14 = daysSince >= 14 && !(match as any).reminder14SentAt && !send28

    if (send14 || send28) {
      const field = send28 ? "reminder28SentAt" : "reminder14SentAt"
      await sendConfirmationReminderEmail(orgEmail, orgName, volunteerName, vacancyTitle, match.id, daysSince)
        .then(async () => {
          await prisma.$executeRawUnsafe(
            `UPDATE matches SET "${field}" = NOW() WHERE id = $1`,
            match.id
          )
          remindersSent++
        })
        .catch((err) => console.error(`[REMINDER_${send28 ? 28 : 14}_ERROR] match ${match.id}`, err))
    }
  }

  return NextResponse.json({ checkInsSent, remindersSent })
}
