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
