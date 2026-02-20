import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { vacancySchema } from "@/validators"
import { geocodePostcode, haversineDistance } from "@/lib/geocoding"
import { calculateMatchScore } from "@/lib/matching/scoring-engine"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const take = parseInt(searchParams.get("take") ?? "10")

    // Exclude already-swiped vacancies
    const swipedIds = await prisma.swipe
      .findMany({
        where: { fromId: session.user.id },
        select: { vacancyId: true },
      })
      .then((s) => s.map((sw) => sw.vacancyId))

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        lat: true,
        lon: true,
        maxDistance: true,
        motivationProfile: true,
        interests: { select: { category: { select: { name: true } } } },
        skills: { select: { skill: { select: { name: true } } } },
      },
    })

    const vacancies = await prisma.vacancy.findMany({
      where: {
        status: "ACTIVE",
        organisation: { status: "APPROVED" },
        ...(swipedIds.length > 0 ? { id: { notIn: swipedIds } } : {}),
      },
      include: {
        organisation: true,
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
        _count: { select: { swipes: true } },
      },
      take: take * 4, // fetch extra to account for distance filtering
      orderBy: { createdAt: "desc" },
    })

    const maxDistance = currentUser?.maxDistance ?? 25
    const userInterests = new Set((currentUser?.interests ?? []).map((i) => i.category.name))

    const withDistance = vacancies.map((v) => {
      let distanceKm: number | null = null
      if (v.remote) {
        distanceKm = 0
      } else if (currentUser?.lat && currentUser?.lon && v.lat && v.lon) {
        distanceKm = Math.round(haversineDistance(currentUser.lat, currentUser.lon, v.lat, v.lon))
      }
      return { ...v, distanceKm }
    })

    const filtered = withDistance.filter((v) => {
      if (v.remote) return true
      if (v.distanceKm === null) return true
      return v.distanceKm <= maxDistance
    })

    const volunteerSkillNames = (currentUser?.skills ?? []).map((s) => s.skill.name)
    const volunteerInterestNames = [...userInterests]

    const scored = filtered.map((v) => {
      const matchScore = calculateMatchScore({
        // Volunteer
        volunteerVFIJson: currentUser?.motivationProfile ?? null,
        volunteerInterests: volunteerInterestNames,
        volunteerSkills: volunteerSkillNames,
        volunteerLat: currentUser?.lat,
        volunteerLon: currentUser?.lon,
        volunteerMaxDistance: maxDistance,
        // Vacancy
        vacancyCategories: v.categories.map((c) => c.category.name),
        vacancySkills: v.skills.map((s) => s.skill.name),
        vacancyLat: v.lat,
        vacancyLon: v.lon,
        vacancyRemote: v.remote,
        vacancyCreatedAt: v.createdAt,
        // Organisation
        orgTotalSwipes: v._count.swipes,
      })

      return { ...v, distanceKm: v.distanceKm, matchScore, _score: matchScore.total }
    })

    const result = scored
      .sort((a, b) => b._score - a._score)
      .slice(0, take)
      .map(({ _score, ...rest }) => rest)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET_VACANCIES_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const user = session.user as { role?: string }
  if (user.role !== "ORGANISATION") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const result = vacancySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, location, city, postcode, remote, hours, duration, skills, categories } =
      result.data

    const geoCoords =
      postcode && postcode !== "" ? await geocodePostcode(postcode) : null

    const org = await prisma.organisation.findUnique({
      where: { adminId: session.user.id },
    })

    if (!org) {
      return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })
    }

    if (org.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Je organisatie moet eerst geverifieerd worden voordat je vacatures kunt plaatsen." },
        { status: 403 }
      )
    }

    const skillRecords = await Promise.all(
      skills.map((n) =>
        prisma.skill.upsert({ where: { name: n }, update: {}, create: { name: n } })
      )
    )

    const categoryRecords = await Promise.all(
      categories.map((n) =>
        prisma.category.upsert({ where: { name: n }, update: {}, create: { name: n } })
      )
    )

    const imageUrl: string | undefined = body.imageUrl

    const vacancy = await prisma.vacancy.create({
      data: {
        title,
        description,
        location: location ?? null,
        city: city ?? null,
        postcode: postcode ?? null,
        lat: geoCoords?.lat ?? null,
        lon: geoCoords?.lon ?? null,
        remote,
        hours: hours ?? null,
        duration: duration ?? null,
        imageUrl: imageUrl ?? null,
        organisationId: org.id,
        skills: {
          create: skillRecords.map((s) => ({ skillId: s.id })),
        },
        categories: {
          create: categoryRecords.map((c) => ({ categoryId: c.id })),
        },
      },
      include: {
        organisation: true,
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    })

    return NextResponse.json(vacancy, { status: 201 })
  } catch (error) {
    console.error("[CREATE_VACANCY_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
