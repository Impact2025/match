import type { Metadata } from "next"
import { listContent } from "@/lib/content"
import KbExplorer from "@/components/blog/KbExplorer"

const BASE_URL = "https://vrijwilligersmatch.nl"

export const metadata: Metadata = {
  title: "Kennisbank — Vrijwilligersmatch",
  description:
    "Handleidingen en how-to's voor gemeente-admins en organisatie-admins: white-label instellen, AI-assistenten Vera en Sam, de Handprint SROI-module, QR-check-in en de match-lifecycle.",
  alternates: { canonical: `${BASE_URL}/kennisbank` },
  openGraph: {
    title: "Kennisbank — Vrijwilligersmatch",
    description:
      "Stap-voor-stap uitleg om Vrijwilligersmatch in te richten en te bedienen. Voor gemeenten en organisaties.",
    url: `${BASE_URL}/kennisbank`,
    type: "website",
  },
}

export default async function KennisbankIndex() {
  const items = await listContent("KB")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vrijwilligersmatch Kennisbank",
    url: `${BASE_URL}/kennisbank`,
    description:
      "Handleidingen en how-to's voor het inrichten en bedienen van Vrijwilligersmatch.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KbExplorer items={items} />
    </>
  )
}
