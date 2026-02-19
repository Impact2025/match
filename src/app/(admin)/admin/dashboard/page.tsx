import { prisma } from "@/lib/prisma"
import { Building2, Users, Briefcase, GitMerge, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalOrgs,
    pendingOrgs,
    approvedOrgs,
    activeVacancies,
    totalMatches,
    recentMatches,
    recentOrgs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VOLUNTEER" } }),
    prisma.organisation.count(),
    prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.organisation.count({ where: { status: "APPROVED" } }),
    prisma.vacancy.count({ where: { status: "ACTIVE" } }),
    prisma.match.count(),
    prisma.match.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.organisation.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: {
        admin: { select: { email: true } },
        _count: { select: { vacancies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const kpis = [
    {
      label: "Vrijwilligers",
      value: totalUsers.toLocaleString("nl"),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      label: "Organisaties",
      value: approvedOrgs.toLocaleString("nl"),
      sub: `${totalOrgs} totaal`,
      icon: Building2,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
    },
    {
      label: "Actieve vacatures",
      value: activeVacancies.toLocaleString("nl"),
      icon: Briefcase,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      label: "Matches totaal",
      value: totalMatches.toLocaleString("nl"),
      sub: `+${recentMatches} deze week`,
      icon: GitMerge,
      color: "text-[#FF6B35]",
      bg: "bg-[#FF6B35]/10",
      border: "border-[#FF6B35]/20",
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Platform overzicht — live data</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 space-y-4"
            >
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} border ${kpi.border} flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${kpi.color}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{kpi.label}</p>
                {kpi.sub && (
                  <p className="text-[11px] text-white/25 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {kpi.sub}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending orgs alert */}
      {pendingOrgs > 0 && (
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">
                {pendingOrgs} {pendingOrgs === 1 ? "organisatie wacht" : "organisaties wachten"} op goedkeuring
              </p>
              <p className="text-white/35 text-xs mt-0.5">
                Verificatie is vereist voordat hun vacatures zichtbaar worden
              </p>
            </div>
          </div>
          <Link
            href="/admin/organisations?status=PENDING_APPROVAL"
            className="shrink-0 px-4 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-lg hover:bg-amber-500/25 transition-colors"
          >
            Bekijken →
          </Link>
        </div>
      )}

      {/* Recent pending orgs */}
      {recentOrgs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
              In behandeling
            </h2>
            <Link href="/admin/organisations?status=PENDING_APPROVAL" className="text-[#FF6B35] text-xs hover:underline">
              Alle bekijken
            </Link>
          </div>
          <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Naam</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">E-mail</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Vacatures</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrgs.map((org, i) => (
                  <tr
                    key={org.id}
                    className={`${i < recentOrgs.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-white/80 text-sm font-medium">{org.name}</p>
                      <p className="text-white/30 text-xs">{org.city ?? "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-sm hidden md:table-cell">
                      {org.admin.email}
                    </td>
                    <td className="px-5 py-4 text-white/40 text-sm">
                      {org._count.vacancies}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/organisations/${org.id}`}
                        className="text-[#FF6B35] text-xs font-medium hover:underline"
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
