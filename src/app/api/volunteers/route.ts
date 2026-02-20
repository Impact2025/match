import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
  if (!org) {
    return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? []
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? []
  const city = searchParams.get("city") ?? ""

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

  return NextResponse.json(volunteers)
}
