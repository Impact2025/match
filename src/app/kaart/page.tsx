/**
 * /kaart — Interactieve impactkaart
 *
 * Publiek toegankelijk. Toont alle organisaties met hun impact als gekleurde markers.
 * Leaflet wordt altijd client-side geladen via dynamic import.
 */

import { headers } from "next/headers"
import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, TrendingUp } from "lucide-react"
import type { KaartOrg } from "@/components/kaart/ImpactKaart"
import { KaartClient } from "./KaartClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Impactkaart — Vrijwilligersmatch",
  description: "Ontdek de maatschappelijke impact van vrijwilligerswerk in jouw regio op onze interactieve kaart.",
}

async function getKaartData(gemeenteSlug: string | null): Promise<KaartOrg[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const url = new URL("/api/kaart/organisaties", baseUrl)
  if (gemeenteSlug) url.searchParams.set("gemeente", gemeenteSlug)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return res.json()
}

export default async function KaartPage({
  searchParams,
}: {
  searchParams: Promise<{ gemeente?: string }>
}) {
  const hdrs = await headers()
  const slugFromHeader = hdrs.get("x-gemeente-slug")
  const { gemeente: slugFromParam } = await searchParams
  const gemeenteSlug = slugFromParam ?? slugFromHeader ?? null

  const orgs = await getKaartData(gemeenteSlug)

  // Top 5 op retentiescore
  const top5 = [...orgs]
    .filter((o) => o.handprint !== null)
    .sort((a, b) => (b.handprint?.retentieScore ?? 0) - (a.handprint?.retentieScore ?? 0))
    .slice(0, 5)

  const formatEur = (n: number) => {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
    if (n >= 1_000) return `€${Math.round(n / 1_000).toLocaleString("nl")}.000`
    return `€${n.toLocaleString("nl-NL")}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Impact in jouw regio</h1>
              <p className="text-sm text-gray-500">
                {orgs.length} organisatie{orgs.length !== 1 ? "s" : ""} op de kaart
              </p>
            </div>
          </div>

          <Link
            href="/impact"
            className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            Volledig impactrapport
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Kaart ─────────────────────────────────────────────────────── */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100" style={{ minHeight: 520 }}>
            <KaartClient orgs={orgs} />
          </div>

          {/* ── Sidebar: top 5 ────────────────────────────────────────────── */}
          <div className="lg:w-72 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Top retentie
              </h2>

              {top5.length === 0 ? (
                <p className="text-sm text-gray-400">Nog geen data beschikbaar.</p>
              ) : (
                <ol className="space-y-3">
                  {top5.map((org, i) => {
                    const score = org.handprint?.retentieScore ?? 0
                    const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f97316" : "#ef4444"
                    return (
                      <li key={org.id} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/organisaties/${org.slug}`}
                            className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors truncate block"
                          >
                            {org.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs font-bold"
                              style={{ color }}
                            >
                              {Math.round(score)}% retentie
                            </span>
                            {org.handprint && (
                              <span className="text-xs text-gray-400">
                                {formatEur(org.handprint.waarde)}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>

            {/* Legenda */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Markerkleur</h2>
              <div className="space-y-2">
                {[
                  { color: "#22c55e", label: "Uitstekend (≥ 70%)" },
                  { color: "#f97316", label: "Gemiddeld (40–70%)" },
                  { color: "#ef4444", label: "Aandacht nodig (< 40%)" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0"
                      style={{ background: color }}
                    />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Retentiescore = % vrijwilligers dat langer dan 6 maanden actief blijft.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
