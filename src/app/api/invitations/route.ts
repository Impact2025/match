import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invitationSchema } from "@/validators"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (dbUser?.role === "VOLUNTEER") {
    const invitations = await prisma.invitation.findMany({
      where: { volunteerId: session.user.id },
      include: {
        organisation: { select: { id: true, name: true, logo: true, city: true, slug: true } },
        vacancy: { select: { id: true, title: true, city: true, hours: true, duration: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(invitations)
  }

  if (dbUser?.role === "ORGANISATION") {
    const org = await prisma.organisation.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    })
    if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 })

    const invitations = await prisma.invitation.findMany({
      where: { organisationId: org.id },
      include: {
        volunteer: {
          select: { id: true, name: true, image: true, location: true, bio: true,
            skills: { select: { skill: { select: { name: true } } } } },
        },
        vacancy: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(invitations)
  }

  return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }

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

  const body = await req.json()
  const result = invitationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
  }

  const { vacancyId, volunteerId, message } = result.data

  // Check volunteer is open to invitations
  const volunteer = await prisma.user.findUnique({
    where: { id: volunteerId },
    select: { openToInvitations: true, role: true },
  })
  if (!volunteer || volunteer.role !== "VOLUNTEER" || !volunteer.openToInvitations) {
    return NextResponse.json({ error: "Vrijwilliger ontvangt geen uitnodigingen" }, { status: 400 })
  }

  // Rate limit: max 10 pending invitations per org
  const pendingCount = await prisma.invitation.count({
    where: { organisationId: org.id, status: "PENDING" },
  })
  if (pendingCount >= 10) {
    return NextResponse.json(
      { error: "Je hebt al 10 openstaande uitnodigingen. Wacht op reacties." },
      { status: 429 }
    )
  }

  try {
    const invitation = await prisma.invitation.create({
      data: {
        organisationId: org.id,
        vacancyId,
        volunteerId,
        message: message ?? null,
      },
    })
    return NextResponse.json(invitation, { status: 201 })
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Je hebt deze vrijwilliger al uitgenodigd voor deze vacature" },
        { status: 409 }
      )
    }
    console.error("[POST_INVITATION_ERROR]", e)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
