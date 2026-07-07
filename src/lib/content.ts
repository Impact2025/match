import { PrismaClient, ContentType, ContentStatus } from "@prisma/client"

const prisma = new PrismaClient()

export type ContentListItem = {
  slug: string
  title: string
  excerpt: string | null
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: Date | null
  readingTime: number | null
  type: ContentType
  tags: string[]
  city: string | null
  views: number
  featured: boolean
}

export type ContentDetail = ContentListItem & {
  html: string
  keywords: string[]
  relatedSlugs: string[]
}

function splitList(v: string | null): string[] {
  if (!v) return []
  return v.split(",").map((s) => s.trim()).filter(Boolean)
}

export async function listContent(
  type: "BLOG" | "KB" | "CITY",
  opts: { take?: number } = {},
): Promise<ContentListItem[]> {
  const rows = await prisma.content.findMany({
    where: { type, status: ContentStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: opts.take,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      readingTime: true,
      type: true,
      tags: true,
      city: true,
      views: true,
      featured: true,
    },
  })
  return rows.map((r) => ({
    ...r,
    tags: splitList(r.tags),
  }))
}

export async function getContent(slug: string): Promise<ContentDetail | null> {
  const row = await prisma.content.findUnique({ where: { slug } })
  if (!row || row.status !== ContentStatus.PUBLISHED) return null
  return {
    ...row,
    tags: splitList(row.tags),
    keywords: splitList(row.keywords),
    relatedSlugs: splitList(row.relatedSlugs),
  }
}

export async function getRelated(slugs: string[]): Promise<ContentListItem[]> {
  if (!slugs.length) return []
  const rows = await prisma.content.findMany({
    where: { slug: { in: slugs }, status: ContentStatus.PUBLISHED },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      readingTime: true,
      type: true,
      tags: true,
      city: true,
      views: true,
      featured: true,
    },
  })
  // preserve order from slugs
  const map = new Map(rows.map((r) => [r.slug, r]))
  return slugs
    .map((s) => map.get(s))
    .filter(Boolean)
    .map((r) => ({ ...(r as any), tags: splitList((r as any).tags), views: (r as any).views, featured: (r as any).featured }))
}

export async function getRelatedByTags(
  slug: string,
  tags: string[],
  relatedSlugs: string[],
  limit = 3,
): Promise<ContentListItem[]> {
  // Manual relatedSlugs first (in given order), then tag-overlap fallback
  const manual = relatedSlugs.length ? await getRelated(relatedSlugs) : []
  if (manual.length >= limit) return manual.slice(0, limit)

  const rows = await prisma.content.findMany({
    where: {
      type: "BLOG",
      status: ContentStatus.PUBLISHED,
      slug: { not: slug },
    },
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      readingTime: true,
      type: true,
      tags: true,
      city: true,
      views: true,
      featured: true,
    },
  })
  const all = rows.map((r) => ({ ...r, tags: splitList(r.tags) }))
  const tagSet = new Set(tags)
  const scored = all
    .map((r) => ({
      ...r,
      _score: r.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter((r) => r._score > 0)
    .sort((a, b) => b._score - a._score || b.views - a.views)
  const fallback = scored.slice(0, limit - manual.length)
  return [...manual, ...fallback]
}

export async function getRelatedKb(
  slug: string,
  tags: string[],
  relatedSlugs: string[],
  limit = 3,
): Promise<ContentListItem[]> {
  const manual = relatedSlugs.length ? await getRelated(relatedSlugs) : []
  if (manual.length >= limit) return manual.slice(0, limit)

  const rows = await prisma.content.findMany({
    where: {
      type: "KB",
      status: ContentStatus.PUBLISHED,
      slug: { not: slug },
    },
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      readingTime: true,
      type: true,
      tags: true,
      city: true,
      views: true,
      featured: true,
    },
  })
  const all = rows.map((r) => ({ ...r, tags: splitList(r.tags) }))
  const tagSet = new Set(tags)
  const scored = all
    .map((r) => ({ ...r, _score: r.tags.filter((t) => tagSet.has(t)).length }))
    .filter((r) => r._score > 0)
    .sort((a, b) => b._score - a._score || b.views - a.views)
  const fallback = scored.slice(0, limit - manual.length)
  return [...manual, ...fallback]
}

export type TocItem = { id: string; text: string; level: number }

export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = []
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, "").trim()
    const id = slugify(text)
    items.push({ id, text, level: Number(m[1]) })
  }
  return items
}

export function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/gi, (_full, lvl, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim()
    return `<h${lvl} id="${slugify(text)}">${inner}</h${lvl}>`
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
