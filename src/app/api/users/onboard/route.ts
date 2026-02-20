import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { geocodePostcode } from "@/lib/geocoding"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name,
      skills = [],
      interests = [],
      availability = [],
      bio,
      location,
      postcode,
      age,
      motivationProfile,
      schwartzProfile,
      // Org-specific fields
      organisationName,
      logo,
      orgCategories = [],
      description: orgDescription,
      website,
      orgEmail,
      phone,
      address,
      city,
      lat: clientLat,
      lon: clientLon,
    } = body

    // Determine role first
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    })

    const isOrg = dbUser?.role === "ORGANISATION"

    if (isOrg) {
      // --- Organisation onboarding ---
      const orgName = organisationName ?? dbUser?.name ?? "Mijn Organisatie"
      const baseSlug = orgName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 40)

      const orgData = {
        name: orgName,
        description: orgDescription ?? null,
        logo: logo ?? null,
        website: website ?? null,
        email: orgEmail ?? null,
        phone: phone ?? null,
        address: address ?? null,
        city: city ?? null,
        postcode: postcode ?? null,
        lat: clientLat != null ? Number(clientLat) : null,
        lon: clientLon != null ? Number(clientLon) : null,
      }

      // 1. Upsert org record (without categories to avoid nested write issues)
      const org = await prisma.organisation.upsert({
        where: { adminId: session.user.id },
        update: orgData,
        create: {
          ...orgData,
          slug: `${baseSlug}-${Date.now()}`,
          adminId: session.user.id,
        },
        select: { id: true },
      })

      // 2. Sync categories: delete old, insert new
      if ((orgCategories as string[]).length > 0) {
        const orgCategoryRecords = await Promise.all(
          (orgCategories as string[]).map((name) =>
            prisma.category.upsert({ where: { name }, update: {}, create: { name } })
          )
        )
        await prisma.orgCategory.deleteMany({ where: { organisationId: org.id } })
        await prisma.orgCategory.createMany({
          data: orgCategoryRecords.map((c) => ({ organisationId: org.id, categoryId: c.id })),
          skipDuplicates: true,
        })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboarded: true },
      })
    } else {
      // --- Volunteer onboarding ---
      const geoCoords =
        postcode && typeof postcode === "string" ? await geocodePostcode(postcode) : null

      // Upsert skills
      const skillRecords = await Promise.all(
        (skills as string[]).map((name) =>
          prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
        )
      )

      // Upsert categories (interests)
      const categoryRecords = await Promise.all(
        (interests as string[]).map((name) =>
          prisma.category.upsert({ where: { name }, update: {}, create: { name } })
        )
      )

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          onboarded: true,
          name: name ?? undefined,
          bio: bio ?? null,
          location: location ?? null,
          postcode: postcode ?? null,
          lat: geoCoords?.lat ?? null,
          lon: geoCoords?.lon ?? null,
          age: age != null ? Number(age) : null,
          availability: JSON.stringify(availability),
          motivationProfile: motivationProfile ? JSON.stringify(motivationProfile) : undefined,
          schwartzProfile: schwartzProfile ? JSON.stringify(schwartzProfile) : undefined,
          skills: {
            deleteMany: {},
            create: skillRecords.map((s) => ({ skillId: s.id })),
          },
          interests: {
            deleteMany: {},
            create: categoryRecords.map((c) => ({ categoryId: c.id })),
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ONBOARD_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
