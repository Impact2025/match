import Link from "next/link"
import type { Metadata } from "next"
import { listContent, type ContentListItem } from "@/lib/content"

export const metadata: Metadata = {
  title: "Vrijwilligerswerk in jouw stad | Vrijwilligersmatch",
  description:
    "Vind vrijwilligerswerk of vrijwilligers per stad. Lokaal matchen met SROI 4,2x impact en white-label voor gemeenten.",
  alternates: { canonical: "/steden" },
}

export const revalidate = 3600

export default async function StedenIndex() {
  const items = await listContent("CITY")
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Vrijwilligerswerk in jouw stad
        </h1>
        <p className="mt-3 text-slate-600">
          Vrijwilligersmatch verbindt lokaal. Kies je stad en vind vrijwilligerswerk
          dat bij je past, of zoek vrijwilligers voor je organisatie.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/steden/${item.slug.replace("vrijwilligerswerk-", "")}`}
            className="rounded-2xl border border-slate-200 p-5 font-semibold text-slate-900 transition hover:border-orange-300 hover:text-orange-600"
          >
            {item.title.replace("Vrijwilligerswerk in ", "").replace(" vind je via het slimme platform", "")}
          </Link>
        ))}
      </div>
    </div>
  )
}
