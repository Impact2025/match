import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/activities/[id]/export — CSV presentielijst voor org
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const activity = await prisma.groupActivity.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { volunteer: { select: { name: true, email: true } } },
        orderBy: { registeredAt: "asc" },
      },
    },
  })

  if (!activity || activity.organisationId !== org.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  }

  const STATUS_LABELS: Record<string, string> = {
    REGISTERED: "Aangemeld",
    WAITLISTED: "Wachtlijst",
    ATTENDED: "Aanwezig",
    ABSENT: "Afwezig",
    CANCELLED: "Geannuleerd",
  }

  const rows = [
    ["Naam", "E-mail", "Status", "Aangemeld op", "Check-in tijdstip"],
    ...activity.registrations.map((r) => [
      r.volunteer.name ?? "",
      r.volunteer.email ?? "",
      STATUS_LABELS[r.status] ?? r.status,
      r.registeredAt.toLocaleString("nl-NL"),
      r.checkedInAt ? r.checkedInAt.toLocaleString("nl-NL") : "",
    ]),
  ]

  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const filename = `presentielijst-${activity.title.toLowerCase().replace(/\s+/g, "-")}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
