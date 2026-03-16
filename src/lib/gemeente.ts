import { headers } from "next/headers"
import { getGemeenteBranding, type GemeenteBranding, type SocialLinks } from "@/config/gemeenten"
import { prisma } from "@/lib/prisma"

/**
 * Fetch full gemeente branding from DB, merged with static config fallback.
 * DB values take precedence; static config fills in any missing fields.
 */
async function getGemeenteBrandingFromDB(slug: string): Promise<GemeenteBranding | null> {
  const staticFallback = getGemeenteBranding(slug)

  try {
    // Use raw SQL so this works even before Prisma client is regenerated after schema changes
    const rows = await prisma.$queryRaw<Array<{
      slug: string; name: string; displayName: string; logoUrl: string | null
      primaryColor: string; tagline: string | null; website: string | null
      contactEmail: string | null; accentColor: string | null; heroImageUrl: string | null
      welcomeTitle: string | null; welcomeMessage: string | null
      contactPhone: string | null; contactAddress: string | null
      socialLinks: unknown; emailSignature: string | null; faviconUrl: string | null
    }>>`
      SELECT slug, name, "displayName", "logoUrl", "primaryColor", tagline, website,
             "contactEmail", "accentColor", "heroImageUrl",
             "welcomeTitle", "welcomeMessage", "contactPhone", "contactAddress",
             "socialLinks", "emailSignature", "faviconUrl"
      FROM gemeenten
      WHERE slug = ${slug}
      LIMIT 1
    `

    if (!rows.length) return staticFallback

    const row = rows[0]
    return {
      slug: row.slug,
      name: row.name,
      displayName: row.displayName,
      tagline: row.tagline ?? staticFallback?.tagline ?? "",
      primaryColor: row.primaryColor ?? staticFallback?.primaryColor ?? "#7c3aed",
      accentColor: row.accentColor ?? staticFallback?.accentColor ?? row.primaryColor ?? "#8b5cf6",
      logoUrl: row.logoUrl ?? staticFallback?.logoUrl ?? null,
      website: row.website ?? staticFallback?.website ?? "",
      contactEmail: row.contactEmail,
      heroImageUrl: row.heroImageUrl,
      welcomeTitle: row.welcomeTitle,
      welcomeMessage: row.welcomeMessage,
      contactPhone: row.contactPhone,
      contactAddress: row.contactAddress,
      socialLinks: (row.socialLinks as SocialLinks) ?? null,
      emailSignature: row.emailSignature,
      faviconUrl: row.faviconUrl,
    }
  } catch {
    // DB not yet migrated or unavailable — fall back to static config
    return staticFallback
  }
}

/**
 * Server-side utility: resolve the active gemeente from the request.
 *
 * Priority:
 *   1. x-gemeente-slug request header (set by proxy.ts from subdomain)
 *   2. GEMEENTE_SLUG env var (useful for local demo / Vercel preview)
 *
 * Returns null on the global (non-white-label) domain.
 * Fetches extended branding fields from DB; falls back to static config.
 */
export async function getCurrentGemeente(): Promise<GemeenteBranding | null> {
  try {
    const h = await headers()
    const slug = h.get("x-gemeente-slug") ?? process.env.GEMEENTE_SLUG
    if (!slug) return null
    return getGemeenteBrandingFromDB(slug)
  } catch {
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
