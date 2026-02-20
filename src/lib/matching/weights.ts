/**
 * Runtime scoring weights — loaded from app_settings table (via raw SQL).
 * Falls back to DEFAULT_WEIGHTS when the table is empty or unreachable.
 */

import { prisma } from "@/lib/prisma"
import { DEFAULT_WEIGHTS, type ScoringWeights } from "./scoring-engine"

// Simple 60-second in-memory cache to avoid a DB hit on every swipe-deck load
let _cache: { weights: ScoringWeights; at: number } | null = null
const CACHE_TTL_MS = 60_000

export async function getScoringWeights(): Promise<ScoringWeights> {
  if (_cache && Date.now() - _cache.at < CACHE_TTL_MS) {
    return _cache.weights
  }

  try {
    const rows = await prisma.$queryRaw<{ data: string }[]>`
      SELECT data FROM app_settings WHERE id = 'default' LIMIT 1
    `

    if (rows[0]?.data) {
      const parsed = JSON.parse(rows[0].data) as Partial<ScoringWeights>
      const weights: ScoringWeights = { ...DEFAULT_WEIGHTS, ...parsed }
      _cache = { weights, at: Date.now() }
      return weights
    }
  } catch {
    // DB unreachable or table not yet seeded — use defaults
  }

  _cache = { weights: DEFAULT_WEIGHTS, at: Date.now() }
  return DEFAULT_WEIGHTS
}

export function invalidateWeightsCache() {
  _cache = null
}
