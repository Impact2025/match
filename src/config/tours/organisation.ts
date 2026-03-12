import type { TourConfig } from "@/components/onboarding/tour/types"

export const organisationTour: TourConfig = {
  id: "organisation",
  welcomeTitle: "Welkom bij het Organisatieportaal!",
  welcomeSubtitle:
    "Vind de vrijwilligers die perfect passen bij jouw organisatie. Hier is een korte rondleiding.",
  welcomeEmoji: "🏢",
  accentColor: "#f97316",
  steps: [
    {
      id: "org-stats",
      target: "org-stats",
      title: "Jouw activiteit in één oogopslag",
      content:
        "Nieuwe matches, actieve chats, profielweergaven en je match rate — alles realtime bijgewerkt.",
      placement: "bottom",
      spotlightPadding: 8,
    },
    {
      id: "org-vacancies-section",
      target: "org-vacancies-section",
      title: "Mijn vacatures",
      content:
        "Bekijk snel de status van je actieve vacatures. Klik op ••• om te bewerken of te verwijderen.",
      placement: "top",
      spotlightPadding: 8,
    },
    {
      id: "nav-org-vacatures",
      target: "nav-org-vacatures",
      title: "Vacatures beheren",
      content:
        "Maak nieuwe vacatures aan — de AI genereert automatisch embeddings voor optimale matching.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-org-zoeken",
      target: "nav-org-zoeken",
      title: "Vrijwilligers zoeken",
      content:
        "Zoek proactief op skills, motivatieprofiel en beschikbaarheid. Stuur zelf een uitnodiging.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-org-chat",
      target: "nav-org-chat",
      title: "Berichten met vrijwilligers",
      content:
        "Zodra een match is gemaakt, open je hier de chat. Snel en persoonlijk contact verhoogt je kans op een succesvolle samenwerking.",
      placement: "top",
      spotlightPadding: 10,
    },
    {
      id: "nav-org-impact",
      target: "nav-org-impact",
      title: "Jouw maatschappelijke impact",
      content:
        "Zie de economische waarde van jouw vrijwilligers in euro's en jouw bijdrage aan de SDG-doelstellingen.",
      placement: "top",
      spotlightPadding: 10,
    },
  ],
}
