type NominatimResult = {
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string
  }
}

export async function geocodePostcode(
  postcode: string
): Promise<{ lat: number; lon: number; city?: string } | null> {
  const normalized = postcode.replace(/\s/g, "").toUpperCase()

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(normalized)}&countrycodes=nl&format=json&limit=1&addressdetails=1`
    const res = await fetch(url, {
      headers: { "User-Agent": "vrijwilligersmatch.nl/1.0" },
    })

    if (!res.ok) return null

    const data: NominatimResult[] = await res.json()
    if (!data.length) return null

    const addr = data[0].address
    const city =
      addr?.city ?? addr?.town ?? addr?.village ?? addr?.municipality ?? addr?.suburb

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), city }
  } catch {
    return null
  }
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
