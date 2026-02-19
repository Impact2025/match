import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") // "VOLUNTEER" | "ORGANISATION" | null
  const status = searchParams.get("status")
  const search = searchParams.get("q")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = 25

  const where: any = {
    role: role ? (role as any) : { not: "ADMIN" },
    ...(status ? { status: status as any } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        onboarded: true,
        createdAt: true,
        organisation: { select: { id: true, name: true, status: true } },
        _count: { select: { matchesAsVol: true, swipesGiven: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ items, total, page, pageSize, hasMore: page * pageSize < total })
}
