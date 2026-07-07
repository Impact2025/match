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
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kennisbank`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/steden`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/vrijwilligerswerk`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.6 },
  ]

  const contentRoutes: MetadataRoute.Sitemap = rows.map((r) => {
    const seg = r.type === "BLOG" ? "blog" : r.type === "KB" ? "kennisbank" : "steden"
    return {
      url: `${BASE}/${seg}/${r.type === "CITY" ? r.slug.replace("vrijwilligerswerk-", "") : r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "monthly",
      priority: r.type === "CITY" ? 0.5 : 0.8,
    }
  })

  return [...staticRoutes, ...contentRoutes]
}
