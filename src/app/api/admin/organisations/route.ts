import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") // "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED" | null
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = 20

  const where = status ? { status: status as any } : {}

  const [items, total] = await Promise.all([
    prisma.organisation.findMany({
      where,
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { vacancies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.organisation.count({ where }),
  ])

  return NextResponse.json({ items, total, page, pageSize, hasMore: page * pageSize < total })
}
