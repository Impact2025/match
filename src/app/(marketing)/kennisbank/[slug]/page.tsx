import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getContent, getRelatedKb, injectHeadingIds, extractToc } from "@/lib/content"

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getContent(slug)
  if (!item) return {}
  return {
    title: item.metaTitle ?? item.title,
    description: item.metaDescription ?? item.excerpt ?? undefined,
    keywords: item.keywords,
    alternates: { canonical: `/kennisbank/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.metaDescription ?? item.excerpt ?? undefined,
    },
  }
}

export default async function KennisbankDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getContent(slug)
  if (!item) notFound()

  const html = injectHeadingIds(item.html)
  const toc = extractToc(item.html)
  const related = await getRelatedKb(item.slug, item.tags, item.relatedSlugs)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: item.title,
    description: item.metaDescription ?? item.excerpt ?? "",
    author: { "@type": "Person", name: "Vincent van Munster" },
    datePublished: item.publishedAt?.toISOString(),
    dateModified: item.publishedAt?.toISOString(),
    mainEntityOfPage: `https://vrijwilligersmatch.nl/kennisbank/${item.slug}`,
    proficencyLevel: "Beginner",
    dependencies: "Vrijwilligersmatch account",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Kennisbank",
          item: "https://vrijwilligersmatch.nl/kennisbank",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: item.title,
          item: `https://vrijwilligersmatch.nl/kennisbank/${item.slug}`,
        },
      ],
    },
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
        <div>
          <nav className="text-sm text-slate-500">
            <Link href="/kennisbank" className="hover:text-orange-600">
              Kennisbank
            </Link>{" "}
            <span>/</span> <span className="text-slate-700">{item.title}</span>
          </nav>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            {item.title}
          </h1>
          <div
            className="prose-content mt-8 text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_p]:leading-relaxed [&_a]:text-orange-600 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:text-sm [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        {toc.length > 2 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                In deze gids
              </p>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="text-slate-600 hover:text-orange-600"
                  >
                    {t.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-semibold text-slate-900">Verwante gidsen</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.type === "KB" ? "kennisbank" : "blog"}/${r.slug}`}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-orange-300"
              >
                <h3 className="font-semibold text-slate-900">{r.title}</h3>
                {r.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {r.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
