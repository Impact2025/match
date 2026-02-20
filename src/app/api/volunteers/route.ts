import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateMatchScore } from "@/lib/matching/scoring-engine"
import { getScoringWeights } from "@/lib/matching/weights"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  // Only organisations can search volunteers
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (dbUser?.role !== "ORGANISATION") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
    select: { id: true },
  })
  if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? []
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? []
  const city = searchParams.get("city") ?? ""
  const vacancyId = searchParams.get("vacancyId")

  const volunteers = await prisma.user.findMany({
    where: {
      role: "VOLUNTEER",
      status: "ACTIVE",
      onboarded: true,
      openToInvitations: true,
      ...(skills.length > 0 && {
        skills: { some: { skill: { name: { in: skills } } } },
      }),
      ...(categories.length > 0 && {
        interests: { some: { category: { name: { in: categories } } } },
      }),
      ...(city && {
        location: { contains: city, mode: "insensitive" },
      }),
    },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      postcode: true,
      age: true,
      availability: true,
      maxDistance: true,
      lat: true,
      lon: true,
      motivationProfile: true,
      schwartzProfile: true,
      skills: { select: { skill: { select: { name: true } } } },
      interests: { select: { category: { select: { name: true } } } },
      // Check if already invited by this org
      receivedInvitations: {
        where: { organisationId: org.id },
        select: { id: true, status: true, vacancyId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // If a specific vacancy is requested, compute match scores and rank
  if (vacancyId) {
    const scoringWeights = await getScoringWeights()
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
        _count: { select: { swipes: true } },
      },
    })

    if (!vacancy || vacancy.organisationId !== org.id) {
      // vacancy not found or doesn't belong to this org — return unranked
      return NextResponse.json(volunteers.map((v) => ({ ...v, matchScore: null })))
    }

    const vacancySkillNames = vacancy.skills.map((s) => s.skill.name)
    const vacancyCategoryNames = vacancy.categories.map((c) => c.category.name)

    const scored = volunteers.map((v) => {
      const matchScore = calculateMatchScore({
        volunteerVFIJson: v.motivationProfile ?? null,
        volunteerSchwartzJson: v.schwartzProfile ?? null,
        volunteerInterests: v.interests.map((i) => i.category.name),
        volunteerSkills: v.skills.map((s) => s.skill.name),
        volunteerLat: v.lat,
        volunteerLon: v.lon,
        volunteerMaxDistance: v.maxDistance ?? 25,
        vacancyCategories: vacancyCategoryNames,
        vacancySkills: vacancySkillNames,
        vacancyLat: vacancy.lat,
        vacancyLon: vacancy.lon,
        vacancyRemote: vacancy.remote,
        vacancyCreatedAt: vacancy.createdAt,
        orgTotalSwipes: vacancy._count.swipes,
      }, scoringWeights)

      // Strip internal fields before returning
      const { motivationProfile, schwartzProfile, lat, lon, ...rest } = v
      return { ...rest, matchScore }
    })

    return NextResponse.json(
      scored.sort((a, b) => b.matchScore.total - a.matchScore.total)
    )
  }

  // No vacancy selected — return without match scores
  const result = volunteers.map(({ motivationProfile, schwartzProfile, lat, lon, ...rest }) => ({
    ...rest,
    matchScore: null,
  }))

  return NextResponse.json(result)
}
