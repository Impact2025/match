import type { Metadata } from "next"
import FAQContent from "./faq-content"

export const metadata: Metadata = {
  title: "Veelgestelde vragen | Vrijwilligersmatch",
  description: "Antwoorden op de meestgestelde vragen over Vrijwilligersmatch — voor vrijwilligers, organisaties en gemeenten.",
}

export default function FAQPage() {
  return <FAQContent />
}
