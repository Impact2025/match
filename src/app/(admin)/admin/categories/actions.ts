"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  const user = session?.user as { role?: string; id?: string } | undefined
  if (!session || user?.role !== "ADMIN" || !user?.id) {
    throw new Error("Geen toegang")
  }
  return user.id
}

export async function createCategory(name: string, icon?: string, color?: string) {
  await requireAdmin()
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Naam is verplicht")
  await prisma.category.create({ data: { name: trimmed, icon: icon || null, color: color || null } })
  revalidatePath("/admin/categories")
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  await prisma.category.delete({ where: { id } })
  revalidatePath("/admin/categories")
}

export async function createSkill(name: string) {
  await requireAdmin()
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Naam is verplicht")
  await prisma.skill.create({ data: { name: trimmed } })
  revalidatePath("/admin/categories")
}

export async function deleteSkill(id: string) {
  await requireAdmin()
  await prisma.skill.delete({ where: { id } })
  revalidatePath("/admin/categories")
}
