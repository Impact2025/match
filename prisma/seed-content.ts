import { PrismaClient } from "@prisma/client"
import { BLOG } from "./content/blog"
import { KB } from "./content/kb"
import { CITY } from "./content/city"
import type { ContentSeed } from "./content/blog"

const prisma = new PrismaClient()

function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ")
  return text.split(/\s+/).filter(Boolean).length
}

interface Issue {
  slug: string
  problems: string[]
}

function validate(items: ContentSeed[]): Issue[] {
  const issues: Issue[] = []
  const dates = new Set<string>()
  for (const it of items) {
    const problems: string[] = []
    const words = wordCount(it.html)
    const min = it.type === "BLOG" ? 300 : it.type === "CITY" ? 280 : 300
    if (words < min) problems.push(`woorden ${words} < ${min}`)
    if (!/<h2[\s>]/.test(it.html)) problems.push("geen H2")
    if (!/href=["']\/blog\/|href=["']\/kennisbank\//.test(it.html) && it.type !== "CITY")
      problems.push("geen interne link")
    if (!/href=["']https?:\/\//.test(it.html)) problems.push("geen externe link")
    if (it.metaTitle.length > 60) problems.push(`metaTitle ${it.metaTitle.length} > 60`)
    const md = it.metaDescription.length
    if (md < 80 || md > 160) problems.push(`metaDescription ${md} (80-160)`)
    if (it.excerpt.length > 160) problems.push(`excerpt ${it.excerpt.length} > 160`)
    if (dates.has(it.publishedAt)) problems.push(`dubbele datum ${it.publishedAt}`)
    dates.add(it.publishedAt)
    if (problems.length) issues.push({ slug: it.slug, problems })
  }
  return issues
}

async function main() {
  const all = [...BLOG, ...KB, ...CITY]
  console.log(`Validating ${all.length} content items...`)
  const issues = validate(all)
  if (issues.length) {
    for (const i of issues) console.log(`[FAIL] ${i.slug}: ${i.problems.join("; ")}`)
    console.log(`\n${issues.length} artikel(en) falen validatie. Stop.`)
    process.exit(1)
  }
  console.log("Validatie OK. Upserten...")

  for (const it of all) {
    await prisma.content.upsert({
      where: { slug: it.slug },
      create: {
        type: it.type,
        status: "PUBLISHED",
        slug: it.slug,
        title: it.title,
        html: it.html,
        excerpt: it.excerpt,
        metaTitle: it.metaTitle,
        metaDescription: it.metaDescription,
        keywords: it.keywords.join(", "),
        tags: it.tags.join(", "),
        relatedSlugs: it.relatedSlugs.join(", "),
        city: it.city ?? null,
        author: "Vincent van Munster",
        readingTime: it.readingTime,
        featured: it.featured ?? false,
        views: it.views ?? 0,
        publishedAt: new Date(it.publishedAt),
      },
      update: {
        type: it.type,
        status: "PUBLISHED",
        title: it.title,
        html: it.html,
        excerpt: it.excerpt,
        metaTitle: it.metaTitle,
        metaDescription: it.metaDescription,
        keywords: it.keywords.join(", "),
        tags: it.tags.join(", "),
        relatedSlugs: it.relatedSlugs.join(", "),
        city: it.city ?? null,
        readingTime: it.readingTime,
        featured: it.featured ?? false,
        views: it.views ?? 0,
        publishedAt: new Date(it.publishedAt),
      },
    })
  }
  console.log(`Klaar: ${all.length} content items geüpsert.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
