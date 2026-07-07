import type { MetadataRoute } from "next"
import { PrismaClient, ContentStatus } from "@prisma/client"

const prisma = new PrismaClient()
const BASE = "https://vrijwilligersmatch.nl"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await prisma.content.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { slug: true, type: true, publishedAt: true, updatedAt: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1, alternates: { languages: { nl: BASE } } },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages: { nl: `${BASE}/blog` } } },
    { url: `${BASE}/kennisbank`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages: { nl: `${BASE}/kennisbank` } } },
    { url: `${BASE}/steden`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7, alternates: { languages: { nl: `${BASE}/steden` } } },
    { url: `${BASE}/vrijwilligerswerk`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages: { nl: `${BASE}/vrijwilligerswerk` } } },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6, alternates: { languages: { nl: `${BASE}/faq` } } },
  ]

  const contentRoutes: MetadataRoute.Sitemap = rows.map((r) => {
    const seg = r.type === "BLOG" ? "blog" : r.type === "KB" ? "kennisbank" : "steden"
    const url = `${BASE}/${seg}/${r.type === "CITY" ? r.slug.replace("vrijwilligerswerk-", "") : r.slug}`
    return {
      url,
      lastModified: r.updatedAt,
      changeFrequency: "monthly",
      priority: r.type === "CITY" ? 0.5 : 0.8,
      alternates: { languages: { nl: url } },
    }
  })

  return [...staticRoutes, ...contentRoutes]
}
