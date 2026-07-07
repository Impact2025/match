"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

export type BlogCardData = {
  slug: string
  title: string
  excerpt: string | null
  metaTitle: string | null
  publishedAt: Date | null
  readingTime: number | null
  tags: string[]
  views: number
  featured: boolean
}

function formatDate(d: Date | null): string {
  if (!d) return ""
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(d)
}

function formatViews(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(1).replace(".", ",") + "k"
  return String(v)
}

export default function BlogExplorer({ posts }: { posts: BlogCardData[] }) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort((a, b) => a.localeCompare(b, "nl"))
  }, [posts])

  const mostRead = useMemo(
    () => [...posts].sort((a, b) => b.views - a.views).slice(0, 5),
    [posts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag)
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      return matchesTag && matchesQuery
    })
  }, [posts, query, activeTag])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-orange-500 mb-2">Vrijwilligersmatch Blog</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 max-w-3xl">
          Thought leadership over vrijwilligerswerk, matching en maatschappelijke impact
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Scherpe observaties en bewezen aanpakken voor gemeenten, welzijnsorganisaties en
          beleidsmakers. Geschreven vanuit de praktijk van Vincent van Munster.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        {/* Main column */}
        <div>
          {/* Search + tag filter */}
          <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm pb-4 mb-6 border-b border-gray-100">
            <div className="relative">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek artikelen op trefwoord, onderwerp of tag…"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeTag === null
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Alles
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeTag === tag
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-5">
            {filtered.length} {filtered.length === 1 ? "artikel" : "artikelen"}
            {activeTag ? ` · tag: ${activeTag}` : ""}
            {query ? ` · zoek: “${query}”` : ""}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-gray-500 py-12 text-center">Geen artikelen gevonden voor deze zoekopdracht.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {filtered.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(p.publishedAt)}</span>
                    {p.readingTime ? <span>· {p.readingTime} min lezen</span> : null}
                    {p.views > 0 && <span>· {formatViews(p.views)} weergaven</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: most read */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Meest gelezen
            </h3>
            <ol className="space-y-3">
              {mostRead.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="flex gap-3 group items-start"
                  >
                    <span className="text-lg font-bold text-orange-500/70 w-6 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors leading-snug">
                      {p.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>

            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Voor gemeenten</h4>
              <p className="text-xs text-gray-500 mb-3">
                Bekijk de white-label gemeente-module en de Handprint SROI-rapportage.
              </p>
              <Link
                href="/kennisbank"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Naar de kennisbank →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
