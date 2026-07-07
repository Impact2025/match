import Link from "next/link"
import type { Metadata } from "next"
import { listContent, type ContentListItem } from "@/lib/content"

export const metadata: Metadata = {
  title: "Blog | Vrijwilligersmatch",
  description:
    "Thought leadership over vrijwilligerswerk, SROI, burgerparticipatie en digitale innovatie in het sociaal domein. Door Vincent van Munster.",
  alternates: { types: { "application/rss+xml": "/blog/rss" } },
}

export const revalidate = 3600

function Card({ item }: { item: ContentListItem }) {
  return (
    <Link
      href={`/blog/${item.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
          >
            {t}
          </span>
        ))}
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-orange-600">
        {item.title}
      </h2>
      {item.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.excerpt}</p>
      )}
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        {item.publishedAt && (
          <time dateTime={item.publishedAt.toISOString()}>
            {new Date(item.publishedAt).toLocaleDateString("nl-NL", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        {item.readingTime && <span>{item.readingTime} min lezen</span>}
      </div>
    </Link>
  )
}

export default async function BlogIndex() {
  const items = await listContent("BLOG")
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
        <p className="mt-3 text-slate-600">
          Gedachten over de toekomst van vrijwilligerswerk, de harde euro's van
          zachte impact en hoe slimme technologie het sociaal domein versterkt.
          Geschreven door Vincent van Munster, oprichter van Vrijwilligersmatch en
          WeAreImpact.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.slug} item={item} />
        ))}
      </div>
    </div>
  )
}
