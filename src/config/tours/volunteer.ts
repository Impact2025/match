import type { TourConfig } from "@/components/onboarding/tour/types"

export const volunteerTour: TourConfig = {
  id: "volunteer",
  welcomeTitle: "Welkom bij Vrijwilligersmatch!",
  welcomeSubtitle:
    "Vind vrijwilligerswerk dat écht bij jou past. We laten je in een minuut zien hoe alles werkt.",
  welcomeEmoji: "👋",
  accentColor: "#f97316",
  steps: [
    {
      id: "profile-completeness",
      target: "profile-completeness",
      title: "Maak je profiel compleet",
      content:
        "Hoe meer je invult, hoe beter de AI je kan matchen. Streef naar 100% voor de beste resultaten!",
      placement: "bottom",
      spotlightPadding: 8,
    },
    {
      id: "swipe-deck",
      target: "swipe-deck",
      title: "Swipe op vacatures",
      content:
        "Swipe rechts ✓ als een vacature je aanspreekt, links ✗ als het niet past. De AI leert van elke keuze!",
      placement: "top",
      spotlightPadding: 12,
    },
    {
      id: "nav-matches",
      target: "nav-matches",
      title: "Jouw matches",
      content:
        "Hier vind je al je matches en uitnodigingen van organisaties. Accepteer of weiger ze direct.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-chat",
      target: "nav-chat",
      title: "Berichten",
      content:
        "Direct contact met organisaties zodra je gematcht bent. Stel vragen en plan een kennismakingsgesprek.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-kaart",
      target: "nav-kaart",
      title: "Kaart",
      content:
        "Ontdek vacatures in jouw buurt op de interactieve kaart. Filter op afstand en categorie.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-profiel",
      target: "nav-profiel",
      title: "Jouw profiel",
      content:
        "Beheer interesses, beschikbaarheid en motivatieprofiel. Bekijk je matchstatistieken en impactstreaks.",
      placement: "top",
      spotlightPadding: 10,
    },
  ],
}
