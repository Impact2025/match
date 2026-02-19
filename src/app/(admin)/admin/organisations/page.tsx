import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { OrgStatus } from "@prisma/client"
import { OrgStatusBadge } from "@/components/admin/status-badges"
import { Building2 } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUS_TABS: { label: string; value: OrgStatus | null }[] = [
  { label: "Alle", value: null },
  { label: "In behandeling", value: "PENDING_APPROVAL" },
  { label: "Goedgekeurd", value: "APPROVED" },
  { label: "Afgewezen", value: "REJECTED" },
  { label: "Geschorst", value: "SUSPENDED" },
]

export default async function AdminOrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusParam, page: pageParam } = await searchParams
  const activeStatus = (statusParam as OrgStatus | undefined) ?? null
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 20

  const where = activeStatus ? { status: activeStatus } : {}

  const [items, total] = await Promise.all([
    prisma.organisation.findMany({
      where,
      include: {
        admin: { select: { email: true } },
        _count: { select: { vacancies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.organisation.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organisaties</h1>
          <p className="text-white/40 text-sm mt-1">{total} in totaal</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-[#161616] border border-white/[0.06] rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === activeStatus
          const href = tab.value
            ? `/admin/organisations?status=${tab.value}`
            : "/admin/organisations"
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#FF6B35] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Building2 className="w-8 h-8 text-white/15" />
            <p className="text-white/30 text-sm">Geen organisaties gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Naam</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Stad</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Vacatures</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Aangemeld</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((org, i) => (
                <tr
                  key={org.id}
                  className={`${
                    i < items.length - 1 ? "border-b border-white/[0.04]" : ""
                  } hover:bg-white/[0.02] transition-colors group`}
                >
                  <td className="px-6 py-4">
                    <p className="text-white/85 text-sm font-medium group-hover:text-white transition-colors">
                      {org.name}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{org.admin.email}</p>
                  </td>
                  <td className="px-6 py-4 text-white/45 text-sm hidden lg:table-cell">
                    {org.city ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <OrgStatusBadge status={org.status} />
                  </td>
                  <td className="px-6 py-4 text-white/45 text-sm hidden md:table-cell">
                    {org._count.vacancies}
                  </td>
                  <td className="px-6 py-4 text-white/30 text-sm hidden lg:table-cell">
                    {org.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organisations/${org.id}`}
                      className="text-[#FF6B35] text-xs font-medium hover:underline"
                    >
                      Bekijken →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-sm">
            Pagina {page} van {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/organisations${activeStatus ? `?status=${activeStatus}&` : "?"}page=${page - 1}`}
                className="px-4 py-2 bg-[#161616] border border-white/[0.06] rounded-lg text-white/60 text-sm hover:text-white transition-colors"
              >
                ← Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/organisations${activeStatus ? `?status=${activeStatus}&` : "?"}page=${page + 1}`}
                className="px-4 py-2 bg-[#FF6B35] rounded-lg text-white text-sm font-medium hover:bg-[#e55a27] transition-colors"
              >
                Volgende →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
