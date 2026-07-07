import type { Metadata } from "next"
import { listContent } from "@/lib/content"
import BlogExplorer from "@/components/blog/BlogExplorer"

const BASE_URL = "https://vrijwilligersmatch.nl"

export const metadata: Metadata = {
  title: "Blog — Vrijwilligersmatch",
  description:
    "Thought leadership over vrijwilligerswerk, slimme matching, SROI en digitale transformatie in het sociaal domein. Voor gemeenten, welzijnsorganisaties en beleidsmakers.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "Blog — Vrijwilligersmatch",
    description:
      "Scherpe observaties en bewezen aanpakken voor vrijwilligerswerk, matching en maatschappelijke impact.",
    url: `${BASE_URL}/blog`,
    type: "website",
  },
}

export default async function BlogIndexPage() {
  const posts = await listContent("BLOG")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vrijwilligersmatch Blog",
    url: `${BASE_URL}/blog`,
    description:
      "Thought leadership over vrijwilligerswerk, matching en maatschappelijke impact.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogExplorer posts={posts} />
    </>
  )
}
