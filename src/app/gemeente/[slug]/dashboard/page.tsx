/**
 * /gemeente/[slug]/dashboard — Gemeente Dashboard (B2G product)
 *
 * Beschermd: toegankelijk voor ADMIN en GEMEENTE_ADMIN.
 * Toont geaggregeerde vrijwilligersdata voor gebruik in beleidsrapportages.
 */

export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Users, Building2, Clock, TrendingUp, Download, Sprout, BarChart3,
} from "lucide-react"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"
import { AiAssistant } from "@/components/ai/ai-assistant"

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatsData {
  gemeente: { name: string; displayName: string; primaryColor: string; tagline: string | null }
  kpis: {
    totaalOrganisaties: number
    totaalVacatures: number
    totaalMatches: number
    fulfilledMatches: number
    totalHours: number
    economicValue: number
    sroiValue: number
    retentionWeek12: number
    newMatchesThisMonth: number
  }
  sdgImpact: {
    sdgNumber: number; sdgNameNl: string; color: string; emoji: string; estimatedHours: number
  }[]
  monthlyTrend: { month: string; newMatches: number; acceptedMatches: number }[]
  organisaties: {
    id: string; name: string; slug: string; city: string | null
    categories: string[]
    handprint: {
      totaalUrenJaarlijks: number
      maatschappelijkeWaarde: number
      sroiWaarde: number
      retentieScore: number
      aantalActieveMatches: number
      laasteBerekening: string
    } | null
  }[]
}

// ── Formatting ────────────────────────────────────────────────────────────────

function formatEur(n: number) {
  if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000) return `€ ${Math.round(n / 1_000).toLocaleString("nl")}.000`
  return `€ ${n.toLocaleString("nl-NL")}`
}

function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split("-")
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("nl-NL", { month: "short" })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${accent}18` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SdgBar({
  sdg, maxHours,
}: {
  sdg: StatsData["sdgImpact"][0]
  maxHours: number
}) {
  const pct = maxHours > 0 ? Math.min((sdg.estimatedHours / maxHours) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: sdg.color }}
      >
        {sdg.sdgNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-700 font-medium truncate pr-2">{sdg.sdgNameNl}</span>
          <span className="text-gray-500 shrink-0">{sdg.estimatedHours} uur</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: sdg.color }} />
        </div>
      </div>
    </div>
  )
}

function TrendBars({ data }: { data: StatsData["monthlyTrend"] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400 py-6 text-center">Nog geen data</p>
  const maxVal = Math.max(...data.map((d) => d.newMatches), 1)
  return (
    <div className="flex items-end gap-1.5 h-32 overflow-x-auto pb-5">
      {data.map((d) => (
        <div key={d.month} className="flex flex-col items-center gap-0.5 flex-1 min-w-[28px]">
          <div className="w-full flex flex-col justify-end" style={{ height: "88px" }}>
            <div
              className="w-full rounded-t-sm bg-violet-100 relative"
              style={{ height: `${(d.newMatches / maxVal) * 88}px` }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-violet-500"
                style={{ height: `${d.newMatches > 0 ? (d.acceptedMatches / d.newMatches) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] text-gray-400 -rotate-45 origin-top-right whitespace-nowrap">
            {monthLabel(d.month)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GemeenteDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user?.id || !["ADMIN", "GEMEENTE_ADMIN"].includes(role)) {
    redirect("/login")
  }

  const { slug } = await params

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/gemeente/${slug}/stats`, { cache: "no-store" })

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Gemeente niet gevonden of data niet beschikbaar.</p>
          <Link href="/" className="text-violet-600 text-sm hover:underline">Terug naar home</Link>
        </div>
      </div>
    )
  }

  const data: StatsData = await res.json()
  const { gemeente, kpis, sdgImpact, monthlyTrend, organisaties } = data
  const accent = gemeente.primaryColor ?? "#7c3aed"
  const maxSdgHours = sdgImpact[0]?.estimatedHours ?? 1

  return (
    <div className="min-h-screen bg-gray-50">
      <TourLauncher tourId="gemeente" accentColor={accent} />
      <AiAssistant mode="gemeente-dashboard" color={accent} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              Gemeente Dashboard
            </p>
            <h1 className="text-xl font-bold text-gray-900">{gemeente.displayName}</h1>
            {gemeente.tagline && <p className="text-sm text-gray-500">{gemeente.tagline}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/api/gemeente/${slug}/export`}
              data-tour-id="export-btn"
              className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporteer CSV
            </Link>
            <Link
              href={`/impact?gemeente=${slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white transition-colors"
              style={{ background: accent }}
            >
              <TrendingUp className="w-4 h-4" />
              Publieke impactpagina
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* ── KPI kaarten ────────────────────────────────────────────────────── */}
        <section data-tour-id="gemeente-kpis">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Actieve vrijwilligersmatches"
              value={kpis.fulfilledMatches.toLocaleString("nl")}
              sub={`${kpis.newMatchesThisMonth} nieuwe deze maand`}
              icon={Users}
              accent={accent}
            />
            <KpiCard
              label="Maatschappelijke waarde"
              value={formatEur(kpis.economicValue)}
              sub={`SROI: ${formatEur(kpis.sroiValue)}`}
              icon={TrendingUp}
              accent={accent}
            />
            <KpiCard
              label="Retentie (12 weken)"
              value={`${kpis.retentionWeek12}%`}
              sub="Landelijk gemiddelde: ~54%"
              icon={Clock}
              accent={accent}
            />
            <KpiCard
              label="Aangesloten organisaties"
              value={kpis.totaalOrganisaties.toLocaleString("nl")}
              sub={`${kpis.totaalVacatures} actieve vacatures`}
              icon={Building2}
              accent={accent}
            />
          </div>
        </section>

        {/* ── SDG + Trend (2 kolommen) ─────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SDG bijdrage */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm" data-tour-id="sdg-bijdrage">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">SDG bijdrage</h2>
            </div>
            {sdgImpact.length === 0 ? (
              <p className="text-sm text-gray-400">Nog geen matchdata voor SDG-koppeling.</p>
            ) : (
              <div className="space-y-4">
                {sdgImpact.slice(0, 8).map((sdg) => (
                  <SdgBar key={sdg.sdgNumber} sdg={sdg} maxHours={maxSdgHours} />
                ))}
                <p className="text-xs text-gray-400 pt-2">
                  Zo draagt vrijwilligerswerk in {gemeente.displayName} bij aan de nationale SDG-doelstellingen.
                  SDG-koppeling op basis van organisatiecategorie (Movisie-methodiek).
                </p>
              </div>
            )}
          </div>

          {/* Maandelijkse trend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm" data-tour-id="trend-chart">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-900">Matches per maand</h2>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-violet-100 inline-block" /> Nieuwe matches
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" /> Geaccepteerd
              </span>
            </div>
            <TrendBars data={monthlyTrend} />
            <p className="text-xs text-gray-400 mt-2">
              Landelijk gemiddelde retentie (12 wkn): <strong>54%</strong>
            </p>
          </div>
        </section>

        {/* ── Organisatietabel ─────────────────────────────────────────────── */}
        <section data-tour-id="org-table">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Organisaties</h2>
              <p className="text-sm text-gray-500">{organisaties.length} geregistreerd in {gemeente.displayName}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Organisatie", "Categorieën", "Uren/jaar", "Waarde", "Retentie", "Actieve matches"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {organisaties.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/organisaties/${org.slug}`}
                          className="font-medium text-gray-900 hover:text-violet-600 transition-colors"
                        >
                          {org.name}
                        </Link>
                        {org.city && (
                          <p className="text-xs text-gray-400">{org.city}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {org.categories.slice(0, 2).map((c) => (
                            <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">
                        {org.handprint ? org.handprint.totaalUrenJaarlijks.toLocaleString("nl") : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-gray-900">
                        {org.handprint ? formatEur(org.handprint.maatschappelijkeWaarde) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {org.handprint ? (
                          <span
                            className="inline-flex items-center font-semibold tabular-nums text-xs"
                            style={{
                              color: org.handprint.retentieScore >= 70 ? "#16a34a"
                                : org.handprint.retentieScore >= 40 ? "#d97706" : "#dc2626",
                            }}
                          >
                            {Math.round(org.handprint.retentieScore)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">
                        {org.handprint?.aantalActieveMatches ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {organisaties.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">
                Nog geen organisaties geregistreerd.
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
