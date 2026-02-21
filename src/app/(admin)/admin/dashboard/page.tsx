import { prisma } from "@/lib/prisma"
import { Building2, Users, Briefcase, GitMerge, Clock, TrendingUp, TrendingDown, ScrollText } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalOrgs,
    pendingOrgs,
    approvedOrgs,
    activeVacancies,
    totalMatches,
    recentOrgs,
    // Week-over-week deltas
    usersThisWeek,
    usersLastWeek,
    matchesThisWeek,
    matchesLastWeek,
    vacanciesThisWeek,
    vacanciesLastWeek,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VOLUNTEER" } }),
    prisma.organisation.count(),
    prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.organisation.count({ where: { status: "APPROVED" } }),
    prisma.vacancy.count({ where: { status: "ACTIVE" } }),
    prisma.match.count(),
    prisma.organisation.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: {
        admin: { select: { email: true } },
        _count: { select: { vacancies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // this week
    prisma.user.count({ where: { role: "VOLUNTEER", createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { role: "VOLUNTEER", createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.match.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.match.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.vacancy.count({ where: { status: "ACTIVE", createdAt: { gte: weekAgo } } }),
    prisma.vacancy.count({ where: { status: "ACTIVE", createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
  ])

  const delta = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return null
    return current - previous
  }

  const kpis = [
    {
      label: "Vrijwilligers",
      value: totalUsers.toLocaleString("nl"),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      delta: delta(usersThisWeek, usersLastWeek),
      deltaLabel: "deze week",
    },
    {
      label: "Organisaties",
      value: approvedOrgs.toLocaleString("nl"),
      sub: `${totalOrgs} totaal`,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      delta: null,
      deltaLabel: null,
    },
    {
      label: "Actieve vacatures",
      value: activeVacancies.toLocaleString("nl"),
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      delta: delta(vacanciesThisWeek, vacanciesLastWeek),
      deltaLabel: "nieuw deze week",
    },
    {
      label: "Matches totaal",
      value: totalMatches.toLocaleString("nl"),
      icon: GitMerge,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      delta: delta(matchesThisWeek, matchesLastWeek),
      deltaLabel: "deze week",
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Platform overzicht — live data</p>
        </div>
        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {pendingOrgs > 0 && (
            <Link
              href="/admin/organisations?status=PENDING_APPROVAL"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              {pendingOrgs} in behandeling
            </Link>
          )}
          <Link
            href="/admin/logs"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-medium rounded-lg hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ScrollText className="w-3.5 h-3.5" />
            Audit log
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.delta !== null && kpi.delta >= 0
          const isNegative = kpi.delta !== null && kpi.delta < 0
          return (
            <div
              key={kpi.label}
              className="bg-white border border-gray-100 rounded-xl p-5 space-y-4"
            >
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} border ${kpi.border} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${kpi.color}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
                {kpi.sub && (
                  <p className="text-[11px] text-gray-300 mt-1">{kpi.sub}</p>
                )}
                {kpi.delta !== null && kpi.deltaLabel && (
                  <p className={`text-[11px] mt-1 flex items-center gap-1 ${
                    isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-gray-300"
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : isNegative ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {kpi.delta > 0 ? "+" : ""}{kpi.delta} {kpi.deltaLabel}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending orgs alert */}
      {pendingOrgs > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium">
                {pendingOrgs} {pendingOrgs === 1 ? "organisatie wacht" : "organisaties wachten"} op goedkeuring
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Verificatie is vereist voordat hun vacatures zichtbaar worden
              </p>
            </div>
          </div>
          <Link
            href="/admin/organisations?status=PENDING_APPROVAL"
            className="shrink-0 px-4 py-2 bg-amber-100 border border-amber-300 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors"
          >
            Bekijken →
          </Link>
        </div>
      )}

      {/* Recent pending orgs */}
      {recentOrgs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              In behandeling
            </h2>
            <Link href="/admin/organisations?status=PENDING_APPROVAL" className="text-orange-500 text-xs hover:underline">
              Alle bekijken
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Naam</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">E-mail</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Vacatures</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrgs.map((org, i) => (
                  <tr
                    key={org.id}
                    className={`${i < recentOrgs.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-gray-700 text-sm font-medium">{org.name}</p>
                      <p className="text-gray-400 text-xs">{org.city ?? "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm hidden md:table-cell">
                      {org.admin.email}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {org._count.vacancies}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/organisations/${org.id}`}
                        className="text-orange-500 text-xs font-medium hover:underline"
                      >
                        Beoordelen →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
