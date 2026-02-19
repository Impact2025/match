import { NextResponse } from "next/server"
import { geocodePostcode } from "@/lib/geocoding"

// Simple in-memory cache to avoid hammering Nominatim
const cache = new Map<string, { lat: number; lon: number; city?: string } | null>()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postcode = searchParams.get("postcode")

  if (!postcode) {
    return NextResponse.json({ error: "Postcode vereist" }, { status: 400 })
  }

  const normalized = postcode.replace(/\s/g, "").toUpperCase()

  if (cache.has(normalized)) {
    return NextResponse.json(cache.get(normalized))
  }

  const result = await geocodePostcode(normalized)
  cache.set(normalized, result)

  return NextResponse.json(result)
}
