export interface SocialLinks {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
}

export interface GemeenteBranding {
  slug: string
  /** Platform-branded name shown in UI, e.g. "WijHeemstede" */
  name: string
  /** Official municipality name, e.g. "Heemstede" */
  displayName: string
  tagline: string
  /** Primary brand color (hex) */
  primaryColor: string
  /** Lighter accent for gradients / hover states */
  accentColor: string
  logoUrl: string | null
  website: string

  // ── Extended branding (populated from DB, optional) ──────────
  contactEmail?: string | null
  heroImageUrl?: string | null
  welcomeTitle?: string | null
  welcomeMessage?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  socialLinks?: SocialLinks | null
  emailSignature?: string | null
  faviconUrl?: string | null
}

/**
 * Registry of all whitelabel gemeente tenants.
 * Used for subdomain detection — branding details are loaded from DB at runtime.
 */
export const GEMEENTEN: Record<string, GemeenteBranding> = {
  heemstede: {
    slug: "heemstede",
    name: "WijHeemstede",
    displayName: "Heemstede",
    tagline: "Vrijwilligerswerk in Heemstede & omgeving",
    primaryColor: "#6d28d9",
    accentColor: "#8b5cf6",
    logoUrl: null,
    website: "https://www.wijheemstede.nl",
  },
  haarlem: {
    slug: "haarlem",
    name: "HaarlemHelpt",
    displayName: "Haarlem",
    tagline: "Vrijwilligerswerk in Haarlem & omgeving",
    primaryColor: "#B91C1C",
    accentColor: "#DC2626",
    logoUrl: null,
    website: "https://www.haarlem.nl",
  },
}

/** Look up gemeente branding by slug (returns null for unknown/global). */
export function getGemeenteBranding(
  slug: string | null | undefined,
): GemeenteBranding | null {
  if (!slug) return null
  return GEMEENTEN[slug] ?? null
}

/**
 * Extract the gemeente slug from a hostname.
 *
 * "heemstede.vrijwilligersmatch.nl" → "heemstede"
 * "vrijwilligersmatch.nl"           → null
 * "localhost:3000"                   → null
 */
export function parseGemeenteSlug(host: string): string | null {
  const subdomain = host.split(":")[0].split(".")[0].toLowerCase()
  if (subdomain in GEMEENTEN) return subdomain
  return null
}
