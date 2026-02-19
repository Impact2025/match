import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const org = await prisma.organisation.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, name: true, email: true } },
      categories: { include: { category: true } },
      vacancies: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { matches: true } } },
      },
      _count: { select: { vacancies: true } },
    },
  })

  if (!org) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })
  return NextResponse.json(org)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await req.json()
  const { action, reason } = body as { action: string; reason?: string }

  const validActions = ["APPROVE_ORG", "REJECT_ORG", "SUSPEND_ORG", "UNSUSPEND_ORG"]
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 })
  }

  const statusMap: Record<string, "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING_APPROVAL"> = {
    APPROVE_ORG: "APPROVED",
    REJECT_ORG: "REJECTED",
    SUSPEND_ORG: "SUSPENDED",
    UNSUSPEND_ORG: "APPROVED",
  }

  const newStatus = statusMap[action]

  const [org] = await prisma.$transaction([
    prisma.organisation.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedAt: newStatus === "APPROVED" ? new Date() : undefined,
        rejectionReason: reason ?? null,
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: action as any,
        entityType: "Organisation",
        entityId: id,
        reason: reason ?? null,
      },
    }),
  ])

  return NextResponse.json(org)
}
