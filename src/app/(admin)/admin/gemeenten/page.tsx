export const dynamic = "force-dynamic"

import Link from "next/link"
import { Plus, Building2, ExternalLink, Palette } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function GemeentenPage() {
  const rows = await prisma.$queryRaw<Array<{
    id: string; slug: string; name: string; displayName: string
    primaryColor: string; accentColor: string | null; tagline: string | null
    logoUrl: string | null; website: string | null; createdAt: Date; orgCount: bigint
  }>>`
    SELECT g.id, g.slug, g.name, g."displayName", g."primaryColor", g."accentColor",
           g.tagline, g."logoUrl", g.website, g."createdAt",
           COUNT(o.id) AS "orgCount"
    FROM gemeenten g
    LEFT JOIN organisations o ON o."gemeenteId" = g.id
    GROUP BY g.id
    ORDER BY g."displayName" ASC
  `

  const gemeenten = rows.map((g) => ({ ...g, orgCount: Number(g.orgCount) }))

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gemeenten</h1>
          <p className="text-gray-400 text-sm mt-1">Beheer whitelabel uitstraling per gemeente</p>
        </div>
        <Link href="/admin/gemeenten/nieuw"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Gemeente toevoegen
        </Link>
      </div>

      {gemeenten.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nog geen gemeenten aangemaakt.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {gemeenten.map((g) => {
            const accent = g.accentColor ?? g.primaryColor
            return (
              <Link
                key={g.slug}
                href={`/admin/gemeenten/${g.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all flex items-center gap-5"
              >
                {/* Color badge */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                  style={{ background: `linear-gradient(135deg, ${g.primaryColor}, ${accent})` }}>
                  {g.logoUrl
                    ? <img src={g.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    : g.displayName.charAt(0)
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-semibold text-gray-900 text-sm">{g.name}</h2>
                    <span className="text-xs text-gray-400">{g.displayName}</span>
                  </div>
                  {g.tagline && <p className="text-xs text-gray-400 truncate mt-0.5">{g.tagline}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-gray-400 font-mono">{g.slug}.vrijwilligersmatch.nl</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{g.orgCount} organisaties</span>
                  </div>
                </div>

                {/* Color preview */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-5 h-5 rounded-full border border-white shadow-sm"
                    style={{ background: g.primaryColor }} title="Primaire kleur" />
                  <div className="w-5 h-5 rounded-full border border-white shadow-sm"
                    style={{ background: accent }} title="Accentkleur" />
                </div>

                {/* Arrow / edit hint */}
                <div className="shrink-0 flex items-center gap-2 text-gray-300 group-hover:text-purple-400 transition-colors">
                  <Palette className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
