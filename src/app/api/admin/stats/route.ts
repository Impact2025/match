import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const [
    totalUsers,
    totalOrgs,
    pendingOrgs,
    approvedOrgs,
    totalVacancies,
    activeVacancies,
    totalMatches,
    recentMatches,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VOLUNTEER" } }),
    prisma.organisation.count(),
    prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.organisation.count({ where: { status: "APPROVED" } }),
    prisma.vacancy.count(),
    prisma.vacancy.count({ where: { status: "ACTIVE" } }),
    prisma.match.count(),
    prisma.match.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ])

  return NextResponse.json({
    totalUsers,
    totalOrgs,
    pendingOrgs,
    approvedOrgs,
    totalVacancies,
    activeVacancies,
    totalMatches,
    recentMatches,
  })
}
