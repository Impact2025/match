import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { vacancySchema } from "@/validators"
import { geocodePostcode } from "@/lib/geocoding"
import { embedText, toVectorLiteral, vacancyToText } from "@/lib/embeddings"

async function getVacancyWithOwnerCheck(id: string, userId: string) {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id },
    include: { organisation: true },
  })

  if (!vacancy) return { vacancy: null, error: "Niet gevonden", status: 404 }
  if (vacancy.organisation.adminId !== userId)
    return { vacancy: null, error: "Geen toegang", status: 403 }

  return { vacancy, error: null, status: 200 }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
      include: {
        organisation: true,
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    })

    if (!vacancy) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error("[GET_VACANCY_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const { vacancy, error, status } = await getVacancyWithOwnerCheck(id, session.user.id)
    if (error) return NextResponse.json({ error }, { status })

    const body = await req.json()
    const result = vacancySchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { skills, categories, postcode, ...rest } = result.data

    const geoUpdate =
      postcode !== undefined
        ? postcode !== "" && postcode != null
          ? await geocodePostcode(postcode).then((coords) => ({
              postcode,
              lat: coords?.lat ?? null,
              lon: coords?.lon ?? null,
            }))
          : { postcode: postcode ?? null, lat: null, lon: null }
        : {}

    const skillRecords = skills
      ? await Promise.all(
          skills.map((n) =>
            prisma.skill.upsert({ where: { name: n }, update: {}, create: { name: n } })
          )
        )
      : null

    const categoryRecords = categories
      ? await Promise.all(
          categories.map((n) =>
            prisma.category.upsert({ where: { name: n }, update: {}, create: { name: n } })
          )
        )
      : null

    const updated = await prisma.vacancy.update({
      where: { id: vacancy!.id },
      data: {
        ...rest,
        ...geoUpdate,
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.status !== undefined && { status: body.status }),
        ...(skillRecords && {
          skills: {
            deleteMany: {},
            create: skillRecords.map((s) => ({ skillId: s.id })),
          },
        }),
        ...(categoryRecords && {
          categories: {
            deleteMany: {},
            create: categoryRecords.map((c) => ({ categoryId: c.id })),
          },
        }),
      },
      include: {
        organisation: true,
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    })

    // Regenerate embedding non-blocking after vacancy update
    embedText(vacancyToText({
      title: updated.title,
      description: updated.description,
      skills: updated.skills.map((s) => s.skill.name),
      categories: updated.categories.map((c) => c.category.name),
      city: updated.city,
      remote: updated.remote,
      hours: updated.hours,
      duration: updated.duration,
    }))
      .then((embedding) => {
        const vectorLiteral = toVectorLiteral(embedding)
        return prisma.$executeRawUnsafe(
          `UPDATE vacancies SET embedding = '${vectorLiteral}'::vector WHERE id = '${updated.id}'`
        )
      })
      .catch((err) => console.error("[VACANCY_EMBED_REGEN_ERROR]", err))

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH_VACANCY_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const { vacancy, error, status } = await getVacancyWithOwnerCheck(id, session.user.id)
    if (error) return NextResponse.json({ error }, { status })

    await prisma.vacancy.delete({ where: { id: vacancy!.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE_VACANCY_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
