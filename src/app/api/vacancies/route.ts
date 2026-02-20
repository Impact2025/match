import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { vacancySchema } from "@/validators"
import { geocodePostcode, haversineDistance } from "@/lib/geocoding"
import { calculateMatchScore } from "@/lib/matching/scoring-engine"
import { embedText, toVectorLiteral, volunteerToText, vacancyToText } from "@/lib/embeddings"

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
        schwartzProfile: true,
        bio: true,
        name: true,
        location: true,
        interests: { select: { category: { select: { name: true } } } },
        skills: { select: { skill: { select: { name: true } } } },
      },
    })

    // ── Stage 1: ANN retrieval (pgvector cosine search) ──────────────────────
    // If pgvector is available, pre-filter candidates semantically before scoring.
    // Falls back to recency-ordered full scan when embeddings are unavailable.

    let annCandidateIds: string[] | null = null

    try {
      const profileText = volunteerToText({
        name: currentUser?.name ?? null,
        bio: currentUser?.bio ?? null,
        skills: (currentUser?.skills ?? []).map((s) => s.skill.name),
        interests: (currentUser?.interests ?? []).map((i) => i.category.name),
        location: currentUser?.location ?? null,
      })

      if (profileText.trim().length > 10) {
        // Check if user already has a stored embedding via raw SQL
        const userEmbRow = await prisma.$queryRaw<{ has_embedding: boolean }[]>`
          SELECT (embedding IS NOT NULL) as has_embedding
          FROM users WHERE id = ${session.user.id} LIMIT 1
        `

        let vectorLiteral: string | null = null

        if (userEmbRow[0]?.has_embedding) {
          // Reuse stored embedding
          const row = await prisma.$queryRaw<{ emb: string }[]>`
            SELECT embedding::text as emb FROM users WHERE id = ${session.user.id} LIMIT 1
          `
          if (row[0]?.emb) vectorLiteral = row[0].emb
        } else {
          // Generate + store embedding for this user
          const embedding = await embedText(profileText)
          vectorLiteral = toVectorLiteral(embedding)
          await prisma.$executeRawUnsafe(
            `UPDATE users SET embedding = '${vectorLiteral}'::vector WHERE id = '${session.user.id}'`
          )
        }

        if (vectorLiteral) {
          const excludeClause = swipedIds.length > 0
            ? `AND v.id NOT IN (${swipedIds.map((id) => `'${id}'`).join(",")})`
            : ""

          const candidates = await prisma.$queryRawUnsafe<{ id: string }[]>(
            `SELECT v.id FROM vacancies v
             INNER JOIN organisations o ON v.organisation_id = o.id
             WHERE v.status = 'ACTIVE' AND o.status = 'APPROVED'
             AND v.embedding IS NOT NULL
             ${excludeClause}
             ORDER BY v.embedding <=> '${vectorLiteral}'::vector
             LIMIT ${take * 8}`
          )

          if (candidates.length > 0) {
            annCandidateIds = candidates.map((r) => r.id)
          }
        }
      }
    } catch {
      // pgvector not available or any error — silently fall back to recency sort
      annCandidateIds = null
    }

    // ── Fetch full vacancy data ───────────────────────────────────────────────

    const baseWhere = {
      status: "ACTIVE" as const,
      organisation: { status: "APPROVED" as const },
      ...(swipedIds.length > 0 ? { id: { notIn: swipedIds } } : {}),
    }

    const vacancies = await prisma.vacancy.findMany({
      where: annCandidateIds
        ? { ...baseWhere, id: { in: annCandidateIds } }
        : baseWhere,
      include: {
        organisation: true,
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
        _count: { select: { swipes: true } },
      },
      take: annCandidateIds ? undefined : take * 4, // ANN already limited above
      orderBy: annCandidateIds ? undefined : { createdAt: "desc" },
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
        volunteerSchwartzJson: currentUser?.schwartzProfile ?? null,
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

    // Generate and store embedding asynchronously (non-blocking)
    embedText(vacancyToText({
      title: vacancy.title,
      description: vacancy.description,
      skills: vacancy.skills.map((s) => s.skill.name),
      categories: vacancy.categories.map((c) => c.category.name),
      city: vacancy.city,
      remote: vacancy.remote,
      hours: vacancy.hours,
      duration: vacancy.duration,
    }))
      .then((embedding) => {
        const vectorLiteral = toVectorLiteral(embedding)
        return prisma.$executeRawUnsafe(
          `UPDATE vacancies SET embedding = '${vectorLiteral}'::vector WHERE id = '${vacancy.id}'`
        )
      })
      .catch((err) => console.error("[VACANCY_EMBED_ERROR]", err))

    return NextResponse.json(vacancy, { status: 201 })
  } catch (error) {
    console.error("[CREATE_VACANCY_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
