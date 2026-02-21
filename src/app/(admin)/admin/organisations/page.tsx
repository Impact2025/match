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
  searchParams: Promise<{ status?: string; page?: string; q?: string }>
}) {
  const { status: statusParam, page: pageParam, q } = await searchParams
  const activeStatus = (statusParam as OrgStatus | undefined) ?? null
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 20

  const where: any = {
    ...(activeStatus ? { status: activeStatus } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { admin: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  }

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

  const buildHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const merged: Record<string, string | null> = {
      status: activeStatus,
      q: q ?? null,
      page: "1",
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    return `/admin/organisations${qs ? "?" + qs : ""}`
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organisaties</h1>
          <p className="text-gray-400 text-sm mt-1">{total} gevonden</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus
            return (
              <Link
                key={tab.label}
                href={buildHref({ status: tab.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form action="/admin/organisations" method="GET" className="flex-1">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Zoek op naam of e-mail..."
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300 transition-colors"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Building2 className="w-8 h-8 text-gray-200" />
            <p className="text-gray-400 text-sm">Geen organisaties gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Naam</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Stad</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Vacatures</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Aangemeld</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((org, i) => (
                <tr
                  key={org.id}
                  className={`${
                    i < items.length - 1 ? "border-b border-gray-100" : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <p className="text-gray-700 text-sm font-medium">
                      {org.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{org.admin.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">
                    {org.city ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <OrgStatusBadge status={org.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell">
                    {org._count.vacancies}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">
                    {org.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organisations/${org.id}`}
                      className="text-orange-500 text-xs font-medium hover:underline"
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
          <p className="text-gray-400 text-sm">
            Pagina {page} van {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-gray-500 text-sm transition-colors"
              >
                ← Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="px-4 py-2 bg-orange-500 rounded-lg text-white text-sm font-medium hover:bg-orange-600 transition-colors"
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
