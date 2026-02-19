import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMatchScore } from "@/lib/ai"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const vacancyId = searchParams.get("vacancyId")

  if (!vacancyId) {
    return NextResponse.json({ error: "vacancyId is verplicht" }, { status: 400 })
  }

  try {
    const [user, vacancy] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        select: { description: true, title: true },
      }),
    ])

    if (!user || !vacancy) {
      return NextResponse.json({ score: 50 })
    }

    const skillNames = user.skills.map((s) => s.skill.name).join(", ")
    const volunteerBio = [user.bio, skillNames ? `Vaardigheden: ${skillNames}` : ""]
      .filter(Boolean)
      .join(". ")

    const score = await generateMatchScore(
      volunteerBio || "Geen profiel beschikbaar",
      `${vacancy.title}: ${vacancy.description}`
    )

    return NextResponse.json({ score })
  } catch (error) {
    console.error("[MATCH_SCORE_ERROR]", error)
    return NextResponse.json({ score: 50 })
  }
}
