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
    },
  })
  // preserve order from slugs
  const map = new Map(rows.map((r) => [r.slug, r]))
  return slugs
    .map((s) => map.get(s))
    .filter(Boolean)
    .map((r) => ({ ...(r as any), tags: splitList((r as any).tags) }))
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
