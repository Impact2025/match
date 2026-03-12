import type { TourConfig } from "@/components/onboarding/tour/types"

export const websiteTour: TourConfig = {
  id: "website",
  welcomeTitle: "Welkom bij Vrijwilligersmatch!",
  welcomeSubtitle:
    "Laat me je in 30 seconden laten zien wat dit platform voor jou kan betekenen.",
  welcomeEmoji: "❤️",
  accentColor: "#f97316",
  steps: [
    {
      id: "website-hero",
      target: "website-hero",
      title: "Vrijwilligerswerk dat bij je past",
      content:
        "Swipe door vacatures van geverifieerde organisaties. Ons AI-algoritme koppelt jou op basis van vaardigheden, locatie en motivatie.",
      placement: "bottom",
      spotlightPadding: 16,
    },
    {
      id: "website-hoe-het-werkt",
      target: "website-hoe-het-werkt",
      title: "Drie stappen naar impact",
      content:
        "Profiel aanmaken → swipe door vacatures → match! Bij een match sturen we automatisch een persoonlijke gespreksopener.",
      placement: "bottom",
      spotlightPadding: 12,
    },
    {
      id: "website-organisaties",
      target: "website-organisaties",
      title: "Voor organisaties: gratis en slim",
      content:
        "Organisaties plaatsen vacatures en ontvangen gematchte kandidaten direct in hun dashboard. Geen tijdverlies, geen ruis.",
      placement: "bottom",
      spotlightPadding: 12,
    },
    {
      id: "website-impact",
      target: "website-impact",
      title: "Meetbare maatschappelijke impact",
      content:
        "Gratis voor iedereen, landelijk beschikbaar, 100% geverifieerde organisaties. Elke match wordt omgezet in concrete SDG-rapportages.",
      placement: "top",
      spotlightPadding: 12,
    },
    {
      id: "website-cta",
      target: "website-cta",
      title: "Klaar om te beginnen?",
      content:
        "Aanmelden als vrijwilliger of organisatie duurt minder dan 2 minuten. Gratis, altijd.",
      placement: "top",
      spotlightPadding: 16,
    },
  ],
}
