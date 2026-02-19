import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await req.json()
  const { action, reason } = body as { action: string; reason?: string }

  const validActions = ["SUSPEND_USER", "BAN_USER", "REINSTATE_USER"]
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 })
  }

  const statusMap: Record<string, "ACTIVE" | "SUSPENDED" | "BANNED"> = {
    REINSTATE_USER: "ACTIVE",
    SUSPEND_USER: "SUSPENDED",
    BAN_USER: "BANNED",
  }

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { status: statusMap[action] },
      select: { id: true, name: true, email: true, status: true },
    }),
    prisma.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: action as any,
        entityType: "User",
        entityId: id,
        reason: reason ?? null,
      },
    }),
  ])

  return NextResponse.json(user)
}
