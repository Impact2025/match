import type { Metadata } from "next"
import FAQContent from "./faq-content"
import { FAQ_ITEMS } from "./faq-data"

export const metadata: Metadata = {
  title: "Veelgestelde vragen | Vrijwilligersmatch",
  description:
    "Antwoorden op de meestgestelde vragen over Vrijwilligersmatch — voor vrijwilligers, organisaties en gemeenten.",
  alternates: { canonical: "/faq" },
}

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQContent />
    </>
  )
}
