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
          <h1 className="text-2xl font-bold text-white tracking-tight">Vacatures</h1>
          <p className="text-white/40 text-sm mt-1">{total} gevonden</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-[#161616] border border-white/[0.06] rounded-xl p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.value === activeStatus
            return (
              <Link
                key={tab.label}
                href={buildHref({ status: tab.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? "bg-[#FF6B35] text-white" : "text-white/40 hover:text-white/70"
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
            className="w-full bg-[#161616] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#FF6B35]/40 transition-colors"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Briefcase className="w-8 h-8 text-white/15" />
            <p className="text-white/30 text-sm">Geen vacatures gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Vacature</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Organisatie</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Activiteit</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Aangemaakt</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((vacancy, i) => (
                <tr
                  key={vacancy.id}
                  className={`${i < items.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
                >
                  <td className="px-6 py-4">
                    <p className="text-white/80 text-sm font-medium">{vacancy.title}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {vacancy.city ?? "—"}{vacancy.remote ? " · Remote" : ""}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Link
                      href={`/admin/organisations/${vacancy.organisation.id}`}
                      className="text-white/55 text-sm hover:text-[#FF6B35] transition-colors"
                    >
                      {vacancy.organisation.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <VacancyStatusBadge status={vacancy.status} />
                  </td>
                  <td className="px-6 py-4 text-white/30 text-xs hidden lg:table-cell">
                    {vacancy._count.swipes} swipes · {vacancy._count.matches} matches
                  </td>
                  <td className="px-6 py-4 text-white/30 text-sm hidden lg:table-cell">
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
          <p className="text-white/30 text-sm">Pagina {page} van {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="px-4 py-2 bg-[#161616] border border-white/[0.06] rounded-lg text-white/60 text-sm hover:text-white transition-colors"
              >
                ← Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
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
