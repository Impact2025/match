import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { organisationSchema } from "@/validators"
import { geocodePostcode } from "@/lib/geocoding"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const user = session.user as { role?: string }
  if (user.role !== "ORGANISATION") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  try {
    const org = await prisma.organisation.findUnique({
      where: { adminId: session.user.id },
      include: {
        categories: { include: { category: true } },
        vacancies: {
          include: {
            _count: { select: { matches: true } },
          },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error("[GET_ORG_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
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
    const result = organisationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { postcode } = result.data
    const geoCoords =
      postcode && postcode !== "" ? await geocodePostcode(postcode) : undefined

    const org = await prisma.organisation.update({
      where: { adminId: session.user.id },
      data: {
        ...result.data,
        ...(geoCoords !== undefined && {
          lat: geoCoords?.lat ?? null,
          lon: geoCoords?.lon ?? null,
        }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.categories !== undefined && {
          categories: {
            deleteMany: {},
            create: await Promise.all(
              (body.categories as string[]).map(async (name: string) => {
                const cat = await prisma.category.upsert({
                  where: { name },
                  update: {},
                  create: { name },
                })
                return { categoryId: cat.id }
              })
            ),
          },
        }),
      },
    })

    return NextResponse.json(org)
  } catch (error) {
    console.error("[PATCH_ORG_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
