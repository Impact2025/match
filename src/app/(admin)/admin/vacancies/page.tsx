import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Briefcase } from "lucide-react"
import { VacancyStatus } from "@prisma/client"
import { VacancyStatusBadge } from "@/components/admin/status-badges"
import { VacancyAdminActions } from "@/components/admin/vacancy-admin-actions"

export const dynamic = "force-dynamic"

const STATUS_TABS: { label: string; value: VacancyStatus | null }[] = [
  { label: "Alle", value: null },
  { label: "Actief", value: "ACTIVE" },
  { label: "Concept", value: "DRAFT" },
  { label: "Gepauzeerd", value: "PAUSED" },
  { label: "Gesloten", value: "CLOSED" },
]

export default async function AdminVacanciesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>
}) {
  const { status: statusParam, page: pageParam, q } = await searchParams
  const activeStatus = (statusParam as VacancyStatus | undefined) ?? null
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 25

  const where: any = {
    ...(activeStatus ? { status: activeStatus } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { organisation: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.vacancy.findMany({
      where,
      include: {
        organisation: { select: { id: true, name: true, status: true } },
        _count: { select: { matches: true, swipes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vacancy.count({ where }),
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
    return `/admin/vacancies${qs ? "?" + qs : ""}`
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vacatures</h1>
          <p className="text-gray-400 text-sm mt-1">{total} gevonden</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus
            return (
              <Link
                key={tab.label}
                href={buildHref({ status: tab.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <form action="/admin/vacancies" method="GET" className="flex-1">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Zoek op titel of organisatienaam..."
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300 transition-colors"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Briefcase className="w-8 h-8 text-gray-200" />
            <p className="text-gray-400 text-sm">Geen vacatures gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Vacature</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Organisatie</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Activiteit</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Aangemaakt</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((vacancy, i) => (
                <tr
                  key={vacancy.id}
                  className={`${i < items.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <p className="text-gray-700 text-sm font-medium">{vacancy.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {vacancy.city ?? "—"}{vacancy.remote ? " · Remote" : ""}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Link
                      href={`/admin/organisations/${vacancy.organisation.id}`}
                      className="text-gray-500 text-sm hover:text-orange-500 transition-colors"
                    >
                      {vacancy.organisation.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <VacancyStatusBadge status={vacancy.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">
                    {vacancy._count.swipes} swipes · {vacancy._count.matches} matches
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">
                    {vacancy.createdAt.toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <VacancyAdminActions vacancyId={vacancy.id} currentStatus={vacancy.status} />
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
          <p className="text-gray-400 text-sm">Pagina {page} van {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-gray-500 text-sm hover:text-white transition-colors"
              >
                ← Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="px-4 py-2 bg-orange-500 rounded-lg text-gray-900 text-sm font-medium hover:bg-orange-600 transition-colors"
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
