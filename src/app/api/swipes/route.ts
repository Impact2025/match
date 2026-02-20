import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendMatchNotificationOrgEmail } from "@/lib/email"
import { MATCH_REASONS } from "@/validators"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  if (searchParams.get("count") === "today") {
    const fromId = session.user.id
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayCount = await prisma.swipe.count({
      where: { fromId, createdAt: { gte: startOfToday } },
    })
    return NextResponse.json({ todayCount })
  }

  return NextResponse.json({ error: "Ongeldige query" }, { status: 400 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const { vacancyId } = await req.json()
    if (!vacancyId) return NextResponse.json({ error: "vacancyId vereist" }, { status: 400 })

    const fromId = session.user.id

    // Delete swipe
    await prisma.swipe.delete({
      where: { fromId_vacancyId: { fromId, vacancyId } },
    })

    // Delete associated match (if any)
    await prisma.match.deleteMany({
      where: { volunteerId: fromId, vacancyId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[UNDO_SWIPE_ERROR]", error)
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
    const { vacancyId, direction, matchReason, scoreSnapshot } = body

    if (!vacancyId || !["LIKE", "DISLIKE", "SUPER_LIKE"].includes(direction)) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 })
    }

    // Validate matchReason for likes
    if ((direction === "LIKE" || direction === "SUPER_LIKE") && !MATCH_REASONS.includes(matchReason)) {
      return NextResponse.json({ error: "Reden is verplicht bij een like" }, { status: 400 })
    }

    const fromId = session.user.id

    // Create swipe (@@unique prevents duplicates gracefully)
    await prisma.swipe.upsert({
      where: { fromId_vacancyId: { fromId, vacancyId } },
      update: { direction, matchReason: matchReason ?? null },
      create: { fromId, vacancyId, direction, matchReason: matchReason ?? null },
    })

    // Persist match score snapshot for RL analytics (raw SQL — client pending regen)
    if (scoreSnapshot && typeof scoreSnapshot === "object") {
      await prisma.$executeRaw`
        UPDATE swipes SET score_snapshot = ${JSON.stringify(scoreSnapshot)}::text
        WHERE from_id = ${fromId} AND vacancy_id = ${vacancyId}
      `
    }

    // Create match on LIKE or SUPER_LIKE
    let matched = false
    let matchId: string | undefined

    if (direction === "LIKE" || direction === "SUPER_LIKE") {
      const match = await prisma.match.upsert({
        where: { volunteerId_vacancyId: { volunteerId: fromId, vacancyId } },
        update: {},
        create: {
          volunteerId: fromId,
          vacancyId,
          status: "PENDING",
        },
      })
      matched = true
      matchId = match.id

      // Notify org admin (non-blocking)
      prisma.vacancy
        .findUnique({
          where: { id: vacancyId },
          include: { organisation: { include: { admin: true } } },
        })
        .then((vacancy) => {
          if (!vacancy?.organisation?.admin?.email) return
          const volunteer = session.user as { name?: string | null }
          sendMatchNotificationOrgEmail(
            vacancy.organisation.admin.email,
            vacancy.organisation.name,
            volunteer.name ?? "Een vrijwilliger",
            vacancy.title,
            match.id
          ).catch((err) => console.error("[MATCH_ORG_EMAIL_ERROR]", err))
        })
        .catch((err) => console.error("[SWIPE_ORG_LOOKUP_ERROR]", err))
    }

    // Streak logic
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const userStreak = await prisma.user.findUnique({
      where: { id: fromId },
      select: { lastActiveDate: true, streakDays: true },
    })

    let newStreak = userStreak?.streakDays ?? 0
    if (userStreak?.lastActiveDate) {
      const last = new Date(userStreak.lastActiveDate)
      const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate())
      const diffMs = startOfToday.getTime() - startOfLast.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 0) {
        // same day — no change
      } else if (diffDays === 1) {
        newStreak = (userStreak.streakDays ?? 0) + 1
      } else {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await prisma.user.update({
      where: { id: fromId },
      data: { lastActiveDate: now, streakDays: newStreak },
    })

    // Count today's swipes
    const todaySwipeCount = await prisma.swipe.count({
      where: {
        fromId,
        createdAt: { gte: startOfToday },
      },
    })

    return NextResponse.json({ matched, matchId, streakDays: newStreak, todaySwipeCount })
  } catch (error) {
    console.error("[SWIPE_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
