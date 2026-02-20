/**
 * VFI (Volunteer Functions Inventory) profile type.
 *
 * Each dimension uses the same 1-5 scale as the onboarding questionnaire:
 *   waarden:     Altruistic values — making a difference for others
 *   begrip:      Understanding — learning and gaining new knowledge
 *   sociaal:     Social — meeting people and building connections
 *   loopbaan:    Career — professional development and CV value
 *   bescherming: Protection — personal growth and dealing with problems
 *   verbetering: Enhancement — self-improvement and competence building
 */
export interface VFIProfile {
  waarden: number
  begrip: number
  sociaal: number
  loopbaan: number
  bescherming: number
  verbetering: number
}

/**
 * Research-informed VFI affinity profiles per volunteer category.
 *
 * Each profile represents the typical motivational mix of volunteers who
 * choose that domain. Derived from volunteer motivation literature and
 * validated VFI studies in the Netherlands.
 *
 * Keys match the category names defined in src/config/index.ts.
 */
export const CATEGORY_VFI: Record<string, VFIProfile> = {
  "Natuur & Milieu": {
    waarden: 5,
    begrip: 4,
    sociaal: 2,
    loopbaan: 2,
    bescherming: 3,
    verbetering: 3,
  },
  Onderwijs: {
    waarden: 4,
    begrip: 5,
    sociaal: 4,
    loopbaan: 5,
    bescherming: 2,
    verbetering: 4,
  },
  "Zorg & Welzijn": {
    waarden: 5,
    begrip: 3,
    sociaal: 5,
    loopbaan: 3,
    bescherming: 4,
    verbetering: 3,
  },
  "Sport & Recreatie": {
    waarden: 3,
    begrip: 2,
    sociaal: 5,
    loopbaan: 2,
    bescherming: 3,
    verbetering: 5,
  },
  "Cultuur & Kunst": {
    waarden: 3,
    begrip: 4,
    sociaal: 4,
    loopbaan: 3,
    bescherming: 2,
    verbetering: 4,
  },
  Dieren: {
    waarden: 5,
    begrip: 3,
    sociaal: 2,
    loopbaan: 1,
    bescherming: 4,
    verbetering: 2,
  },
  "Vluchtelingen & Integratie": {
    waarden: 5,
    begrip: 4,
    sociaal: 5,
    loopbaan: 3,
    bescherming: 3,
    verbetering: 3,
  },
  Ouderen: {
    waarden: 5,
    begrip: 2,
    sociaal: 5,
    loopbaan: 2,
    bescherming: 4,
    verbetering: 2,
  },
  Jongeren: {
    waarden: 4,
    begrip: 4,
    sociaal: 5,
    loopbaan: 4,
    bescherming: 2,
    verbetering: 3,
  },
  Technologie: {
    waarden: 3,
    begrip: 5,
    sociaal: 2,
    loopbaan: 5,
    bescherming: 2,
    verbetering: 5,
  },
  Gezondheid: {
    waarden: 5,
    begrip: 4,
    sociaal: 4,
    loopbaan: 4,
    bescherming: 4,
    verbetering: 3,
  },
  Evenementen: {
    waarden: 3,
    begrip: 2,
    sociaal: 5,
    loopbaan: 3,
    bescherming: 2,
    verbetering: 3,
  },
}

/**
 * Returns the weighted average VFI vector for a list of category names.
 *
 * Unknown categories are silently ignored. Falls back to a neutral
 * [3, 3, 3, 3, 3, 3] vector when no known categories are provided.
 */
export function categoryVFIVector(categoryNames: string[]): number[] {
  const known = categoryNames
    .map((name) => CATEGORY_VFI[name])
    .filter((p): p is VFIProfile => p !== undefined)

  if (known.length === 0) return [3, 3, 3, 3, 3, 3]

  const sum = known.reduce(
    (acc, p) => ({
      waarden: acc.waarden + p.waarden,
      begrip: acc.begrip + p.begrip,
      sociaal: acc.sociaal + p.sociaal,
      loopbaan: acc.loopbaan + p.loopbaan,
      bescherming: acc.bescherming + p.bescherming,
      verbetering: acc.verbetering + p.verbetering,
    }),
    { waarden: 0, begrip: 0, sociaal: 0, loopbaan: 0, bescherming: 0, verbetering: 0 },
  )

  const n = known.length
  return [
    sum.waarden / n,
    sum.begrip / n,
    sum.sociaal / n,
    sum.loopbaan / n,
    sum.bescherming / n,
    sum.verbetering / n,
  ]
}

/**
 * Converts a VFI profile object to an ordered numeric vector.
 * Order must stay consistent with categoryVFIVector().
 */
export function vfiToVector(profile: VFIProfile): number[] {
  return [
    profile.waarden,
    profile.begrip,
    profile.sociaal,
    profile.loopbaan,
    profile.bescherming,
    profile.verbetering,
  ]
}

// ─── Schwartz Values ──────────────────────────────────────────────────────────

/**
 * Schwartz Basic Human Values profile.
 *
 * Ten universal values on a 0–5 scale (mapped from the PVQ 0–6 scale for
 * mobile-friendly 6-button UX; semantically equivalent after normalisation).
 *
 *   zorg          — Benevolence: caring for close others
 *   universalisme — Universalism: welfare of all people and nature
 *   zelfrichting  — Self-direction: independent thought and action
 *   stimulatie    — Stimulation: excitement, novelty, challenge
 *   hedonisme     — Hedonism: pleasure and sensuous gratification
 *   prestatie     — Achievement: personal success through competence
 *   macht         — Power: social status and dominance
 *   veiligheid    — Security: safety, harmony, stability
 *   conformiteit  — Conformity: restraint of impulses that might harm others
 *   traditie      — Tradition: respect and commitment to cultural customs
 */
export interface SchwartzProfile {
  zorg: number
  universalisme: number
  zelfrichting: number
  stimulatie: number
  hedonisme: number
  prestatie: number
  macht: number
  veiligheid: number
  conformiteit: number
  traditie: number
}

/**
 * Research-informed Schwartz value affinity profiles per volunteer category.
 *
 * Values on a 0–5 scale; 0 = not relevant, 5 = strongly characteristic.
 * Based on volunteer motivation studies and Schwartz value theory.
 */
export const CATEGORY_SCHWARTZ: Record<string, SchwartzProfile> = {
  "Natuur & Milieu": {
    zorg: 3, universalisme: 5, zelfrichting: 3, stimulatie: 2,
    hedonisme: 1, prestatie: 1, macht: 0, veiligheid: 2, conformiteit: 1, traditie: 2,
  },
  Onderwijs: {
    zorg: 4, universalisme: 3, zelfrichting: 4, stimulatie: 2,
    hedonisme: 1, prestatie: 3, macht: 1, veiligheid: 2, conformiteit: 2, traditie: 1,
  },
  "Zorg & Welzijn": {
    zorg: 5, universalisme: 4, zelfrichting: 2, stimulatie: 1,
    hedonisme: 1, prestatie: 2, macht: 0, veiligheid: 3, conformiteit: 3, traditie: 2,
  },
  "Sport & Recreatie": {
    zorg: 2, universalisme: 2, zelfrichting: 3, stimulatie: 5,
    hedonisme: 4, prestatie: 4, macht: 2, veiligheid: 2, conformiteit: 2, traditie: 1,
  },
  "Cultuur & Kunst": {
    zorg: 2, universalisme: 3, zelfrichting: 5, stimulatie: 4,
    hedonisme: 3, prestatie: 2, macht: 1, veiligheid: 1, conformiteit: 1, traditie: 3,
  },
  Dieren: {
    zorg: 4, universalisme: 5, zelfrichting: 2, stimulatie: 2,
    hedonisme: 2, prestatie: 1, macht: 0, veiligheid: 2, conformiteit: 1, traditie: 1,
  },
  "Vluchtelingen & Integratie": {
    zorg: 4, universalisme: 5, zelfrichting: 3, stimulatie: 2,
    hedonisme: 1, prestatie: 1, macht: 0, veiligheid: 2, conformiteit: 2, traditie: 1,
  },
  Ouderen: {
    zorg: 5, universalisme: 3, zelfrichting: 1, stimulatie: 1,
    hedonisme: 1, prestatie: 1, macht: 0, veiligheid: 4, conformiteit: 3, traditie: 4,
  },
  Jongeren: {
    zorg: 4, universalisme: 3, zelfrichting: 3, stimulatie: 3,
    hedonisme: 2, prestatie: 3, macht: 1, veiligheid: 2, conformiteit: 2, traditie: 1,
  },
  Technologie: {
    zorg: 1, universalisme: 2, zelfrichting: 5, stimulatie: 4,
    hedonisme: 2, prestatie: 5, macht: 2, veiligheid: 2, conformiteit: 1, traditie: 0,
  },
  Gezondheid: {
    zorg: 5, universalisme: 4, zelfrichting: 2, stimulatie: 1,
    hedonisme: 1, prestatie: 3, macht: 0, veiligheid: 4, conformiteit: 2, traditie: 2,
  },
  Evenementen: {
    zorg: 2, universalisme: 2, zelfrichting: 3, stimulatie: 5,
    hedonisme: 4, prestatie: 2, macht: 1, veiligheid: 2, conformiteit: 2, traditie: 2,
  },
}

/**
 * Returns the average Schwartz vector for a list of category names.
 * Falls back to a neutral [2.5 × 10] vector when no categories are known.
 */
export function categorySchwartzVector(categoryNames: string[]): number[] {
  const known = categoryNames
    .map((name) => CATEGORY_SCHWARTZ[name])
    .filter((p): p is SchwartzProfile => p !== undefined)

  if (known.length === 0) return new Array(10).fill(2.5)

  const keys: (keyof SchwartzProfile)[] = [
    "zorg", "universalisme", "zelfrichting", "stimulatie", "hedonisme",
    "prestatie", "macht", "veiligheid", "conformiteit", "traditie",
  ]

  return keys.map((k) => known.reduce((sum, p) => sum + p[k], 0) / known.length)
}

/**
 * Converts a SchwartzProfile object to an ordered numeric vector.
 * Order must stay consistent with categorySchwartzVector().
 */
export function schwartzToVector(profile: SchwartzProfile): number[] {
  return [
    profile.zorg, profile.universalisme, profile.zelfrichting, profile.stimulatie,
    profile.hedonisme, profile.prestatie, profile.macht, profile.veiligheid,
    profile.conformiteit, profile.traditie,
  ]
}

/**
 * Parses the schwartzProfile JSON string from the database.
 * Returns null when the string is missing or malformed.
 */
export function parseSchwartzProfile(json: string | null | undefined): SchwartzProfile | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as Partial<SchwartzProfile>
    const keys: (keyof SchwartzProfile)[] = [
      "zorg", "universalisme", "zelfrichting", "stimulatie", "hedonisme",
      "prestatie", "macht", "veiligheid", "conformiteit", "traditie",
    ]
    if (keys.some((k) => typeof parsed[k] !== "number")) return null
    return parsed as SchwartzProfile
  } catch {
    return null
  }
}

// ─── VFI helpers ──────────────────────────────────────────────────────────────

/**
 * Parses the motivationProfile JSON string from the database.
 * Returns null when the string is missing or malformed.
 */
export function parseMotivationProfile(json: string | null | undefined): VFIProfile | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json) as Partial<VFIProfile>
    const { waarden, begrip, sociaal, loopbaan, bescherming, verbetering } = parsed
    if (
      typeof waarden !== "number" ||
      typeof begrip !== "number" ||
      typeof sociaal !== "number" ||
      typeof loopbaan !== "number" ||
      typeof bescherming !== "number" ||
      typeof verbetering !== "number"
    ) {
      return null
    }
    return { waarden, begrip, sociaal, loopbaan, bescherming, verbetering }
  } catch {
    return null
  }
}
