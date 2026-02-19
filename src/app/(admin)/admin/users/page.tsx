import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users } from "lucide-react"
import { UserStatusBadge } from "@/components/admin/status-badges"
import { UserActionButton } from "@/components/admin/user-action-button"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string; page?: string }>
}) {
  const { role, status, q, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 25

  const where: any = {
    role: role ? (role as any) : { not: "ADMIN" },
    ...(status ? { status: status as any } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
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

  const totalPages = Math.ceil(total / pageSize)

  const ROLE_TABS = [
    { label: "Alle", value: null },
    { label: "Vrijwilligers", value: "VOLUNTEER" },
    { label: "Organisaties", value: "ORGANISATION" },
  ]

  const buildHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const merged = { role: role ?? null, status: status ?? null, q: q ?? null, page: "1", ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    return `/admin/users${qs ? "?" + qs : ""}`
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gebruikers</h1>
        <p className="text-white/40 text-sm mt-1">{total} gevonden</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Role tabs */}
        <div className="flex gap-1 bg-[#161616] border border-white/[0.06] rounded-xl p-1">
          {ROLE_TABS.map((tab) => {
            const isActive = (tab.value ?? null) === (role ?? null)
            return (
              <Link
                key={tab.label}
                href={buildHref({ role: tab.value, page: "1" })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? "bg-[#FF6B35] text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <form action="/admin/users" method="GET" className="flex-1">
          {role && <input type="hidden" name="role" value={role} />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Zoek op naam of e-mail..."
            className="w-full bg-[#161616] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#FF6B35]/40 transition-colors"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-8 h-8 text-white/15" />
            <p className="text-white/30 text-sm">Geen gebruikers gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Gebruiker</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Rol</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Activiteit</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Lid sinds</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((user, i) => (
                <tr
                  key={user.id}
                  className={`${i < items.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
                >
                  <td className="px-6 py-4">
                    <p className="text-white/80 text-sm font-medium">{user.name ?? "Anoniem"}</p>
                    <p className="text-white/30 text-xs mt-0.5">{user.email}</p>
                    {user.organisation && (
                      <p className="text-white/20 text-[11px] mt-0.5">{user.organisation.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-white/45 text-xs font-medium uppercase tracking-wide">
                      {user.role === "VOLUNTEER" ? "Vrijwilliger" : "Organisatie"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-white/30 text-xs hidden lg:table-cell">
                    {user.role === "VOLUNTEER" ? (
                      <span>{user._count.swipesGiven} swipes · {user._count.matchesAsVol} matches</span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/30 text-sm hidden lg:table-cell">
                    {user.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionButton userId={user.id} currentStatus={user.status} />
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
