import { prisma } from "@/lib/prisma"
import { ScrollText } from "lucide-react"
import { AdminAction } from "@prisma/client"
import Link from "next/link"

export const dynamic = "force-dynamic"

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  APPROVE_ORG:    { label: "Org goedgekeurd",  color: "text-green-600 bg-green-50 border-green-200" },
  REJECT_ORG:     { label: "Org afgewezen",    color: "text-red-600 bg-red-50 border-red-200" },
  SUSPEND_ORG:    { label: "Org geschorst",    color: "text-amber-600 bg-amber-50 border-amber-200" },
  UNSUSPEND_ORG:  { label: "Org heractiveerd", color: "text-blue-600 bg-blue-50 border-blue-200" },
  SUSPEND_USER:   { label: "User geschorst",   color: "text-amber-600 bg-amber-50 border-amber-200" },
  BAN_USER:       { label: "User verbannen",   color: "text-red-600 bg-red-50 border-red-200" },
  REINSTATE_USER: { label: "User hersteld",    color: "text-green-600 bg-green-50 border-green-200" },
}

const ALL_ACTIONS = Object.keys(ACTION_LABELS) as AdminAction[]

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; from?: string; to?: string }>
}) {
  const { page: pageParam, action: actionParam, from, to } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 30

  const activeAction = ALL_ACTIONS.includes(actionParam as AdminAction) ? (actionParam as AdminAction) : null

  const where: any = {
    ...(activeAction ? { action: activeAction } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59Z") } : {}),
          },
        }
      : {}),
  }

  const [items, total, grandTotal] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const buildHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const merged: Record<string, string | null> = {
      action: activeAction,
      from: from ?? null,
      to: to ?? null,
      page: "1",
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    return `/admin/logs${qs ? "?" + qs : ""}`
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Log</h1>
        <p className="text-gray-400 text-sm mt-1">{total} {total !== grandTotal ? "acties gevonden (gefilterd)" : "acties gelogd"}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Action type filter */}
        <form action="/admin/logs" method="GET" className="flex flex-wrap gap-2 items-center flex-1">
          {from && <input type="hidden" name="from" value={from} />}
          {to && <input type="hidden" name="to" value={to} />}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
            <Link
              href={buildHref({ action: null })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                !activeAction ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Alle
            </Link>
            {ALL_ACTIONS.map((a) => (
              <Link
                key={a}
                href={buildHref({ action: a })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeAction === a ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {ACTION_LABELS[a]?.label ?? a}
              </Link>
            ))}
          </div>
        </form>
      </div>

      {/* Date range filter */}
      <form action="/admin/logs" method="GET" className="flex flex-wrap gap-3 items-center">
        {activeAction && <input type="hidden" name="action" value={activeAction} />}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">Van</label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">Tot</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-300"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Filteren
        </button>
        {(from || to) && (
          <Link
            href={buildHref({ from: null, to: null })}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-400 text-sm rounded-lg hover:text-gray-600 transition-colors"
          >
            Wissen
          </Link>
        )}
      </form>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ScrollText className="w-8 h-8 text-gray-200" />
            <p className="text-gray-400 text-sm">Geen acties gevonden</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Actie</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Door</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Reden</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Datum</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log, i) => {
                const config = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-gray-400 bg-gray-100 border-gray-200" }
                return (
                  <tr
                    key={log.id}
                    className={`${i < items.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${config.color}`}>
                        {config.label}
                      </span>
                      <p className="text-gray-300 text-[11px] mt-1">{log.entityType} · {log.entityId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell">
                      {log.admin.name ?? log.admin.email}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-2">{log.reason ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">
                      {log.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                      <p className="text-gray-300 text-xs">
                        {log.createdAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                  </tr>
                )
              })}
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
