import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { haversineDistance } from "@/lib/geocoding"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const user = session.user as { role?: string }

  try {
    if (user.role === "ORGANISATION") {
      const org = await prisma.organisation.findUnique({
        where: { adminId: session.user.id },
      })

      if (!org) {
        return NextResponse.json([])
      }

      const matches = await prisma.match.findMany({
        where: { vacancy: { organisationId: org.id } },
        include: {
          volunteer: true,
          vacancy: {
            include: { organisation: true },
          },
          conversation: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(matches)
    }

    // Volunteer
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lat: true, lon: true },
    })

    const matches = await prisma.match.findMany({
      where: { volunteerId: session.user.id },
      include: {
        vacancy: {
          include: {
            organisation: true,
            skills: { include: { skill: true } },
          },
        },
        conversation: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const annotated = matches.map((m) => {
      if (!m.vacancy) return m
      if (m.vacancy.remote) return { ...m, vacancy: { ...m.vacancy, distanceKm: 0 } }
      if (!currentUser?.lat || !currentUser?.lon || !m.vacancy.lat || !m.vacancy.lon)
        return { ...m, vacancy: { ...m.vacancy, distanceKm: null } }
      return {
        ...m,
        vacancy: {
          ...m.vacancy,
          distanceKm: Math.round(
            haversineDistance(currentUser.lat, currentUser.lon, m.vacancy.lat, m.vacancy.lon)
          ),
        },
      }
    })

    return NextResponse.json(annotated)
  } catch (error) {
    console.error("[GET_MATCHES_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
