import { headers } from "next/headers"
import { getGemeenteBranding, type GemeenteBranding } from "@/config/gemeenten"

/**
 * Server-side utility: resolve the active gemeente from the request.
 *
 * Priority:
 *   1. x-gemeente-slug request header (set by proxy.ts from subdomain)
 *   2. GEMEENTE_SLUG env var (useful for local demo / Vercel preview)
 *
 * Returns null on the global (non-white-label) domain.
 *
 * Safe to call from any RSC, Server Action, or Route Handler.
 */
export async function getCurrentGemeente(): Promise<GemeenteBranding | null> {
  try {
    const h = await headers()
    const slug = h.get("x-gemeente-slug") ?? process.env.GEMEENTE_SLUG
    return getGemeenteBranding(slug)
  } catch {
    // headers() throws outside of a request context (e.g. static generation)
    return getGemeenteBranding(process.env.GEMEENTE_SLUG)
  }
}

/**
 * Returns only the slug string, for use in API routes where the full
 * branding object is not needed.
 */
export async function getGemeenteSlug(): Promise<string | null> {
  try {
    const h = await headers()
    return h.get("x-gemeente-slug") ?? process.env.GEMEENTE_SLUG ?? null
  } catch {
    return process.env.GEMEENTE_SLUG ?? null
  }
}
