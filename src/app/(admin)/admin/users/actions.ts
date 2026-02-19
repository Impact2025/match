"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type UserAction = "SUSPEND_USER" | "BAN_USER" | "REINSTATE_USER"

const STATUS_MAP = {
  REINSTATE_USER: "ACTIVE",
  SUSPEND_USER: "SUSPENDED",
  BAN_USER: "BANNED",
} as const

export async function updateUserStatus(userId: string, action: UserAction, reason?: string) {
  const session = await auth()
  const user = session?.user as { role?: string; id?: string } | undefined

  if (!session || user?.role !== "ADMIN" || !user?.id) {
    throw new Error("Geen toegang")
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: STATUS_MAP[action] },
    }),
    prisma.adminLog.create({
      data: {
        adminId: user.id,
        action,
        entityType: "User",
        entityId: userId,
        reason: reason ?? null,
      },
    }),
  ])

  revalidatePath("/admin/users")
}
