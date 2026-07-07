import Link from "next/link"
import type { Metadata } from "next"
import { listContent, type ContentListItem } from "@/lib/content"

export const metadata: Metadata = {
  title: "Kennisbank | Vrijwilligersmatch",
  description:
    "Handleidingen en how-to's voor gemeente-admins en organisatie-admins: white-label instellen, AI-assistenten, handprint, QR-check-in en de match-lifecycle.",
  alternates: { canonical: "/kennisbank" },
}

export const revalidate = 3600

function Card({ item }: { item: ContentListItem }) {
  return (
    <Link
      href={`/kennisbank/${item.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
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

export default async function KennisbankIndex() {
  const items = await listContent("KB")
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Kennisbank</h1>
        <p className="mt-3 text-slate-600">
          Praktische handleidingen voor wie met Vrijwilligersmatch werkt. Stap voor
          stap, zonder vaktaal. Voor gemeente-admins en organisatie-admins.
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
