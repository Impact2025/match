/**
 * /impact  —  Publieke impactpagina
 *
 * Volgt de visuele stijl van de dashboard-app:
 * - bg-gray-50 achtergrond
 * - max-w-lg mx-auto container
 * - witte rounded-2xl cards met border-gray-100
 * - orange/amber gradient accenten
 * - sticky header met gemeente-branding
 */

export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"
import {
  Users, Building2, Heart, Clock, TrendingUp, Coins,
  HandHeart, Sprout, ArrowRight, ChevronRight,
} from "lucide-react"
import Link from "next/link"

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getImpactData() {
  const hdrs = await headers()
  const slug = hdrs.get("x-gemeente-slug")

  let gemeente: { id: string; name: string; displayName: string; primaryColor: string; tagline: string | null } | null = null
  let gid: string | null = null

  if (slug) {
    type GRow = { id: string; name: string; display_name: string; primary_color: string; tagline: string | null }
    const rows = await prisma.$queryRaw<GRow[]>`
      SELECT id, name, display_name, primary_color, tagline
      FROM gemeenten WHERE slug = ${slug} LIMIT 1
    `.catch(() => [])
    const row = rows[0]
    if (row) {
      gemeente = { id: row.id, name: row.name, displayName: row.display_name, primaryColor: row.primary_color, tagline: row.tagline }
      gid = row.id
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgWhere: any = gid ? { gemeenteId: gid } : undefined

  function estimateHours(h: number | null, status: string, startedAt: Date | null) {
    const hrs = h ?? 2
    if (status === "COMPLETED") return hrs * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
    if (!startedAt) return hrs * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
    const weeks = Math.min((Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000), IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS)
    return hrs * Math.max(weeks, 1)
  }

  const [
    totalVolunteers, totalOrganisations, totalVacancies,
    totalMatches, acceptedMatches, completedMatches,
    totalSwipes, likeSwipes, superLikeSwipes,
    checkIn12Count,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VOLUNTEER", status: "ACTIVE", onboarded: true } }),
    prisma.organisation.count({ where: { status: "APPROVED", ...(gid ? { gemeenteId: gid } : {}) } }),
    prisma.vacancy.count({ where: { status: "ACTIVE", organisation: orgWhere } }),
    prisma.match.count({ where: { vacancy: { organisation: orgWhere } } }),
    prisma.match.count({ where: { status: "ACCEPTED",  vacancy: { organisation: orgWhere } } }),
    prisma.match.count({ where: { status: "COMPLETED", vacancy: { organisation: orgWhere } } }),
    prisma.swipe.count(),
    prisma.swipe.count({ where: { direction: "LIKE" } }),
    prisma.swipe.count({ where: { direction: "SUPER_LIKE" } }),
    prisma.match.count({ where: { checkIn12SentAt: { not: null }, vacancy: { organisation: orgWhere } } }),
  ])

  // Active volunteers (last 90 days)
  const activeVolunteers = await (gid
    ? prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT u.id)::bigint as cnt FROM users u
        JOIN matches m ON m.volunteer_id=u.id JOIN vacancies v ON m.vacancy_id=v.id
        JOIN organisations o ON v.organisation_id=o.id
        WHERE u.role='VOLUNTEER' AND u.status='ACTIVE'
          AND m.status IN ('ACCEPTED','COMPLETED')
          AND m.started_at >= NOW() - INTERVAL '90 days'
          AND o.gemeente_id=${gid}
      `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)
    : prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(DISTINCT u.id)::bigint as cnt FROM users u JOIN matches m ON m.volunteer_id=u.id
        WHERE u.role='VOLUNTEER' AND u.status='ACTIVE'
          AND m.status IN ('ACCEPTED','COMPLETED')
          AND m.started_at >= NOW() - INTERVAL '90 days'
      `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)
  )

  // Hours + value
  const matchesWithData = await prisma.match.findMany({
    where: { status: { in: ["ACCEPTED","COMPLETED"] }, vacancy: { organisation: orgWhere } },
    select: { status: true, startedAt: true, vacancy: { select: { hours: true, categories: { select: { category: { select: { name: true } } } } } } },
  })

  let totalHours = 0
  for (const m of matchesWithData) totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  const economicValue  = totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  const sroiValue      = economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER
  const fulfilledMatches = acceptedMatches + completedMatches
  const matchAcceptRate  = totalMatches > 0 ? (fulfilledMatches / totalMatches) * 100 : 0
  const likeRate         = totalSwipes > 0 ? ((likeSwipes + superLikeSwipes) / totalSwipes) * 100 : 0
  const retentionWeek12  = acceptedMatches > 0 ? (checkIn12Count / acceptedMatches) * 100 : 0

  // SDG
  const sdgHours = new Map<number, number>()
  const sdgCount = new Map<number, number>()
  for (const m of matchesWithData) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const sdgSet = new Set<number>()
    for (const cat of cats) (CATEGORY_SDG_MAP[cat] ?? []).forEach((n) => sdgSet.add(n))
    const share = sdgSet.size > 0 ? h / sdgSet.size : 0
    for (const n of sdgSet) { sdgHours.set(n, (sdgHours.get(n) ?? 0) + share); sdgCount.set(n, (sdgCount.get(n) ?? 0) + 1) }
  }
  const sdgImpact = SDG_DEFINITIONS
    .filter((s) => sdgHours.has(s.number))
    .map((s) => ({ ...s, hours: Math.round(sdgHours.get(s.number) ?? 0), matchCount: sdgCount.get(s.number) ?? 0 }))
    .sort((a, b) => b.hours - a.hours)

  // Category
  const catHours = new Map<string, number>(); const catCount = new Map<string, number>()
  for (const m of matchesWithData) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const share = cats.length > 0 ? h / cats.length : 0
    for (const cat of cats) { catHours.set(cat, (catHours.get(cat) ?? 0) + share); catCount.set(cat, (catCount.get(cat) ?? 0) + 1) }
  }
  const categoryBreakdown = Array.from(catHours.entries())
    .map(([cat, hrs]) => ({ category: cat, hours: Math.round(hrs), count: catCount.get(cat) ?? 0, sdgs: CATEGORY_SDG_MAP[cat] ?? [] }))
    .sort((a, b) => b.hours - a.hours)

  // Monthly trend
  type MRow = { month: string; cnt: bigint }
  const [matchRows, acceptedRows] = await Promise.all([
    gid
      ? prisma.$queryRaw<MRow[]>`SELECT TO_CHAR(m.created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches m JOIN vacancies v ON m.vacancy_id=v.id JOIN organisations o ON v.organisation_id=o.id WHERE o.gemeente_id=${gid} AND m.created_at>=NOW()-INTERVAL '12 months' GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MRow[]>`SELECT TO_CHAR(created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches WHERE created_at>=NOW()-INTERVAL '12 months' GROUP BY month ORDER BY month`,
    gid
      ? prisma.$queryRaw<MRow[]>`SELECT TO_CHAR(m.started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches m JOIN vacancies v ON m.vacancy_id=v.id JOIN organisations o ON v.organisation_id=o.id WHERE o.gemeente_id=${gid} AND m.started_at>=NOW()-INTERVAL '12 months' AND m.status IN('ACCEPTED','COMPLETED') GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MRow[]>`SELECT TO_CHAR(started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches WHERE started_at>=NOW()-INTERVAL '12 months' AND status IN('ACCEPTED','COMPLETED') GROUP BY month ORDER BY month`,
  ]).catch(() => [[], []] as [MRow[], MRow[]])

  const monthMap = new Map<string, { month: string; total: number; accepted: number }>()
  for (const r of matchRows)    { if (!monthMap.has(r.month)) monthMap.set(r.month, { month: r.month, total: 0, accepted: 0 }); monthMap.get(r.month)!.total += Number(r.cnt) }
  for (const r of acceptedRows) { if (!monthMap.has(r.month)) monthMap.set(r.month, { month: r.month, total: 0, accepted: 0 }); monthMap.get(r.month)!.accepted += Number(r.cnt) }
  const monthlyTrend = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))

  return {
    gemeente: gemeente ?? { name: "Vrijwilligersmatch", displayName: "Platform", primaryColor: "#f97316", tagline: null },
    overview: {
      totalVolunteers, activeVolunteers, totalOrganisations, totalVacancies,
      totalMatches, acceptedMatches, completedMatches, fulfilledMatches,
      totalHours: Math.round(totalHours), economicValue: Math.round(economicValue), sroiValue: Math.round(sroiValue),
      matchAcceptRate: Math.round(matchAcceptRate), likeRate: Math.round(likeRate), retentionWeek12: Math.round(retentionWeek12),
    },
    sdgImpact, categoryBreakdown, monthlyTrend,
  }
}

// ── Format helpers ─────────────────────────────────────────────────────────────

function fEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000) return `€${Math.round(n / 1_000)}k`
  return `€${n}`
}
function fHours(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}k`
  return `${n}`
}
function monthShort(yyyymm: string) {
  const [y, m] = yyyymm.split("-")
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("nl-NL", { month: "short" })
}

// ── Components ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 mb-3">
      <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
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

export default async function ImpactPage() {
  const data = await getImpactData().catch(() => null)
  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Impact-data kon niet worden geladen.</p>
    </div>
  )

  const { gemeente, overview: d, sdgImpact, categoryBreakdown, monthlyTrend } = data
  const accent = gemeente.primaryColor
  const isOrange = accent === "#f97316" || !accent.includes("#6d") // use orange gradient when no gemeente

  // Gradient string
  const heroGradient = isOrange
    ? "linear-gradient(135deg, #f97316, #f59e0b)"
    : `linear-gradient(135deg, ${accent}, ${accent}cc)`

  const maxMonthTotal = Math.max(...monthlyTrend.map((m) => m.total), 1)
  const maxCatHours   = categoryBreakdown[0]?.hours ?? 1
  const maxSdgHours   = sdgImpact[0]?.hours ?? 1

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ background: heroGradient }}
            >
              {gemeente.displayName.charAt(0)}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-gray-900">{gemeente.name}</span>
              <span className="text-[10px] text-gray-400 font-medium">Impact Rapport {new Date().getFullYear()}</span>
            </div>
          </div>
          <Link
            href="/register"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
            style={{ background: heroGradient }}
          >
            Word vrijwilliger
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-10">

        {/* ── Hero stat card ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: heroGradient }}
        >
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "14px 14px" }} />
          <div className="relative">
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
              {gemeente.displayName} · Samen maken we verschil
            </p>
            {gemeente.tagline && (
              <p className="text-white/90 text-sm mb-4">{gemeente.tagline}</p>
            )}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Vrijwilligersuren", value: fHours(d.totalHours) + " uur" },
                { label: "Maatsch. waarde", value: fEur(d.economicValue) },
                { label: "Actieve vrijw.", value: String(d.activeVolunteers) },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold tabular-nums">{s.value}</p>
                  <p className="text-white/70 text-[10px] leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Kerngetallen ───────────────────────────────────────────── */}
        <SectionTitle icon={TrendingUp} title="Kerngetallen" sub="Totaaloverzicht in cijfers" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users,     label: "Vrijwilligers",    value: d.totalVolunteers, sub: `${d.activeVolunteers} actief (90d)` },
            { icon: Building2, label: "Organisaties",      value: d.totalOrganisations, sub: "geverifieerd" },
            { icon: HandHeart, label: "Vacatures",          value: d.totalVacancies, sub: "nu beschikbaar" },
            { icon: Heart,     label: "Matches",            value: d.fulfilledMatches, sub: `${d.matchAcceptRate}% acceptatie` },
            { icon: Clock,     label: "Vrijwilligersuren",  value: fHours(d.totalHours) + " uur", sub: "geschat totaal" },
            { icon: Coins,     label: "SROI-waarde",        value: fEur(d.sroiValue), sub: `×${IMPACT_CONSTANTS.SROI_MULTIPLIER} multiplier` },
          ].map(({ icon: Icon, label, value, sub }) => (
            <Card key={label} className="p-4">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </Card>
          ))}
        </div>

        {/* ── Matching kwaliteit ─────────────────────────────────────── */}
        <SectionTitle icon={Heart} title="Matching kwaliteit" />
        <Card>
          <StatRow label="Like-ratio" value={`${d.likeRate}%`} sub="van alle swipes is LIKE of SUPER LIKE" />
          <StatRow label="Match-acceptatie" value={`${d.matchAcceptRate}%`} sub={`${d.fulfilledMatches} van ${d.totalMatches} matches`} />
          <StatRow label="Retentie na 12 weken" value={`${d.retentionWeek12}%`} sub="vrijwilligers nog steeds actief" />
          <StatRow label="Afgeronde matches" value={String(d.completedMatches)} />
        </Card>

        {/* ── Trendgrafiek ───────────────────────────────────────────── */}
        {monthlyTrend.length > 0 && (
          <>
            <SectionTitle icon={TrendingUp} title="Groei per maand" sub="Laatste 12 maanden" />
            <Card className="p-4">
              <div className="flex items-end gap-1 h-28 mb-2">
                {monthlyTrend.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                    <div className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden" style={{ height: `${(m.total / maxMonthTotal) * 96}px`, minHeight: m.total > 0 ? 4 : 0, background: "#ffedd5" }}>
                      <div
                        className="w-full rounded-t-sm"
                        style={{ height: `${m.total > 0 ? (m.accepted / m.total) * 100 : 0}%`, minHeight: m.accepted > 0 ? 3 : 0, background: heroGradient }}
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-orange-100" />Nieuwe matches</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: heroGradient }} />Geaccepteerd</span>
              </div>
            </Card>
          </>
        )}

        {/* ── SDG bijdrage ────────────────────────────────────────────── */}
        {sdgImpact.length > 0 && (
          <>
            <SectionTitle icon={Sprout} title="SDG-bijdrage" sub="VN Duurzame Ontwikkelingsdoelstellingen" />
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

        {/* ── Impact per thema ────────────────────────────────────────── */}
        {categoryBreakdown.length > 0 && (
          <>
            <SectionTitle icon={HandHeart} title="Impact per thema" />
            <Card>
              {categoryBreakdown.slice(0, 6).map((c, i) => (
                <div key={c.category} className={`flex items-center gap-3 px-4 py-3 ${i < categoryBreakdown.slice(0,6).length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs font-medium text-gray-700 truncate pr-2">{c.category}</p>
                      <p className="text-xs font-bold text-gray-900 tabular-nums shrink-0">{c.hours} uur</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.hours / maxCatHours) * 100}%`, background: heroGradient }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ── SROI uitleg ─────────────────────────────────────────────── */}
        <SectionTitle icon={Coins} title="Maatschappelijke waarde" sub="Social Return on Investment (SROI)" />
        <Card>
          {[
            { step: "1", label: "Vrijwilligersuren", value: fHours(d.totalHours) + " uur", sub: "Geschat op basis van matches × uren/week × looptijd" },
            { step: "2", label: "Vervangingswaarde", value: fEur(d.economicValue), sub: `× €${IMPACT_CONSTANTS.HOURLY_VALUE_EUR}/uur (CBS 2024)` },
            { step: "3", label: "SROI-waarde", value: fEur(d.sroiValue), sub: `× ${IMPACT_CONSTANTS.SROI_MULTIPLIER} multiplier (Movisie / SVI)` },
          ].map(({ step, label, value, sub }, i, arr) => (
            <div key={step}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ background: heroGradient }}
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

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: heroGradient }}
        >
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "14px 14px" }} />
          <div className="relative">
            <p className="font-bold text-base mb-1">Maak ook impact in {gemeente.displayName}</p>
            <p className="text-white/80 text-sm mb-4">
              Word vrijwilliger en draag bij aan een warme buurt.
            </p>
            <div className="flex gap-2">
              <Link
                href="/register"
                className="flex items-center gap-1.5 bg-white text-sm font-semibold px-4 py-2.5 rounded-xl flex-1 justify-center"
                style={{ color: accent }}
              >
                <Heart className="w-4 h-4" />
                Word vrijwilliger
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Inloggen
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Link naar organisaties ─────────────────────────────────── */}
        <Link href="/login" className="block">
          <Card className="flex items-center justify-between px-4 py-3.5 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Organisatie aanmelden</p>
                <p className="text-xs text-gray-400">Vind de juiste vrijwilligers</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Card>
        </Link>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 pb-2">
          Bijgewerkt op {new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} ·
          CBS-methodiek · SVI SROI-standaard
        </p>

      </div>
    </div>
  )
}
