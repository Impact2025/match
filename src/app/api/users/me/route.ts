import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSchema } from "@/validators"
import { geocodePostcode } from "@/lib/geocoding"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { category: true } },
        organisation: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[GET_ME_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = profileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, bio, location, postcode, skills, interests, availability, maxDistance } =
      result.data

    const geoCoords =
      postcode && postcode !== ""
        ? await geocodePostcode(postcode)
        : postcode === ""
          ? { lat: null, lon: null }
          : undefined

    const skillRecords = await Promise.all(
      skills.map((n) =>
        prisma.skill.upsert({ where: { name: n }, update: {}, create: { name: n } })
      )
    )

    const categoryRecords = await Promise.all(
      interests.map((n) =>
        prisma.category.upsert({ where: { name: n }, update: {}, create: { name: n } })
      )
    )

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio ?? null,
        location: location ?? null,
        postcode: postcode ?? null,
        ...(geoCoords !== undefined && {
          lat: geoCoords?.lat ?? null,
          lon: geoCoords?.lon ?? null,
        }),
        availability: JSON.stringify(availability),
        maxDistance,
        skills: {
          deleteMany: {},
          create: skillRecords.map((s) => ({ skillId: s.id })),
        },
        interests: {
          deleteMany: {},
          create: categoryRecords.map((c) => ({ categoryId: c.id })),
        },
      },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { category: true } },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PATCH_ME_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
