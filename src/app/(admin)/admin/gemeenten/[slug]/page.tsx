export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { GemeenteBrandingEditor } from "@/components/admin/gemeente-branding-editor"

export default async function GemeenteBrandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Gemeente admin can only edit their own gemeente
  const session = await auth()
  const user = session?.user as { role?: string; gemeenteSlug?: string | null } | undefined
  if (user?.role === "GEMEENTE_ADMIN" && user?.gemeenteSlug !== slug) {
    redirect(`/admin/gemeenten/${user.gemeenteSlug}`)
  }

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT id, slug, name, "displayName", tagline, "primaryColor", "accentColor",
           "logoUrl", "heroImageUrl", "faviconUrl", website, "contactEmail",
           "welcomeTitle", "welcomeMessage", "contactPhone", "contactAddress",
           "socialLinks", "emailSignature"
    FROM gemeenten WHERE slug = ${slug} LIMIT 1
  `

  if (!rows.length) notFound()

  const g = rows[0] as {
    id: string; slug: string; name: string; displayName: string; tagline: string | null
    primaryColor: string; accentColor: string | null; logoUrl: string | null
    heroImageUrl: string | null; faviconUrl: string | null; website: string | null
    contactEmail: string | null; welcomeTitle: string | null; welcomeMessage: string | null
    contactPhone: string | null; contactAddress: string | null
    socialLinks: unknown; emailSignature: string | null
  }

  const initial = {
    slug: g.slug,
    name: g.name,
    displayName: g.displayName,
    tagline: g.tagline,
    primaryColor: g.primaryColor ?? "#7c3aed",
    accentColor: g.accentColor,
    logoUrl: g.logoUrl,
    heroImageUrl: g.heroImageUrl,
    faviconUrl: g.faviconUrl,
    website: g.website,
    contactEmail: g.contactEmail,
    welcomeTitle: g.welcomeTitle,
    welcomeMessage: g.welcomeMessage,
    contactPhone: g.contactPhone,
    contactAddress: g.contactAddress,
    socialLinks: (g.socialLinks as { facebook?: string; instagram?: string; linkedin?: string; twitter?: string } | null),
    emailSignature: g.emailSignature,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/gemeenten"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Gemeenten
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ background: `linear-gradient(135deg, ${initial.primaryColor}, ${initial.accentColor ?? initial.primaryColor})` }}>
              {initial.displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">{initial.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{initial.displayName} · {initial.slug}.vrijwilligersmatch.nl</p>
            </div>
          </div>
        </div>
        {initial.website && (
          <a href={initial.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-100 rounded-lg px-3 py-1.5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Website bezoeken
          </a>
        )}
      </div>

      <GemeenteBrandingEditor initial={initial} />
    </div>
  )
}
