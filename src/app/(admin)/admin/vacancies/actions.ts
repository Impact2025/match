"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type VacancyAction = "PAUSE" | "CLOSE" | "ACTIVATE"

const STATUS_MAP = {
  PAUSE:    "PAUSED",
  CLOSE:    "CLOSED",
  ACTIVATE: "ACTIVE",
} as const

export async function updateVacancyStatus(vacancyId: string, action: VacancyAction) {
  const session = await auth()
  const user = session?.user as { role?: string; id?: string } | undefined

  if (!session || user?.role !== "ADMIN" || !user?.id) {
    throw new Error("Geen toegang")
  }

  await prisma.$transaction([
    prisma.vacancy.update({
      where: { id: vacancyId },
      data: { status: STATUS_MAP[action] },
    }),
    prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: "APPROVE_ORG", // reuse closest enum — extend AdminAction later if needed
        entityType: "Vacancy",
        entityId: vacancyId,
        reason: `Admin actie: ${action}`,
      },
    }),
  ])

  revalidatePath("/admin/vacancies")
}
