/**
 * /admin/impact  —  Admin impactrapportage
 *
 * Gedetailleerd overzicht voor gemeentebeheerders:
 *  - Alle gemeenten naast elkaar
 *  - SROI-breakdown
 *  - SDG-overzicht
 *  - Export-aanwijzingen
 */

export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"
import {
  Globe, TrendingUp, Coins, Award, Users, Building2, Heart, Clock,
  CheckCircle, AlertCircle, BarChart2, Leaf,
} from "lucide-react"

// ── Data ──────────────────────────────────────────────────────────────────────

function estimateHours(h: number | null, status: string, startedAt: Date | null): number {
  const hrs = h ?? 2
  if (status === "COMPLETED") return hrs * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
  if (!startedAt) return hrs * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
  const weeks = Math.min((Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000), IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS)
  return hrs * Math.max(weeks, 1)
}

async function getAdminImpact() {
  const [
    totalVolunteers, activeVolunteers, totalOrgs, totalVacancies,
    totalMatches, acceptedMatches, completedMatches, totalSwipes, likeSwipes, superLikeSwipes,
    checkIn1, checkIn4, checkIn12,
    gemeentenRaw,
    matchesWithCategories,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VOLUNTEER", status: "ACTIVE", onboarded: true } }),
    prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(DISTINCT u.id)::bigint as cnt
      FROM users u
      JOIN matches m ON m.volunteer_id = u.id
      WHERE u.role = 'VOLUNTEER' AND u.status = 'ACTIVE'
        AND m.status IN ('ACCEPTED','COMPLETED')
        AND m.started_at >= NOW() - INTERVAL '90 days'
    `.then((r) => Number(r[0]?.cnt ?? 0)).catch(() => 0),
    prisma.organisation.count({ where: { status: "APPROVED" } }),
    prisma.vacancy.count({ where: { status: "ACTIVE" } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "ACCEPTED" } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.swipe.count(),
    prisma.swipe.count({ where: { direction: "LIKE" } }),
    prisma.swipe.count({ where: { direction: "SUPER_LIKE" } }),
    prisma.match.count({ where: { checkIn1SentAt: { not: null } } }),
    prisma.match.count({ where: { checkIn4SentAt: { not: null } } }),
    prisma.match.count({ where: { checkIn12SentAt: { not: null } } }),
    prisma.$queryRaw<{
      gemeente_id: string; gemeente_name: string; display_name: string
      primary_color: string; slug: string; org_id: string | null
      org_name: string | null; vac_id: string | null; vac_hours: number | null
      match_status: string | null
    }[]>`
      SELECT
        g.id          AS gemeente_id,
        g.name        AS gemeente_name,
        g.display_name,
        g.primary_color,
        g.slug,
        o.id          AS org_id,
        o.name        AS org_name,
        v.id          AS vac_id,
        v.hours       AS vac_hours,
        m.status      AS match_status
      FROM gemeenten g
      LEFT JOIN organisations o ON o.gemeente_id = g.id AND o.status = 'APPROVED'
      LEFT JOIN vacancies v     ON v.organisation_id = o.id AND v.status = 'ACTIVE'
      LEFT JOIN matches m       ON m.vacancy_id = v.id AND m.status IN ('ACCEPTED','COMPLETED')
      ORDER BY g.id
    `.catch(() => []),
    prisma.match.findMany({
      where: { status: { in: ["ACCEPTED","COMPLETED"] } },
      select: {
        status: true, startedAt: true,
        vacancy: { select: { hours: true, categories: { select: { category: { select: { name: true } } } } } },
      },
    }),
  ])

  // Platform-wide hours
  let totalHours = 0
  for (const m of matchesWithCategories) totalHours += estimateHours(m.vacancy.hours, m.status, m.startedAt)
  const economicValue = totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  const sroiValue = economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER

  // Retention rates
  const fulfilledMatches = acceptedMatches + completedMatches
  const matchAcceptanceRate = totalMatches > 0 ? (fulfilledMatches / totalMatches) * 100 : 0
  const likeRate = totalSwipes > 0 ? ((likeSwipes + superLikeSwipes) / totalSwipes) * 100 : 0
  const retentionWeek12 = acceptedMatches > 0 ? (checkIn12 / acceptedMatches) * 100 : 0

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
  const sdgImpact = SDG_DEFINITIONS
    .filter((s) => sdgHours.has(s.number))
    .map((s) => ({
      ...s,
      hours: Math.round(sdgHours.get(s.number) ?? 0),
      matchCount: sdgMatches.get(s.number) ?? 0,
    }))
    .sort((a, b) => b.hours - a.hours)

  // Per-gemeente stats — aggregate flat raw rows
  type GStatAcc = {
    name: string; displayName: string; primaryColor: string; slug: string
    orgs: Set<string>; vacancies: Set<string>; hours: number; matches: number
  }
  const gMap = new Map<string, GStatAcc>()
  const gemeenten = Array.isArray(gemeentenRaw) ? gemeentenRaw : []
  for (const row of gemeenten) {
    if (!gMap.has(row.gemeente_id)) {
      gMap.set(row.gemeente_id, {
        name: row.gemeente_name, displayName: row.display_name,
        primaryColor: row.primary_color, slug: row.slug,
        orgs: new Set(), vacancies: new Set(), hours: 0, matches: 0,
      })
    }
    const g = gMap.get(row.gemeente_id)!
    if (row.org_id) g.orgs.add(row.org_id)
    if (row.vac_id) g.vacancies.add(row.vac_id)
    if (row.match_status) {
      g.hours += estimateHours(row.vac_hours, row.match_status, null)
      g.matches++
    }
  }
  const gemeenteStats = Array.from(gMap.entries()).map(([id, g]) => ({
    id, name: g.name, displayName: g.displayName,
    primaryColor: g.primaryColor, slug: g.slug,
    orgs: g.orgs.size, vacancies: g.vacancies.size, matches: g.matches,
    hours: Math.round(g.hours),
    economicValue: Math.round(g.hours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR),
  })).sort((a, b) => b.matches - a.matches)

  return {
    overview: {
      totalVolunteers, activeVolunteers, totalOrgs, totalVacancies,
      totalMatches, acceptedMatches, completedMatches, fulfilledMatches,
      totalSwipes, likeSwipes, superLikeSwipes,
      checkIn1, checkIn4, checkIn12,
      totalHours: Math.round(totalHours),
      economicValue: Math.round(economicValue),
      sroiValue: Math.round(sroiValue),
      matchAcceptanceRate: Math.round(matchAcceptanceRate * 10) / 10,
      likeRate: Math.round(likeRate * 10) / 10,
      retentionWeek12: Math.round(retentionWeek12 * 10) / 10,
    },
    sdgImpact,
    gemeenteStats,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function eur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(2).replace(".", ",")} mln`
  if (n >= 1_000) return `€${Math.round(n / 1_000).toLocaleString("nl")}.000`
  return `€${n.toLocaleString("nl")}`
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-100 rounded-xl p-6 shadow-sm ${className}`}>{children}</div>
}

function Metric({ label, value, sub, ok }: { label: string; value: string | number; sub?: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        {ok !== undefined && (
          ok
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <AlertCircle className="w-4 h-4 text-amber-500" />
        )}
        <span className="text-sm font-semibold text-gray-900 tabular-nums">{value}</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminImpactPage() {
  const { overview: d, sdgImpact, gemeenteStats } = await getAdminImpact().catch(() => ({
    overview: {
      totalVolunteers: 0, activeVolunteers: 0, totalOrgs: 0, totalVacancies: 0,
      totalMatches: 0, acceptedMatches: 0, completedMatches: 0, fulfilledMatches: 0,
      totalSwipes: 0, likeSwipes: 0, superLikeSwipes: 0,
      checkIn1: 0, checkIn4: 0, checkIn12: 0,
      totalHours: 0, economicValue: 0, sroiValue: 0,
      matchAcceptanceRate: 0, likeRate: 0, retentionWeek12: 0,
    },
    sdgImpact: [] as { number: number; nameNl: string; color: string; emoji: string; hours: number; matchCount: number }[],
    gemeenteStats: [] as { id: string; name: string; displayName: string; primaryColor: string; slug: string; orgs: number; vacancies: number; matches: number; hours: number; economicValue: number }[],
  }))

  const maxSdgHours = sdgImpact[0]?.hours ?? 1

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Impactmeting</h1>
          <p className="text-gray-400 text-sm mt-1">
            Maatschappelijke waarde, SDG-bijdrage en retentie — platform-breed
          </p>
        </div>
        <a
          href="/api/impact"
          target="_blank"
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          JSON export ↗
        </a>
      </div>

      {/* ── Toplevel KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Vrijwilligersuren", value: d.totalHours.toLocaleString("nl") + " uur", icon: Clock, color: "violet" },
          { label: "Maatschappelijke waarde", value: eur(d.economicValue), icon: Coins, color: "emerald" },
          { label: "SROI (×" + IMPACT_CONSTANTS.SROI_MULTIPLIER + ")", value: eur(d.sroiValue), icon: TrendingUp, color: "blue" },
          { label: "Match-acceptatie", value: d.matchAcceptanceRate + "%", icon: Heart, color: "pink" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
            <div className={`w-9 h-9 rounded-lg bg-${color}-50 border border-${color}-100 flex items-center justify-center`}>
              <Icon className={`w-4 h-4 text-${color}-500`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Vrijwilligers & bereik ────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 text-sm">Vrijwilligers & bereik</h2>
          </div>
          <Metric label="Geregistreerde vrijwilligers" value={d.totalVolunteers.toLocaleString("nl")} />
          <Metric label="Actief (laatste 90 dagen)" value={d.activeVolunteers.toLocaleString("nl")} ok={d.activeVolunteers > 0} />
          <Metric label="Aangesloten organisaties" value={d.totalOrgs.toLocaleString("nl")} />
          <Metric label="Actieve vacatures" value={d.totalVacancies.toLocaleString("nl")} />
          <Metric label="Like-ratio" value={d.likeRate + "%"} sub="% van swipes is LIKE/SUPER_LIKE" ok={d.likeRate > 40} />
        </Card>

        {/* ── Matching kwaliteit ────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 text-sm">Matching kwaliteit</h2>
          </div>
          <Metric label="Matches totaal" value={d.totalMatches.toLocaleString("nl")} />
          <Metric label="Geaccepteerd + afgerond" value={d.fulfilledMatches.toLocaleString("nl")} ok={d.fulfilledMatches > 0} />
          <Metric label="Acceptatierate" value={d.matchAcceptanceRate + "%"} ok={d.matchAcceptanceRate > 50} />
          <Metric label="Retentie week 12" value={d.retentionWeek12 + "%"} sub="check-ins verstuurd t.o.v. geaccepteerde matches" ok={d.retentionWeek12 > 50} />
          <Metric label="Check-in week 1" value={d.checkIn1.toLocaleString("nl")} />
          <Metric label="Check-in week 4" value={d.checkIn4.toLocaleString("nl")} />
          <Metric label="Check-in week 12" value={d.checkIn12.toLocaleString("nl")} />
        </Card>

        {/* ── SROI berekening ───────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 text-sm">SROI-berekening</h2>
          </div>
          <Metric label="Totale vrijwilligersuren" value={d.totalHours.toLocaleString("nl") + " uur"} sub="Geschat: matches × uren/week × looptijd" />
          <Metric label="Vervangingswaarde (CBS 2024)" value={eur(d.economicValue)} sub={`€${IMPACT_CONSTANTS.HOURLY_VALUE_EUR}/uur`} />
          <Metric label="SROI-multiplier" value={"×" + IMPACT_CONSTANTS.SROI_MULTIPLIER} sub="Movisie / Social Value International" />
          <Metric label="Totale maatschappelijke waarde" value={eur(d.sroiValue)} ok={d.sroiValue > 0} />
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 leading-relaxed">
              SROI-methodiek: voor elke €1 ingezet als vrijwilligerswaarde wordt €{IMPACT_CONSTANTS.SROI_MULTIPLIER}
              aan maatschappelijke baten gecreëerd (verminderde eenzaamheid, zorgkosten, sociale cohesie).
              Conform SVI Principles of Social Value (2012, revisie 2023).
            </p>
          </div>
        </Card>

        {/* ── SDG bijdrage ─────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4 text-green-500" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 text-sm">SDG-bijdrage (top 6)</h2>
          </div>
          {sdgImpact.length === 0 ? (
            <p className="text-gray-400 text-sm">Nog geen matchdata voor SDG-koppeling.</p>
          ) : (
            <div className="space-y-3">
              {sdgImpact.slice(0, 6).map((s) => (
                <div key={s.number} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded text-white text-[10px] font-bold flex items-center justify-center" style={{ background: s.color }}>
                        {s.number}
                      </span>
                      <span className="text-gray-600">{s.nameNl}</span>
                    </span>
                    <span className="text-gray-500 font-semibold tabular-nums">{s.hours} uur</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.hours / maxSdgHours) * 100}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <a href="/impact" target="_blank" className="mt-4 inline-block text-xs text-violet-600 hover:underline">
            Publieke impactpagina bekijken ↗
          </a>
        </Card>
      </div>

      {/* ── Gemeenten vergelijking ─────────────────────────────────────── */}
      {gemeenteStats.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 text-sm">Gemeenten — vergelijkend overzicht</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Gemeente", "Organisaties", "Vacatures", "Matches", "Uren (geschat)", "Econ. waarde"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gemeenteStats.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.primaryColor }} />
                        <div>
                          <p className="font-medium text-gray-800">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.displayName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 tabular-nums">{g.orgs}</td>
                    <td className="py-3 px-3 text-gray-600 tabular-nums">{g.vacancies}</td>
                    <td className="py-3 px-3 text-gray-600 tabular-nums">{g.matches}</td>
                    <td className="py-3 px-3 text-gray-600 tabular-nums">{g.hours.toLocaleString("nl")} uur</td>
                    <td className="py-3 px-3 text-gray-600 tabular-nums font-semibold">{eur(g.economicValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Economische waarde = geschatte uren × €{IMPACT_CONSTANTS.HOURLY_VALUE_EUR} (CBS 2024).
            Alleen ACCEPTED + COMPLETED matches worden meegeteld.
          </p>
        </Card>
      )}

      {/* ── Exporteren ────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <h2 className="font-semibold text-gray-900 text-sm">Data exporteren</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Platform-breed (JSON)", url: "/api/impact", desc: "Alle metrics, machine-leesbaar" },
            { label: "Heemstede (JSON)", url: "/api/impact?gemeente=heemstede", desc: "Alleen gemeente Heemstede" },
            { label: "Publieke impactpagina", url: "/impact", desc: "Deelbaar met gemeente & pers" },
          ].map((e) => (
            <a
              key={e.url}
              href={e.url}
              target="_blank"
              className="flex flex-col gap-1 border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{e.label}</span>
              <span className="text-xs text-gray-400">{e.desc}</span>
            </a>
          ))}
        </div>
      </Card>

    </div>
  )
}
