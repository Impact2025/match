import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PrismaClient, ContentStatus } from "@prisma/client"

const prisma = new PrismaClient()

export const revalidate = 3600

export async function generateStaticParams() {
  const rows = await prisma.content.findMany({
    where: { type: "CITY", status: ContentStatus.PUBLISHED },
    select: { city: true },
  })
  return rows.filter((r) => r.city).map((r) => ({ stad: r.city as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stad: string }>
}): Promise<Metadata> {
  const { stad } = await params
  const item = await prisma.content.findFirst({
    where: { city: stad, type: "CITY", status: ContentStatus.PUBLISHED },
  })
  if (!item) return {}
  return {
    title: item.metaTitle ?? item.title,
    description: item.metaDescription ?? item.excerpt ?? undefined,
    alternates: { canonical: `/steden/${stad}` },
  }
}

export default async function StadDetail({
  params,
}: {
  params: Promise<{ stad: string }>
}) {
  const { stad } = await params
  const item = await prisma.content.findFirst({
    where: { city: stad, type: "CITY", status: ContentStatus.PUBLISHED },
  })
  if (!item) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    description: item.metaDescription ?? item.excerpt ?? "",
    url: `https://vrijwilligersmatch.nl/steden/${stad}`,
    about: {
      "@type": "Place",
      name: stad.charAt(0).toUpperCase() + stad.slice(1),
    },
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="prose-content text-slate-700 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-4 [&_p]:leading-relaxed [&_a]:text-orange-600 [&_a]:underline [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: item.html }}
      />
    </div>
  )
}
