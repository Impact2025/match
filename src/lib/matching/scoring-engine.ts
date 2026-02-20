/**
 * Scoring Engine — Vrijwilligersmatch.nl
 *
 * Formula:
 *   total = (
 *     motivationScore × 0.40   ← VFI cosine similarity + category interest overlap
 *     + distanceScore   × 0.30   ← Haversine + remote bonus
 *     + skillScore      × 0.20   ← Skill overlap (was missing entirely before)
 *     + freshnessScore  × 0.10   ← Recency (60-day window)
 *   ) × fairnessWeight             ← Small-org boost [0.70 – 1.40]
 *
 * All component scores are in [0, 100].
 * The final total is capped at 100 and rounded to one decimal.
 */

import { cosineSimilarity, haversineKm } from "./vector-math"
import {
  categoryVFIVector, parseMotivationProfile, vfiToVector, VFIProfile,
  categorySchwartzVector, parseSchwartzProfile, schwartzToVector,
} from "./category-vfi"

// ─── Weights ──────────────────────────────────────────────────────────────────

const W_MOTIVATION = 0.40
const W_DISTANCE = 0.30
const W_SKILL = 0.20
const W_FRESHNESS = 0.10

// Freshness decay window in days (score reaches 0 after this many days)
const FRESHNESS_WINDOW_DAYS = 60

// Fairness thresholds
const SMALL_ORG_SWIPE_THRESHOLD = 10   // fewer swipes = small, gets a boost
const LARGE_ORG_SWIPE_THRESHOLD = 150  // many swipes = large, gets a limiter

// ─── Public types ─────────────────────────────────────────────────────────────

export interface MatchInput {
  // --- Volunteer ---
  volunteerVFIJson: string | null | undefined
  volunteerSchwartzJson?: string | null | undefined
  volunteerInterests: string[]   // category names
  volunteerSkills: string[]      // skill names (lowercase comparison)
  volunteerLat: number | null | undefined
  volunteerLon: number | null | undefined
  volunteerMaxDistance: number   // km, defaults to 25

  // --- Vacancy ---
  vacancyCategories: string[]    // category names
  vacancySkills: string[]        // skill names
  vacancyLat: number | null | undefined
  vacancyLon: number | null | undefined
  vacancyRemote: boolean
  vacancyCreatedAt: Date

  // --- Organisation (for fairness) ---
  orgTotalSwipes: number         // proxy for org reach/popularity
}

export interface MatchScore {
  /** Weighted total score [0–100] */
  total: number
  /** Motivational alignment [0–100] — VFI cosine + interest overlap */
  motivation: number
  /** Geographic accessibility [0–100] */
  distance: number
  /** Skill overlap [0–100] */
  skill: number
  /** Vacancy freshness [0–100] */
  freshness: number
  /** Fairness multiplier [0.70–1.40] */
  fairnessWeight: number
  /** Human-readable match highlights (Dutch) */
  highlights: string[]
}

// ─── Main function ────────────────────────────────────────────────────────────

export function calculateMatchScore(input: MatchInput): MatchScore {
  const highlights: string[] = []

  // 1. Motivation score (40%)
  const { score: motivation, highlights: motivHighlights } = scoreMotivation(
    input.volunteerVFIJson,
    input.volunteerSchwartzJson ?? null,
    input.volunteerInterests,
    input.vacancyCategories,
  )
  highlights.push(...motivHighlights)

  // 2. Distance score (30%)
  const { score: distance, highlights: distHighlights } = scoreDistance(
    input.volunteerLat ?? null,
    input.volunteerLon ?? null,
    input.vacancyLat ?? null,
    input.vacancyLon ?? null,
    input.vacancyRemote,
    input.volunteerMaxDistance,
  )
  highlights.push(...distHighlights)

  // 3. Skill score (20%)
  const { score: skill, highlights: skillHighlights } = scoreSkills(
    input.volunteerSkills,
    input.vacancySkills,
  )
  highlights.push(...skillHighlights)

  // 4. Freshness score (10%)
  const freshness = scoreFreshness(input.vacancyCreatedAt)

  // 5. Fairness weight (multiplicative)
  const fairnessWeight = calcFairnessWeight(input.orgTotalSwipes)

  // 6. Weighted total
  const raw =
    motivation * W_MOTIVATION +
    distance * W_DISTANCE +
    skill * W_SKILL +
    freshness * W_FRESHNESS

  const total = Math.min(100, Math.round(raw * fairnessWeight * 10) / 10)

  return {
    total,
    motivation: Math.round(motivation * 10) / 10,
    distance: Math.round(distance * 10) / 10,
    skill: Math.round(skill * 10) / 10,
    freshness: Math.round(freshness * 10) / 10,
    fairnessWeight: Math.round(fairnessWeight * 100) / 100,
    highlights,
  }
}

// ─── Component scorers ────────────────────────────────────────────────────────

/**
 * Motivation score: measures how well the volunteer's underlying motivations
 * align with what this type of work typically requires.
 *
 * When Schwartz data is available:
 *   = VFI cosine (50%) + Schwartz cosine (25%) + category interest overlap (25%)
 *
 * Without Schwartz (cold-start / not yet collected):
 *   = VFI cosine (65%) + category interest overlap (35%)
 */
function scoreMotivation(
  vfiJson: string | null | undefined,
  schwartzJson: string | null | undefined,
  volunteerInterests: string[],
  vacancyCategories: string[],
): { score: number; highlights: string[] } {
  const highlights: string[] = []
  const neutralVFI = [3, 3, 3, 3, 3, 3]

  // VFI cosine similarity
  const volunteerVFI: VFIProfile | null = parseMotivationProfile(vfiJson)
  const volunteerVFIVec = volunteerVFI ? vfiToVector(volunteerVFI) : neutralVFI
  const categoryVFIVec = categoryVFIVector(vacancyCategories)
  const vfiSim = cosineSimilarity(volunteerVFIVec, categoryVFIVec)

  // Schwartz cosine similarity (optional — gracefully absent pre-step 6)
  const volunteerSchwartz = parseSchwartzProfile(schwartzJson)
  let schwartzSim = 50 // neutral fallback
  if (volunteerSchwartz) {
    const volunteerSchwartzVec = schwartzToVector(volunteerSchwartz)
    const categorySchwartzVec = categorySchwartzVector(vacancyCategories)
    schwartzSim = cosineSimilarity(volunteerSchwartzVec, categorySchwartzVec)
  }

  // Category interest overlap
  const interestSet = new Set(volunteerInterests.map((i) => i.toLowerCase()))
  const catMatches = vacancyCategories.filter((c) => interestSet.has(c.toLowerCase()))
  const interestOverlap =
    vacancyCategories.length > 0 ? (catMatches.length / vacancyCategories.length) * 100 : 50

  // Weighted combination — fuller formula when Schwartz is available
  const score = volunteerSchwartz
    ? vfiSim * 0.50 + schwartzSim * 0.25 + interestOverlap * 0.25
    : vfiSim * 0.65 + interestOverlap * 0.35

  // Highlights — top 2 most informative signals
  if (catMatches.length > 0) {
    highlights.push(`Interesse in ${catMatches[0]}`)
  }

  if (volunteerVFI) {
    const dims: [keyof VFIProfile, string][] = [
      ["sociaal",    "Sociaal gemotiveerd"],
      ["waarden",    "Gedreven door waarden"],
      ["begrip",     "Leergierig"],
      ["loopbaan",   "Loopbaangericht"],
      ["verbetering","Zelfverbetering"],
      ["bescherming","Persoonlijke groei"],
    ]
    const top = dims.reduce((best, cur) =>
      volunteerVFI[cur[0]] > volunteerVFI[best[0]] ? cur : best
    )
    if (volunteerVFI[top[0]] >= 4) highlights.push(top[1])
  }

  // Schwartz highlight — dominant value when it strongly aligns
  if (volunteerSchwartz && schwartzSim >= 70) {
    const schwartzLabels: [keyof typeof volunteerSchwartz, string][] = [
      ["zorg",          "Zorgzaam"],
      ["universalisme", "Maatschappelijk betrokken"],
      ["zelfrichting",  "Zelfstandig"],
      ["stimulatie",    "Avontuurlijk"],
      ["prestatie",     "Resultaatgericht"],
      ["veiligheid",    "Stabiel"],
    ]
    const topSchwartz = schwartzLabels.reduce((best, cur) =>
      volunteerSchwartz[cur[0]] > volunteerSchwartz[best[0]] ? cur : best
    )
    if (volunteerSchwartz[topSchwartz[0]] >= 4 && highlights.length < 3) {
      highlights.push(topSchwartz[1])
    }
  }

  if (score >= 82) highlights.push("Sterke motivatiematch")

  return { score, highlights }
}

/**
 * Distance score: rewards proximity and remote flexibility.
 *
 * - Remote vacancy            → 100 (always accessible)
 * - No coordinates available  → 55  (neutral, not penalised)
 * - Within radius             → 40–100 (linear, with 20-point near-bonus ≤5km)
 * - Beyond radius             → 0   (hard cut-off maintained by pre-filter)
 */
function scoreDistance(
  vLat: number | null,
  vLon: number | null,
  oLat: number | null,
  oLon: number | null,
  remote: boolean,
  maxDistance: number,
): { score: number; highlights: string[] } {
  if (remote) {
    return { score: 100, highlights: ["Op afstand mogelijk"] }
  }

  if (!vLat || !vLon || !oLat || !oLon) {
    return { score: 55, highlights: [] }
  }

  const km = haversineKm(vLat, vLon, oLat, oLon)

  if (km <= 2) {
    return { score: 100, highlights: [`Vlakbij (${Math.round(km * 10) / 10} km)`] }
  }

  if (km <= 5) {
    return { score: 90, highlights: [`Dichtbij (${Math.round(km)} km)`] }
  }

  // Linear scale from 40 (at maxDistance) to 85 (at 5km)
  const score = Math.max(0, 85 - ((km - 5) / (maxDistance - 5)) * 45)
  return { score, highlights: [] }
}

/**
 * Skill score: what percentage of the vacancy's required skills does
 * the volunteer have?
 *
 * - No skills required on the vacancy → 70 (neutral; anyone qualifies)
 * - Volunteer has no skills recorded  → 50 (unknown; no info)
 * - Otherwise: |overlap| / |vacancy skills| × 100
 */
function scoreSkills(
  volunteerSkills: string[],
  vacancySkills: string[],
): { score: number; highlights: string[] } {
  if (vacancySkills.length === 0) {
    return { score: 70, highlights: [] }
  }

  if (volunteerSkills.length === 0) {
    return { score: 50, highlights: [] }
  }

  const volunteerSet = new Set(volunteerSkills.map((s) => s.toLowerCase()))
  const matchedSkills = vacancySkills.filter((s) => volunteerSet.has(s.toLowerCase()))
  const overlap = matchedSkills.length / vacancySkills.length
  const score = overlap * 100

  const highlights: string[] = []
  if (matchedSkills.length >= 2) {
    highlights.push(`${matchedSkills.length} skills matchen`)
  } else if (matchedSkills.length === 1) {
    highlights.push(`Skill match: ${matchedSkills[0]}`)
  }

  return { score, highlights }
}

/**
 * Freshness score: linear decay from 100 (published today) to 0
 * (published FRESHNESS_WINDOW_DAYS or more ago).
 *
 * Uses a 60-day window (vs 30 previously) to be fairer to older vacancies.
 */
function scoreFreshness(createdAt: Date): number {
  const ageMs = Date.now() - createdAt.getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  return Math.max(0, 100 - (ageDays / FRESHNESS_WINDOW_DAYS) * 100)
}

/**
 * Fairness multiplier: boosts organisations with low swipe counts (small /
 * under-exposed) and gently limits very large / overexposed ones.
 *
 * Range: [0.70, 1.40]
 *
 * This is multiplicative so it amplifies quality rather than replacing it —
 * a great match at a popular org still beats a poor match at a small org.
 */
function calcFairnessWeight(orgTotalSwipes: number): number {
  if (orgTotalSwipes < SMALL_ORG_SWIPE_THRESHOLD) {
    // Small / new org: up to 40% boost
    const underExposure =
      (SMALL_ORG_SWIPE_THRESHOLD - orgTotalSwipes) / SMALL_ORG_SWIPE_THRESHOLD
    return Math.min(1.4, 1.0 + underExposure * 0.4)
  }

  if (orgTotalSwipes > LARGE_ORG_SWIPE_THRESHOLD) {
    // Large / dominant org: up to 30% damper
    const overExposure = Math.min(
      1,
      (orgTotalSwipes - LARGE_ORG_SWIPE_THRESHOLD) / LARGE_ORG_SWIPE_THRESHOLD,
    )
    return Math.max(0.7, 1.0 - overExposure * 0.3)
  }

  return 1.0
}
