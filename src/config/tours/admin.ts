import type { TourConfig } from "@/components/onboarding/tour/types"

export const adminTour: TourConfig = {
  id: "admin",
  welcomeTitle: "Welkom in het Admin Panel!",
  welcomeSubtitle:
    "Beheer het platform, keur organisaties goed en stel het matchingalgoritme in. Een snelle rondleiding.",
  welcomeEmoji: "⚙️",
  accentColor: "#f97316",
  steps: [
    {
      id: "admin-kpis",
      target: "admin-kpis",
      title: "Platform statistieken",
      content:
        "Vrijwilligers, organisaties, vacatures en matches met week-over-week delta's — live vanuit de database.",
      placement: "bottom",
      spotlightPadding: 8,
    },
    {
      id: "sidebar-organisaties",
      target: "sidebar-organisaties",
      title: "Organisaties goedkeuren",
      content:
        "Keur nieuwe organisaties goed of wijs ze af. De badge toont het aantal openstaande aanvragen.",
      placement: "right",
      spotlightPadding: 8,
    },
    {
      id: "sidebar-scoring",
      target: "sidebar-scoring",
      title: "Matchingalgoritme instellen",
      content:
        "Stel de gewichten in van het 6-laags matchingalgoritme: motivatie, afstand, skills, versheid en fairness.",
      placement: "right",
      spotlightPadding: 8,
    },
    {
      id: "sidebar-impact",
      target: "sidebar-impact",
      title: "Impactmeting",
      content:
        "Economische waarde (CBS €15,38/uur), SROI 4,2× en SDG-bijdrage over alle gemeenten en organisaties.",
      placement: "right",
      spotlightPadding: 8,
    },
    {
      id: "sidebar-settings",
      target: "sidebar-settings",
      title: "Platform instellingen",
      content:
        "Configureer AI-modellen (GPT-4o-mini), Pusher realtime, SMTP e-mail en andere platformintegraties.",
      placement: "right",
      spotlightPadding: 8,
    },
  ],
}
