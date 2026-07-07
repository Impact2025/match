import { PrismaClient, ContentStatus, ContentType } from "@prisma/client"

const prisma = new PrismaClient()
const BASE = "https://vrijwilligersmatch.nl"

export const revalidate = 3600

export async function GET() {
  const rows = await prisma.content.findMany({
    where: { type: ContentType.BLOG, status: ContentStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 20,
  })

  const items = rows
    .map((r) => {
      const url = `${BASE}/blog/${r.slug}`
      return `    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${r.publishedAt?.toUTCString() ?? ""}</pubDate>
      <description>${escapeXml(r.excerpt ?? "")}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vrijwilligersmatch Blog</title>
    <link>${BASE}/blog</link>
    <description>Thought leadership over vrijwilligerswerk, SROI en digitale innovatie in het sociaal domein.</description>
    <language>nl-NL</language>
    <atom:link href="${BASE}/blog/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
