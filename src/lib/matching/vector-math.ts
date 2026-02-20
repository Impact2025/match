/**
 * Cosine similarity between two numeric vectors.
 *
 * Returns a value in [0, 100]:
 *   - 100 = identical direction (perfect motivational alignment)
 *   -  50 = orthogonal (no relation)
 *   -   0 = opposite direction
 *
 * Defaults to 50 when a vector is empty or all-zero (neutral / no info).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 50

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 50

  // Scale from [-1, 1] → [0, 100]
  return ((dot / denom + 1) / 2) * 100
}

/**
 * Haversine distance in kilometres between two GPS coordinates.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Normalize a vector to unit length.
 * Returns the original vector unchanged when the norm is zero.
 */
export function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  if (norm === 0) return v
  return v.map((x) => x / norm)
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
