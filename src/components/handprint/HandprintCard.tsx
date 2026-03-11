/**
 * HandprintCard — visuele impactkaart per organisatie.
 *
 * Server component. Geeft:
 *  - Maatschappelijke waarde (groot getal)
 *  - SDG badges
 *  - Retentie gauge (halve cirkel SVG)
 *  - Motivatiebar (gestapelde horizontale balk)
 */

import { getSdgsByNumbers } from "@/config/sdg"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HandprintData {
  totaalUrenJaarlijks:    number
  maatschappelijkeWaarde: number
  sroiWaarde:             number
  retentieScore:          number
  aantalActieveMatches:   number
  aantalAfgerondMatches:  number
  sdgScores:              Record<string, number> | null
  dominantMotivatie:      string | null
  motivatieDistributie:   Record<string, number> | null
  laasteBerekening:       Date | string
}

interface Props {
  handprint: HandprintData
  accent?: string
  compact?: boolean
}

// ── Retention gauge (SVG half-circle) ─────────────────────────────────────────

function RetentieGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#22c55e" :
    score >= 40 ? "#f97316" : "#ef4444"

  // Semi-circle path from (10,50) to (90,50) with radius 40
  const circumference = Math.PI * 40 // ≈ 125.66
  const filled = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="58" viewBox="0 0 100 58" aria-label={`Retentiescore: ${score}%`}>
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="15" fontWeight="700" fill="#111827">
          {score}%
        </text>
      </svg>
      <p className="text-xs text-gray-500 -mt-1">Retentiescore</p>
    </div>
  )
}

// ── Motivatie stacked bar ──────────────────────────────────────────────────────

const VFI_COLORS: Record<string, string> = {
  waarden:     "#7c3aed",
  begrip:      "#2563eb",
  sociaal:     "#16a34a",
  loopbaan:    "#d97706",
  bescherming: "#dc2626",
  verbetering: "#db2777",
}

const VFI_LABELS: Record<string, string> = {
  waarden:     "Waarden",
  begrip:      "Begrip",
  sociaal:     "Sociaal",
  loopbaan:    "Loopbaan",
  bescherming: "Bescherming",
  verbetering: "Verbetering",
}

function MotivatieBalk({ distributie }: { distributie: Record<string, number> }) {
  const total = Object.values(distributie).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const sorted = Object.entries(distributie)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden w-full">
        {sorted.map(([key, val]) => (
          <div
            key={key}
            style={{
              width: `${(val / total) * 100}%`,
              background: VFI_COLORS[key] ?? "#9ca3af",
            }}
            title={`${VFI_LABELS[key] ?? key}: ${Math.round((val / total) * 100)}%`}
          />
        ))}
      </div>
      {/* Legend for top 3 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {sorted.slice(0, 3).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: VFI_COLORS[key] ?? "#9ca3af" }}
            />
            {VFI_LABELS[key] ?? key} {Math.round((val / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function HandprintCard({ handprint, accent = "#7c3aed", compact = false }: Props) {
  const {
    totaalUrenJaarlijks,
    maatschappelijkeWaarde,
    sroiWaarde,
    retentieScore,
    sdgScores,
    dominantMotivatie,
    motivatieDistributie,
    laasteBerekening,
  } = handprint

  // Format currency Dutch-style
  const formatEur = (n: number) => {
    if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
    if (n >= 1_000) return `€ ${Math.round(n / 1_000).toLocaleString("nl")}.000`
    return `€ ${n.toLocaleString("nl-NL")}`
  }

  // SDG badges from sdgScores
  const sdgNumbers = sdgScores
    ? Object.entries(sdgScores)
        .filter(([, score]) => score > 0)
        .map(([num]) => Number(num))
        .sort((a, b) => a - b)
    : []
  const sdgDefs = getSdgsByNumbers(sdgNumbers)

  const berekenDatum = new Date(laasteBerekening)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }} />

      <div className="p-6 space-y-6">

        {/* ── Economische waarde ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Maatschappelijke waarde dit jaar
          </p>
          <p className="text-4xl font-bold text-gray-900 tabular-nums">
            {formatEur(maatschappelijkeWaarde)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {totaalUrenJaarlijks.toLocaleString("nl")} vrijwilligersuren ×{" "}
            <span className="font-medium">€15,38/uur</span>{" "}
            <span className="text-gray-400">(CBS 2024 vervangingswaarde)</span>
          </p>
          {!compact && (
            <p className="text-xs text-gray-400 mt-1">
              SROI-waarde: {formatEur(sroiWaarde)}{" "}
              <span title="Social Return on Investment: elke €1 aan vrijwilligerswerk genereert €4,20 maatschappelijke brede welvaart (Movisie/SVI-methodiek)">
                · 4,2× multiplier
              </span>
            </p>
          )}
        </div>

        {/* ── Retentie + SDG badges ─────────────────────────────────────────── */}
        <div className={`flex gap-6 ${compact ? "flex-col" : "flex-col sm:flex-row items-start"}`}>
          <RetentieGauge score={Math.round(retentieScore)} />

          {sdgDefs.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                SDG-bijdrage
                <span className="ml-1 text-gray-300 font-normal normal-case">
                  (indicatief, MAEX-methodologie)
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sdgDefs.map((sdg) => (
                  <span
                    key={sdg.number}
                    className="inline-flex items-center gap-1 text-white text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: sdg.color }}
                    title={sdg.description}
                  >
                    {sdg.number} {sdg.nameNl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Motivatieprofiel ──────────────────────────────────────────────── */}
        {!compact && motivatieDistributie && Object.keys(motivatieDistributie).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Vrijwilligersmotivatie
              {dominantMotivatie && (
                <span className="ml-2 text-gray-500 normal-case font-normal">
                  — dominant: <strong className="text-gray-700">{VFI_LABELS[dominantMotivatie] ?? dominantMotivatie}</strong>
                </span>
              )}
            </p>
            <MotivatieBalk distributie={motivatieDistributie} />
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <p className="text-xs text-gray-300 pt-2 border-t border-gray-50">
          Berekend op{" "}
          {berekenDatum.toLocaleDateString("nl-NL", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>
    </div>
  )
}
