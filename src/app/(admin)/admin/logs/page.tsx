import { prisma } from "@/lib/prisma"
import { ScrollText } from "lucide-react"

export const dynamic = "force-dynamic"

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  APPROVE_ORG:    { label: "Org goedgekeurd",  color: "text-green-400 bg-green-400/10 border-green-400/20" },
  REJECT_ORG:     { label: "Org afgewezen",    color: "text-red-400 bg-red-400/10 border-red-400/20" },
  SUSPEND_ORG:    { label: "Org geschorst",    color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  UNSUSPEND_ORG:  { label: "Org heractiveerd", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  SUSPEND_USER:   { label: "User geschorst",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  BAN_USER:       { label: "User verbannen",   color: "text-red-400 bg-red-400/10 border-red-400/20" },
  REINSTATE_USER: { label: "User hersteld",    color: "text-green-400 bg-green-400/10 border-green-400/20" },
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 30

  const [items, total] = await Promise.all([
    prisma.adminLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adminLog.count(),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log</h1>
        <p className="text-white/40 text-sm mt-1">{total} acties gelogd</p>
      </div>

      <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ScrollText className="w-8 h-8 text-white/15" />
            <p className="text-white/30 text-sm">Nog geen acties gelogd</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Actie</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Door</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Reden</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Datum</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log, i) => {
                const config = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-white/40 bg-white/5 border-white/10" }
                return (
                  <tr
                    key={log.id}
                    className={`${i < items.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${config.color}`}>
                        {config.label}
                      </span>
                      <p className="text-white/25 text-[11px] mt-1">{log.entityType} · {log.entityId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-sm hidden md:table-cell">
                      {log.admin.name ?? log.admin.email}
                    </td>
                    <td className="px-6 py-4 text-white/35 text-sm hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-2">{log.reason ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-white/30 text-sm whitespace-nowrap">
                      {log.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                      <p className="text-white/20 text-xs">
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
    </div>
  )
}
