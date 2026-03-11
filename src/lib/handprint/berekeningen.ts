/**
 * Handprint berekeningslogica
 *
 * Berekent per organisatie:
 *  - Maatschappelijke waarde (vervangingswaarde + SROI)
 *  - Retentiescore (0–100)
 *  - SDG-scores (aanwezigheidskaart per SDG-nummer)
 *
 * Bronnen:
 *  - CBS 2024 vervangingswaarde vrijwilligerswerk: €15,38/uur
 *  - SROI-multiplier (Movisie / SVI): 4,2×
 *  - SDG-mapping op basis van CATEGORY_SDG_MAP (src/config/sdg.ts)
 */

import { IMPACT_CONSTANTS, CATEGORY_SDG_MAP } from "@/config/sdg"

// ── Motivatie-gewogen uurwaarde ───────────────────────────────────────────────

const SROI_MOTIVATIE_MULTIPLIER = {
  hoog_aligned: 1.4,  // gemiddelde match-score > 0.8
  gemiddeld:    1.0,
  laag_aligned: 0.7,  // gemiddelde match-score < 0.4
}

/**
 * Berekent de maatschappelijke waarde op basis van uren en gemiddelde match-score.
 * Een hoog gemotiveerde match levert meer waarde op dan een ongemotiveerde.
 */
export function berekenUurwaarde(
  totalHours: number,
  avgMatchScore: number,
): { vervangingswaarde: number; sroiWaarde: number } {
  const multiplier =
    avgMatchScore > 0.8
      ? SROI_MOTIVATIE_MULTIPLIER.hoog_aligned
      : avgMatchScore < 0.4
        ? SROI_MOTIVATIE_MULTIPLIER.laag_aligned
        : SROI_MOTIVATIE_MULTIPLIER.gemiddeld

  const effectiveHours = totalHours * multiplier
  const vervangingswaarde = Math.round(effectiveHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR)
  const sroiWaarde = Math.round(vervangingswaarde * IMPACT_CONSTANTS.SROI_MULTIPLIER)

  return { vervangingswaarde, sroiWaarde }
}

// ── Retentiescore ─────────────────────────────────────────────────────────────

/**
 * Retentiescore 0–100.
 * 80 punten op basis van actief/totaal-ratio + 20 punten looptijdbonus (max bij 12 maanden).
 */
export function berekenRetentieScore(
  activeMatches: number,
  completedMatches: number,
  avgDurationMonths: number,
): number {
  const total = activeMatches + completedMatches
  if (total === 0) return 0
  const retentieRatio = activeMatches / total
  const looptijdBonus = Math.min(avgDurationMonths / 12, 1) * 20
  return Math.round(retentieRatio * 80 + looptijdBonus)
}

// ── SDG-scores ────────────────────────────────────────────────────────────────

/**
 * Geeft een JSON-map terug van SDG-nummer → score (0.0–1.0).
 * Score is aanwezigheidsgebaseerd: als een categorie naar een SDG mapt, krijgt die SDG 1.0.
 * Toekomstige versie kan gewogen scores per categorie opnemen.
 */
export function berekenSDGScores(categoryNames: string[]): Record<string, number> {
  const scores: Record<number, number> = {}
  for (const cat of categoryNames) {
    const sdgs = CATEGORY_SDG_MAP[cat] ?? []
    for (const sdg of sdgs) {
      scores[sdg] = Math.max(scores[sdg] ?? 0, 1.0)
    }
  }
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [String(k), v]))
}

// ── Uurschatting per match ────────────────────────────────────────────────────

/**
 * Schat het aantal vrijwilligersuren voor een individuele match.
 * Gebaseerd op vacature-uren/week × geschatte looptijd.
 */
export function estimateMatchHours(
  hoursPerWeek: number | null,
  status: string,
  startedAt: Date | null,
): number {
  const h = hoursPerWeek ?? 2

  if (status === "COMPLETED") {
    return h * IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
  }

  if (!startedAt) {
    return h * IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
  }

  const weeksActive = Math.min(
    (Date.now() - startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
    IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS,
  )
  return h * Math.max(weeksActive, 1)
}

// ── Gemiddelde looptijd ───────────────────────────────────────────────────────

/**
 * Schat de gemiddelde looptijd in maanden voor een set matches.
 * Gebruikt `startedAt` en `updatedAt` (of now() voor actieve matches).
 */
export function berekenGemLooptijd(
  matches: { startedAt: Date | null; updatedAt: Date; status: string }[],
): number {
  const withStart = matches.filter((m) => m.startedAt !== null)
  if (withStart.length === 0) return 0

  const totalMonths = withStart.reduce((acc, m) => {
    const end = m.status === "ACCEPTED" ? new Date() : m.updatedAt
    const months = (end.getTime() - m.startedAt!.getTime()) / (30 * 24 * 60 * 60 * 1000)
    return acc + Math.max(months, 0)
  }, 0)

  return Math.round((totalMonths / withStart.length) * 10) / 10
}
