export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"
import { getCurrentGemeente } from "@/lib/gemeente"
import {
  Users, Heart, Clock, TrendingUp, Coins,
  HandHeart, Sprout, Building2,
} from "lucide-react"
import { PrintButton } from "@/components/organisation/print-button"

// ── Helpers ────────────────────────────────────────────────────────────────────

function estimateHours(h: number | null, status: string, startedAt: Date | null) {
  const hrs = h ?? 2
  if (status === "COMPLETED") return hrs * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
  if (!startedAt) return hrs * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
  const weeks = Math.min((Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000), IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS)
  return hrs * Math.max(weeks, 1)
}

function fEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000) return `€${Math.round(n / 1_000)}k`
  return `€${n}`
}
function fHours(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}k uur`
  return `${n} uur`
}
function monthShort(yyyymm: string) {
  const [y, m] = yyyymm.split("-")
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("nl-NL", { month: "short" })
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, sub, color }: { icon: React.ElementType; title: string; sub?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 px-4">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <p className="text-sm font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrgImpactPage() {
  const [session, gemeente] = await Promise.all([auth(), getCurrentGemeente()])
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
    select: { id: true, name: true },
  })
  if (!org) redirect("/onboarding")

  const color = gemeente?.primaryColor ?? "#f97316"
  const gradient = `linear-gradient(135deg, ${color}, ${color}cc)`

  // ── Data ophalen ────────────────────────────────────────────────────────────

  const [totalVacancies, totalMatches, acceptedMatches, completedMatches] = await Promise.all([
    prisma.vacancy.count({ where: { organisationId: org.id } }),
    prisma.match.count({ where: { vacancy: { organisationId: org.id } } }),
    prisma.match.count({ where: { status: "ACCEPTED",  vacancy: { organisationId: org.id } } }),
    prisma.match.count({ where: { status: "COMPLETED", vacancy: { organisationId: org.id } } }),
  ])

  const matchesWithData = await prisma.match.findMany({
    where: { status: { in: ["ACCEPTED", "COMPLETED"] }, vacancy: { organisationId: org.id } },
    select: {
      status: true,
      startedAt: true,
      vacancy: {
        select: {
          hours: true,
          categories: { select: { category: { select: { name: true } } } },
        },
      },
    },
  })

  let totalHours = 0
  for (const m of matchesWithData) totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  const economicValue  = totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  const sroiValue      = economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER
  const fulfilledMatches = acceptedMatches + completedMatches
  const matchAcceptRate  = totalMatches > 0 ? Math.round((fulfilledMatches / totalMatches) * 100) : 0

  // Unieke actieve vrijwilligers voor deze org
  const activeVolunteers = await prisma.$queryRaw<[{ cnt: bigint }]>`
    SELECT COUNT(DISTINCT m.volunteer_id)::bigint as cnt
    FROM matches m
    JOIN vacancies v ON m.vacancy_id = v.id
    WHERE v.organisation_id = ${org.id}
      AND m.status IN ('ACCEPTED','COMPLETED')
      AND m.started_at >= NOW() - INTERVAL '90 days'
  `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)

  // SDG-bijdrage
  const sdgHours = new Map<number, number>()
  const sdgCount = new Map<number, number>()
  for (const m of matchesWithData) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const sdgSet = new Set<number>()
    for (const cat of cats) (CATEGORY_SDG_MAP[cat] ?? []).forEach((n) => sdgSet.add(n))
    const share = sdgSet.size > 0 ? h / sdgSet.size : 0
    for (const n of sdgSet) {
      sdgHours.set(n, (sdgHours.get(n) ?? 0) + share)
      sdgCount.set(n, (sdgCount.get(n) ?? 0) + 1)
    }
  }
  const sdgImpact = SDG_DEFINITIONS
    .filter((s) => sdgHours.has(s.number))
    .map((s) => ({ ...s, hours: Math.round(sdgHours.get(s.number) ?? 0), matchCount: sdgCount.get(s.number) ?? 0 }))
    .sort((a, b) => b.hours - a.hours)

  // Categorie-breakdown
  const catHours = new Map<string, number>()
  const catCount = new Map<string, number>()
  for (const m of matchesWithData) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const share = cats.length > 0 ? h / cats.length : 0
    for (const cat of cats) {
      catHours.set(cat, (catHours.get(cat) ?? 0) + share)
      catCount.set(cat, (catCount.get(cat) ?? 0) + 1)
    }
  }
  const categoryBreakdown = Array.from(catHours.entries())
    .map(([cat, hrs]) => ({ category: cat, hours: Math.round(hrs), count: catCount.get(cat) ?? 0 }))
    .sort((a, b) => b.hours - a.hours)

  // Maandtrend (laatste 12 maanden)
  type MRow = { month: string; cnt: bigint }
  const [matchRows, acceptedRows] = await Promise.all([
    prisma.$queryRaw<MRow[]>`
      SELECT TO_CHAR(m.created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt
      FROM matches m JOIN vacancies v ON m.vacancy_id=v.id
      WHERE v.organisation_id=${org.id} AND m.created_at>=NOW()-INTERVAL '12 months'
      GROUP BY month ORDER BY month
    `,
    prisma.$queryRaw<MRow[]>`
      SELECT TO_CHAR(m.started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt
      FROM matches m JOIN vacancies v ON m.vacancy_id=v.id
      WHERE v.organisation_id=${org.id} AND m.started_at>=NOW()-INTERVAL '12 months'
        AND m.status IN('ACCEPTED','COMPLETED')
      GROUP BY month ORDER BY month
    `,
  ]).catch(() => [[], []] as [MRow[], MRow[]])

  const monthMap = new Map<string, { month: string; total: number; accepted: number }>()
  for (const r of matchRows) {
    if (!monthMap.has(r.month)) monthMap.set(r.month, { month: r.month, total: 0, accepted: 0 })
    monthMap.get(r.month)!.total += Number(r.cnt)
  }
  for (const r of acceptedRows) {
    if (!monthMap.has(r.month)) monthMap.set(r.month, { month: r.month, total: 0, accepted: 0 })
    monthMap.get(r.month)!.accepted += Number(r.cnt)
  }
  const monthlyTrend = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))
  const maxMonthTotal = Math.max(...monthlyTrend.map((m) => m.total), 1)
  const maxCatHours   = categoryBreakdown[0]?.hours ?? 1
  const maxSdgHours   = sdgImpact[0]?.hours ?? 1

  const roundHours = Math.round(totalHours)

  // MoM-vergelijking (huidige maand vs vorige maand)
  const now = new Date()
  const curMonthKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const prevMonthKey = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  })()
  const curMonthData  = monthlyTrend.find((m) => m.month === curMonthKey)  ?? { total: 0, accepted: 0 }
  const prevMonthData = monthlyTrend.find((m) => m.month === prevMonthKey) ?? { total: 0, accepted: 0 }
  const momGrowth = prevMonthData.total > 0
    ? Math.round(((curMonthData.total - prevMonthData.total) / prevMonthData.total) * 100)
    : null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-10">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "14px 14px" }} />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white/70 text-[10px] uppercase tracking-widest font-medium">Mijn Impact</p>
                <p className="text-white font-bold text-sm leading-tight">{org.name}</p>
              </div>
            </div>
            <PrintButton />
          </div>
          {momGrowth !== null && (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
              momGrowth >= 0 ? "bg-white/20 text-white" : "bg-black/20 text-white/80"
            }`}>
              {momGrowth >= 0 ? "↑" : "↓"} {Math.abs(momGrowth)}% t.o.v. vorige maand
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Vrijwilligersuren", value: fHours(roundHours) },
              { label: "Maatsch. waarde",   value: fEur(Math.round(economicValue)) },
              { label: "Actieve vrijw.",    value: String(activeVolunteers) },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-white/70 text-[10px] leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Kerngetallen ───────────────────────────────────────────────── */}
      <SectionTitle icon={TrendingUp} title="Kerngetallen" sub="Totaaloverzicht in cijfers" color={color} />
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Users,  label: "Actieve vrijwilligers", value: String(activeVolunteers), sub: "laatste 90 dagen", mom: null },
          { icon: Heart,  label: "Matches deze maand",    value: String(curMonthData.total), sub: `${curMonthData.accepted} geaccepteerd`, mom: momGrowth },
          { icon: Clock,  label: "Vrijwilligersuren",     value: fHours(roundHours),       sub: "geschat totaal", mom: null },
          { icon: Coins,  label: "SROI-waarde",           value: fEur(Math.round(sroiValue)), sub: `×${IMPACT_CONSTANTS.SROI_MULTIPLIER} multiplier`, mom: null },
        ].map(({ icon: Icon, label, value, sub, mom }) => (
          <Card key={label} className="p-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-[11px] text-gray-400">{sub}</p>
              {mom !== null && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  mom >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {mom >= 0 ? "+" : ""}{mom}%
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Matching kwaliteit ─────────────────────────────────────────── */}
      <SectionTitle icon={Heart} title="Matching kwaliteit" color={color} />
      <Card>
        <StatRow label="Totaal vacatures"     value={String(totalVacancies)} />
        <StatRow label="Totaal matches"        value={String(totalMatches)} />
        <StatRow label="Geaccepteerd"          value={String(acceptedMatches)} sub={`${matchAcceptRate}% van alle matches`} />
        <StatRow label="Afgerond"              value={String(completedMatches)} />
      </Card>

      {/* ── Trendgrafiek ───────────────────────────────────────────────── */}
      {monthlyTrend.length > 0 && (
        <>
          <SectionTitle icon={TrendingUp} title="Groei per maand" sub="Laatste 12 maanden" color={color} />
          <Card className="p-4">
            <div className="flex items-end gap-1 h-28 mb-2">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div
                    className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden"
                    style={{ height: `${(m.total / maxMonthTotal) * 96}px`, minHeight: m.total > 0 ? 4 : 0, background: `${color}25` }}
                  >
                    <div
                      className="w-full rounded-t-sm"
                      style={{ height: `${m.total > 0 ? (m.accepted / m.total) * 100 : 0}%`, minHeight: m.accepted > 0 ? 3 : 0, background: gradient }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 text-center text-[9px] text-gray-400 shrink-0">{monthShort(m.month)}</div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: `${color}25` }} />
                Nieuwe matches
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: gradient }} />
                Geaccepteerd
              </span>
            </div>
          </Card>
        </>
      )}

      {/* ── SDG bijdrage ────────────────────────────────────────────────── */}
      {sdgImpact.length > 0 && (
        <>
          <SectionTitle icon={Sprout} title="SDG-bijdrage" sub="VN Duurzame Ontwikkelingsdoelstellingen" color={color} />
          <div className="space-y-2">
            {sdgImpact.map((s) => (
              <Card key={s.number} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: s.color }}
                >
                  {s.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{s.nameNl}</p>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.hours / maxSdgHours) * 100}%`, background: s.color }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900 tabular-nums">{s.hours} uur</p>
                  <p className="text-[10px] text-gray-400">{s.matchCount} matches</p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Impact per thema ────────────────────────────────────────────── */}
      {categoryBreakdown.length > 0 && (
        <>
          <SectionTitle icon={HandHeart} title="Impact per thema" color={color} />
          <Card>
            {categoryBreakdown.slice(0, 6).map((c, i) => (
              <div
                key={c.category}
                className={`flex items-center gap-3 px-4 py-3 ${i < Math.min(categoryBreakdown.length, 6) - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs font-medium text-gray-700 truncate pr-2">{c.category}</p>
                    <p className="text-xs font-bold text-gray-900 tabular-nums shrink-0">{c.hours} uur</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.hours / maxCatHours) * 100}%`, background: gradient }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* ── SROI uitleg ─────────────────────────────────────────────────── */}
      <SectionTitle icon={Coins} title="Maatschappelijke waarde" sub="Social Return on Investment (SROI)" color={color} />
      <Card>
        {[
          { step: "1", label: "Vrijwilligersuren",  value: fHours(roundHours),               sub: "Geschat op basis van matches × uren/week × looptijd" },
          { step: "2", label: "Vervangingswaarde",  value: fEur(Math.round(economicValue)),  sub: `× €${IMPACT_CONSTANTS.HOURLY_VALUE_EUR}/uur (CBS 2024)` },
          { step: "3", label: "SROI-waarde",        value: fEur(Math.round(sroiValue)),      sub: `× ${IMPACT_CONSTANTS.SROI_MULTIPLIER} multiplier (Movisie / SVI)` },
        ].map(({ step, label, value, sub }, i, arr) => (
          <div key={step}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ background: gradient }}
              >
                {step}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">{value}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
            </div>
            {i < arr.length - 1 && <div className="h-px bg-gray-50 mx-4" />}
          </div>
        ))}
      </Card>

      {/* ── Lege staat ──────────────────────────────────────────────────── */}
      {fulfilledMatches === 0 && (
        <Card className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
            <Sprout className="w-6 h-6" style={{ color }} strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-gray-800">Nog geen impact data</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Zodra vrijwilligers je vacatures accepteren, zie je hier je maatschappelijke impact.
          </p>
        </Card>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-400 pb-2">
        Bijgewerkt op {new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} ·
        CBS-methodiek · SVI SROI-standaard
      </p>

    </div>
  )
}
