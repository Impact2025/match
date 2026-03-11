/**
 * /impact  —  Publieke impactpagina
 *
 * Gemeente-bewust via x-gemeente-slug header (gezet door proxy.ts).
 * Toont vrijwilligersuren, SDG-bijdrage, economische waarde en maandelijkse groei.
 */

export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"
import {
  Users, Building2, Heart, Clock, TrendingUp, Coins, Award, ArrowRight,
  Sprout, Globe, HandHeart,
} from "lucide-react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImpactData {
  gemeente: { name: string; displayName: string; primaryColor: string; tagline: string | null }
  overview: {
    totalVolunteers: number; activeVolunteers: number
    totalOrganisations: number; totalVacancies: number
    totalMatches: number; acceptedMatches: number; completedMatches: number
    likeRate: number; matchAcceptanceRate: number; retentionWeek12: number
    totalHours: number; economicValue: number; sroiValue: number
  }
  sdgImpact: {
    sdgNumber: number; sdgName: string; sdgNameNl: string
    color: string; emoji: string; matchCount: number
    estimatedHours: number; percentage: number
  }[]
  categoryBreakdown: {
    category: string; matchCount: number; estimatedHours: number; sdgs: number[]
  }[]
  monthlyTrend: {
    month: string; newMatches: number; acceptedMatches: number
    newVolunteers: number; estimatedHours: number
  }[]
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getImpactData(): Promise<ImpactData> {
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

  // Typed as `any`: Vercel Prisma client may not include gemeente fields in
  // OrganisationWhereInput when generated from an older schema snapshot.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgWhere: any = gid ? { gemeenteId: gid } : undefined

  function estimateHours(hoursPerWeek: number | null, status: string, startedAt: Date | null) {
    const h = hoursPerWeek ?? 2
    if (status === "COMPLETED") return h * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
    if (!startedAt) return h * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
    const weeks = Math.min(
      (Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
      IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS,
    )
    return h * Math.max(weeks, 1)
  }

  const [
    totalVolunteers, totalOrganisations, totalVacancies, totalMatches,
    acceptedMatches, completedMatches, totalSwipes, likeSwipes, superLikeSwipes,
    checkIn12Count, activeVolunteers, matchesWithCategories,
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
    gid
      ? prisma.$queryRaw<[{ cnt: bigint }]>`
          SELECT COUNT(DISTINCT u.id)::bigint as cnt
          FROM users u
          JOIN matches m ON m.volunteer_id = u.id
          JOIN vacancies v ON m.vacancy_id = v.id
          JOIN organisations o ON v.organisation_id = o.id
          WHERE u.role = 'VOLUNTEER' AND u.status = 'ACTIVE'
            AND m.status IN ('ACCEPTED','COMPLETED')
            AND m.started_at >= NOW() - INTERVAL '90 days'
            AND o.gemeente_id = ${gid}
        `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0)
      : prisma.$queryRaw<[{ cnt: bigint }]>`
          SELECT COUNT(DISTINCT u.id)::bigint as cnt
          FROM users u
          JOIN matches m ON m.volunteer_id = u.id
          WHERE u.role = 'VOLUNTEER' AND u.status = 'ACTIVE'
            AND m.status IN ('ACCEPTED','COMPLETED')
            AND m.started_at >= NOW() - INTERVAL '90 days'
        `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0),
    prisma.match.findMany({
      where: { status: { in: ["ACCEPTED","COMPLETED"] }, vacancy: { organisation: orgWhere } },
      select: {
        status: true, startedAt: true,
        vacancy: { select: { hours: true, categories: { select: { category: { select: { name: true } } } } } },
      },
    }),
  ])

  // Hours + economic value
  let totalHours = 0
  for (const m of matchesWithCategories) {
    totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  }
  const economicValue = totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  const sroiValue = economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER

  const likeRate = totalSwipes > 0 ? ((likeSwipes + superLikeSwipes) / totalSwipes) * 100 : 0
  const matchAcceptanceRate = totalMatches > 0 ? ((acceptedMatches + completedMatches) / totalMatches) * 100 : 0
  const retentionWeek12 = acceptedMatches > 0 ? (checkIn12Count / acceptedMatches) * 100 : 0

  // SDG impact
  const sdgHours = new Map<number, number>()
  const sdgMatches = new Map<number, number>()
  for (const m of matchesWithCategories) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const sdgSet = new Set<number>()
    for (const cat of cats) (CATEGORY_SDG_MAP[cat] ?? []).forEach((n) => sdgSet.add(n))
    const share = sdgSet.size > 0 ? h / sdgSet.size : 0
    for (const n of sdgSet) {
      sdgHours.set(n, (sdgHours.get(n) ?? 0) + share)
      sdgMatches.set(n, (sdgMatches.get(n) ?? 0) + 1)
    }
  }
  const totalSdgHours = Array.from(sdgHours.values()).reduce((a, b) => a + b, 0) || 1
  const sdgImpact = SDG_DEFINITIONS
    .filter((s) => sdgHours.has(s.number))
    .map((s) => ({
      sdgNumber: s.number, sdgName: s.name, sdgNameNl: s.nameNl,
      color: s.color, emoji: s.emoji,
      matchCount: sdgMatches.get(s.number) ?? 0,
      estimatedHours: Math.round(sdgHours.get(s.number) ?? 0),
      percentage: Math.round(((sdgHours.get(s.number) ?? 0) / totalSdgHours) * 100),
    }))
    .sort((a, b) => b.estimatedHours - a.estimatedHours)

  // Category breakdown
  const catHours = new Map<string, number>()
  const catMatches = new Map<string, number>()
  for (const m of matchesWithCategories) {
    const h = estimateHours(m.vacancy.hours, m.status, m.startedAt)
    const cats = m.vacancy.categories.map((c) => c.category.name)
    const share = cats.length > 0 ? h / cats.length : 0
    for (const cat of cats) {
      catHours.set(cat, (catHours.get(cat) ?? 0) + share)
      catMatches.set(cat, (catMatches.get(cat) ?? 0) + 1)
    }
  }
  const categoryBreakdown = Array.from(catHours.entries())
    .map(([cat, hrs]) => ({ category: cat, matchCount: catMatches.get(cat) ?? 0, estimatedHours: Math.round(hrs), sdgs: CATEGORY_SDG_MAP[cat] ?? [] }))
    .sort((a, b) => b.estimatedHours - a.estimatedHours)

  // Monthly trend
  type MonthRow = { month: string; cnt: bigint }
  const [matchRows, acceptedRows, volRows] = await Promise.all([
    gid
      ? prisma.$queryRaw<MonthRow[]>`SELECT TO_CHAR(m.created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches m JOIN vacancies v ON m.vacancy_id=v.id JOIN organisations o ON v.organisation_id=o.id WHERE o.gemeente_id=${gid} AND m.created_at>=NOW()-INTERVAL '12 months' GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MonthRow[]>`SELECT TO_CHAR(created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches WHERE created_at>=NOW()-INTERVAL '12 months' GROUP BY month ORDER BY month`,
    gid
      ? prisma.$queryRaw<MonthRow[]>`SELECT TO_CHAR(m.started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches m JOIN vacancies v ON m.vacancy_id=v.id JOIN organisations o ON v.organisation_id=o.id WHERE o.gemeente_id=${gid} AND m.started_at>=NOW()-INTERVAL '12 months' AND m.status IN('ACCEPTED','COMPLETED') GROUP BY month ORDER BY month`
      : prisma.$queryRaw<MonthRow[]>`SELECT TO_CHAR(started_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM matches WHERE started_at>=NOW()-INTERVAL '12 months' AND status IN('ACCEPTED','COMPLETED') GROUP BY month ORDER BY month`,
    prisma.$queryRaw<MonthRow[]>`SELECT TO_CHAR(created_at,'YYYY-MM') as month, COUNT(*)::bigint as cnt FROM users WHERE role='VOLUNTEER' AND created_at>=NOW()-INTERVAL '12 months' GROUP BY month ORDER BY month`,
  ]).catch(() => [[], [], []] as [MonthRow[], MonthRow[], MonthRow[]])

  const monthMap = new Map<string, { month: string; newMatches: number; acceptedMatches: number; newVolunteers: number; estimatedHours: number }>()
  const touch = (month: string) => { if (!monthMap.has(month)) monthMap.set(month, { month, newMatches: 0, acceptedMatches: 0, newVolunteers: 0, estimatedHours: 0 }); return monthMap.get(month)! }
  for (const r of matchRows)   touch(r.month).newMatches      += Number(r.cnt)
  for (const r of acceptedRows) { touch(r.month).acceptedMatches += Number(r.cnt); touch(r.month).estimatedHours += Number(r.cnt) * 3 * 4 }
  for (const r of volRows)     touch(r.month).newVolunteers    += Number(r.cnt)
  const monthlyTrend = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month))

  return {
    gemeente: gemeente ?? { name: "Vrijwilligersmatch", displayName: "Platform", primaryColor: "#7c3aed", tagline: null },
    overview: {
      totalVolunteers, activeVolunteers, totalOrganisations, totalVacancies,
      totalMatches, acceptedMatches, completedMatches,
      likeRate: Math.round(likeRate * 10) / 10,
      matchAcceptanceRate: Math.round(matchAcceptanceRate * 10) / 10,
      retentionWeek12: Math.round(retentionWeek12 * 10) / 10,
      totalHours: Math.round(totalHours), economicValue: Math.round(economicValue), sroiValue: Math.round(sroiValue),
    },
    sdgImpact, categoryBreakdown, monthlyTrend,
  }
}

// ── Formatting ────────────────────────────────────────────────────────────────

function formatEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000)     return `€${Math.round(n / 1_000).toLocaleString("nl")}.000`
  return `€${n.toLocaleString("nl")}`
}

function formatHours(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}k uur`
  return `${n.toLocaleString("nl")} uur`
}

function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split("-")
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleDateString("nl-NL", { month: "short" })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function SdgCard({ sdg, maxHours }: { sdg: ImpactData["sdgImpact"][0]; maxHours: number }) {
  const pct = maxHours > 0 ? Math.min((sdg.estimatedHours / maxHours) * 100, 100) : 0
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden relative">
      {/* Colored top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: sdg.color }} />
      <div className="flex items-start gap-3 mt-1">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: sdg.color }}
        >
          {sdg.sdgNumber}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SDG {sdg.sdgNumber}</p>
          <p className="text-sm font-semibold text-gray-800 leading-tight">{sdg.sdgNameNl}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: sdg.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{sdg.estimatedHours} uur bijgedragen</span>
          <span>{sdg.matchCount} match{sdg.matchCount !== 1 ? "es" : ""}</span>
        </div>
      </div>
    </div>
  )
}

function BarChart({
  data, accent,
}: {
  data: { label: string; value: number; sub?: string }[]
  accent: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate pr-2">{d.label}</span>
            <span className="text-gray-800 font-semibold tabular-nums shrink-0">{d.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: accent }}
            />
          </div>
          {d.sub && <p className="text-xs text-gray-400">{d.sub}</p>}
        </div>
      ))}
    </div>
  )
}

function TrendChart({
  data, accent,
}: {
  data: ImpactData["monthlyTrend"]
  accent: string
}) {
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-8">Nog geen trenddata beschikbaar</p>
  const maxMatches = Math.max(...data.map((d) => d.newMatches), 1)
  const maxAccepted = Math.max(...data.map((d) => d.acceptedMatches), 1)

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-6 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: accent + "60" }} /> Nieuwe matches</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: accent }} /> Geaccepteerd</span>
      </div>
      {/* Chart */}
      <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-6 relative">
        {data.map((d) => (
          <div key={d.month} className="flex flex-col items-center gap-0.5 flex-1 min-w-[28px] group">
            {/* Total bar (lighter) */}
            <div className="w-full flex flex-col items-center justify-end" style={{ height: "100%" }}>
              <div
                className="w-full rounded-t-sm relative"
                style={{
                  height: `${(d.newMatches / maxMatches) * 120}px`,
                  background: accent + "40",
                  maxHeight: "120px",
                }}
              >
                {/* Accepted overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                  style={{
                    height: `${(d.acceptedMatches / maxMatches) * 100}%`,
                    background: accent,
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 -rotate-45 origin-top-right mt-1 whitespace-nowrap">
              {monthLabel(d.month)}
            </span>
          </div>
        ))}
      </div>
      {/* New volunteers line data */}
      <div className="mt-2 flex gap-1.5 items-end h-12 overflow-x-auto">
        {data.map((d) => (
          <div key={d.month} className="flex-1 min-w-[28px] flex flex-col items-center justify-end" title={`${d.newVolunteers} nieuwe vrijwilligers`}>
            <div
              className="w-1.5 rounded-full bg-emerald-400"
              style={{ height: `${Math.max((d.newVolunteers / Math.max(...data.map((x) => x.newVolunteers), 1)) * 40, d.newVolunteers > 0 ? 4 : 0)}px` }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
        Groene stippen = nieuwe vrijwilligers per maand
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ImpactPage() {
  const d = await getImpactData().catch(() => null)

  if (!d) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Impact-data kon niet worden geladen.</p>
      </div>
    )
  }

  const { gemeente, overview, sdgImpact, categoryBreakdown, monthlyTrend } = d
  const accent = gemeente.primaryColor

  const fulfilledMatches = overview.acceptedMatches + overview.completedMatches
  const maxSdgHours = sdgImpact[0]?.estimatedHours ?? 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)` }}>
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-white">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Globe className="w-4 h-4" />
            <span>{gemeente.displayName} · Impact Rapport {currentYear}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Samen maken we<br />verschil in {gemeente.displayName}
          </h1>
          {gemeente.tagline && (
            <p className="text-white/80 text-lg mb-8">{gemeente.tagline}</p>
          )}

          {/* 3 hero stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[
              { label: "Vrijwilligersuren bijgedragen", value: formatHours(overview.totalHours), icon: "⏱️" },
              { label: "Maatschappelijke waarde", value: formatEur(overview.economicValue), icon: "💰" },
              { label: "Actieve vrijwilligers", value: overview.activeVolunteers.toLocaleString("nl"), icon: "❤️" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold tabular-nums">{s.value}</p>
                <p className="text-white/70 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* ── Kerngetallen ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Award} title="Kerngetallen" sub={`Totaaloverzicht van ${gemeente.name} in cijfers`} accent={accent} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <KpiCard label="Geregistreerde vrijwilligers" value={overview.totalVolunteers.toLocaleString("nl")} sub={`${overview.activeVolunteers} actief (laatste 90 dagen)`} icon={Users} accent={accent} />
            <KpiCard label="Aangesloten organisaties" value={overview.totalOrganisations.toLocaleString("nl")} sub="Geverifieerd & actief" icon={Building2} accent={accent} />
            <KpiCard label="Actieve vacatures" value={overview.totalVacancies.toLocaleString("nl")} sub="Nu beschikbaar" icon={HandHeart} accent={accent} />
            <KpiCard label="Matches gemaakt" value={fulfilledMatches.toLocaleString("nl")} sub={`${overview.totalMatches} totaal · ${overview.matchAcceptanceRate}% geaccepteerd`} icon={Heart} accent={accent} />
            <KpiCard label="Vrijwilligersuren" value={formatHours(overview.totalHours)} sub={`Geschat op basis van matchduur (CBS €${IMPACT_CONSTANTS.HOURLY_VALUE_EUR}/uur)`} icon={Clock} accent={accent} />
            <KpiCard label="SROI (maatschappelijke waarde)" value={formatEur(overview.sroiValue)} sub={`${IMPACT_CONSTANTS.SROI_MULTIPLIER}× multiplier (Movisie-methodiek)`} icon={Coins} accent={accent} />
          </div>
        </section>

        {/* ── Matching journey ──────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={TrendingUp} title="De matching journey" sub="Hoe vrijwilligers hun weg vinden van interesse naar impact" accent={accent} />
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {[
                { label: "Vacature bekeken", value: overview.totalVacancies, pct: 100, desc: "Actieve vacatures" },
                { label: "Interesse getoond (Like)", value: Math.round(overview.totalVacancies * (overview.likeRate / 100)) || 0, pct: overview.likeRate, desc: `${overview.likeRate}% like-ratio` },
                { label: "Match aangemaakt", value: overview.totalMatches, pct: overview.totalMatches > 0 ? (overview.totalMatches / (overview.totalVacancies || 1)) * 100 : 0, desc: "Van interesse naar gesprek" },
                { label: "Match geaccepteerd", value: fulfilledMatches, pct: overview.matchAcceptanceRate, desc: `${overview.matchAcceptanceRate}% acceptatierate` },
                { label: "Nog actief (12 wkn)", value: Math.round(fulfilledMatches * (overview.retentionWeek12 / 100)), pct: overview.retentionWeek12, desc: `${overview.retentionWeek12}% retentie` },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex md:flex-col items-center flex-1 gap-2 md:gap-0">
                  {/* Step box */}
                  <div className="flex-1 md:flex-none w-full text-center p-4">
                    <div
                      className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-2"
                      style={{ background: `${accent}${Math.round(40 + (i / (arr.length - 1)) * 215).toString(16).padStart(2, "0")}` }}
                    >
                      {step.value.toLocaleString("nl")}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                  {/* Arrow between steps */}
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 md:mx-auto md:my-1 rotate-90 md:rotate-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SDG Bijdrage ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={Sprout}
            title="Bijdrage aan Duurzame Ontwikkelingsdoelstellingen"
            sub="Vrijwilligerswerk in Heemstede draagt bij aan de VN 2030-agenda"
            accent={accent}
          />
          {sdgImpact.length === 0 ? (
            <p className="text-gray-400 text-sm mt-4">Nog geen matchdata beschikbaar voor SDG-koppeling.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {sdgImpact.map((sdg) => (
                  <SdgCard key={sdg.sdgNumber} sdg={sdg} maxHours={maxSdgHours} />
                ))}
              </div>
              <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-600">Methodiek:</strong> SDG-toewijzing op basis van de VN 2030-agenda
                  en de categorisering van vrijwilligerswerk (Movisie). De vrijwilligersuren worden evenredig verdeeld
                  over alle SDGs die een match raakt. Uren zijn schattingen op basis van vacature-uren × matchduur.
                </p>
              </div>
            </>
          )}
        </section>

        {/* ── Categorieën ───────────────────────────────────────────────── */}
        {categoryBreakdown.length > 0 && (
          <section>
            <SectionHeader icon={HandHeart} title="Impact per thema" sub="Vrijwilligersuren verdeeld over de maatschappelijke thema's" accent={accent} />
            <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <BarChart
                accent={accent}
                data={categoryBreakdown.slice(0, 8).map((c) => ({
                  label: c.category,
                  value: c.estimatedHours,
                  sub: `${c.matchCount} match${c.matchCount !== 1 ? "es" : ""} · SDG ${c.sdgs.join(", ")}`,
                }))}
              />
            </div>
          </section>
        )}

        {/* ── Maandelijkse groei ────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={TrendingUp} title="Maandelijkse groei" sub="Nieuwe matches en vrijwilligers in de afgelopen 12 maanden" accent={accent} />
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <TrendChart data={monthlyTrend} accent={accent} />
          </div>
        </section>

        {/* ── Economische impact uitleg ─────────────────────────────────── */}
        <section>
          <SectionHeader icon={Coins} title="Economische impact — SROI" sub="Hoe we de maatschappelijke waarde van vrijwilligerswerk berekenen" accent={accent} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1", title: "Vrijwilligersuren", value: formatHours(overview.totalHours),
                desc: `Geschat op basis van geaccepteerde matches × vacature-uren per week × looptijd`,
              },
              {
                step: "2", title: "Vervangingswaarde", value: formatEur(overview.economicValue),
                desc: `${formatHours(overview.totalHours)} × €${IMPACT_CONSTANTS.HOURLY_VALUE_EUR}/uur (CBS 2024 standaardtarief vrijwilligerswerk)`,
              },
              {
                step: "3", title: "SROI-waarde", value: formatEur(overview.sroiValue),
                desc: `${IMPACT_CONSTANTS.SROI_MULTIPLIER}× multiplier: voor elke €1 ingezet vrijwilligerswerk genereert de samenleving €${IMPACT_CONSTANTS.SROI_MULTIPLIER} aan brede welvaart (Movisie / Social Value International)`,
              },
            ].map((s) => (
              <div key={s.step} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: accent }}
                >
                  {s.step}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.title}</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums mb-2">{s.value}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section>
          <div
            className="rounded-3xl p-10 text-white text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)` }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: `radial-gradient(circle at 20px 20px, white 1px, transparent 0)`, backgroundSize: "40px 40px" }}
            />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-3">Maak ook impact in {gemeente.displayName}</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Word vrijwilliger en draag bij aan een warme, betrokken gemeenschap.
                Of voeg je organisatie toe en vind de juiste mensen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ color: accent }}
                >
                  <Heart className="w-4 h-4" />
                  Word vrijwilliger
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-white/40 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  Inloggen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Data is bijgewerkt op {new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}.
          Vrijwilligersuren zijn schattingen. SDG-mapping op basis van Movisie-categorisering.
          Economische waarde berekend conform CBS-methodiek en Social Value International (SVI) SROI-standaard.
        </p>
      </div>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, title, sub, accent,
}: { icon: React.ElementType; title: string; sub: string; accent: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${accent}18` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
