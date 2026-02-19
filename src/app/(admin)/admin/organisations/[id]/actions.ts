"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendOrgApprovedEmail, sendOrgRejectedEmail } from "@/lib/email"

type OrgAction = "APPROVE_ORG" | "REJECT_ORG" | "SUSPEND_ORG" | "UNSUSPEND_ORG"

const STATUS_MAP = {
  APPROVE_ORG: "APPROVED",
  REJECT_ORG: "REJECTED",
  SUSPEND_ORG: "SUSPENDED",
  UNSUSPEND_ORG: "APPROVED",
} as const

export async function updateOrgStatus(orgId: string, action: OrgAction, reason?: string) {
  const session = await auth()
  const user = session?.user as { role?: string; id?: string } | undefined

  if (!session || user?.role !== "ADMIN" || !user?.id) {
    throw new Error("Geen toegang")
  }

  const newStatus = STATUS_MAP[action]

  const org = await prisma.organisation.findUnique({
    where: { id: orgId },
    select: { name: true, email: true },
  })

  await prisma.$transaction([
    prisma.organisation.update({
      where: { id: orgId },
      data: {
        status: newStatus,
        verifiedAt: newStatus === "APPROVED" ? new Date() : undefined,
        rejectionReason: ["REJECTED", "SUSPENDED"].includes(newStatus) ? (reason ?? null) : null,
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: user.id,
        action,
        entityType: "Organisation",
        entityId: orgId,
        reason: reason ?? null,
      },
    }),
  ])

  // Send email notification (non-blocking)
  if (org?.email) {
    if (newStatus === "APPROVED") {
      sendOrgApprovedEmail(org.email, org.name).catch(console.error)
    } else if (newStatus === "REJECTED") {
      sendOrgRejectedEmail(org.email, org.name, reason).catch(console.error)
    }
  }

  revalidatePath(`/admin/organisations/${orgId}`)
  revalidatePath("/admin/organisations")
  revalidatePath("/admin/dashboard")
}
