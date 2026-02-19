export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendCheckInEmail } from "@/lib/email"

const DAY_MS = 1000 * 60 * 60 * 24

export async function GET(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const acceptedMatches = await prisma.match.findMany({
    where: {
      status: "ACCEPTED",
      startedAt: { not: null },
    },
    include: {
      volunteer: { select: { email: true, name: true } },
      vacancy: { select: { title: true, organisation: { select: { name: true } } } },
    },
  })

  let processed = 0
  let sent = 0
  const now = Date.now()

  for (const match of acceptedMatches) {
    if (!match.startedAt || !match.volunteer.email) continue
    processed++

    const startedMs = new Date(match.startedAt).getTime()
    const elapsedDays = (now - startedMs) / DAY_MS

    const volunteerName = match.volunteer.name ?? "Vrijwilliger"
    const vacancyTitle = match.vacancy.title
    const orgName = match.vacancy.organisation.name
    const to = match.volunteer.email

    const checkIns: Array<{ week: 1 | 4 | 12; threshold: number; sentField: "checkIn1SentAt" | "checkIn4SentAt" | "checkIn12SentAt" }> = [
      { week: 1, threshold: 7, sentField: "checkIn1SentAt" },
      { week: 4, threshold: 28, sentField: "checkIn4SentAt" },
      { week: 12, threshold: 84, sentField: "checkIn12SentAt" },
    ]

    for (const ci of checkIns) {
      if (elapsedDays >= ci.threshold && !match[ci.sentField]) {
        await sendCheckInEmail(to, volunteerName, vacancyTitle, orgName, ci.week)
          .then(async () => {
            await prisma.match.update({
              where: { id: match.id },
              data: { [ci.sentField]: new Date() },
            })
            sent++
          })
          .catch((err) => console.error(`[CHECKIN_EMAIL_ERROR] match ${match.id} week ${ci.week}`, err))
      }
    }
  }

  return NextResponse.json({ processed, sent })
}
