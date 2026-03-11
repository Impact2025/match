import type { TourConfig } from "@/components/onboarding/tour/types"

export const gemeenteTour: TourConfig = {
  id: "gemeente",
  welcomeTitle: "Welkom bij het Gemeente Dashboard!",
  welcomeSubtitle:
    "Realtime inzicht in het vrijwilligerslandschap van jouw gemeente — van SDG-impact tot organisatieoverzicht.",
  welcomeEmoji: "🏛️",
  accentColor: "#7c3aed",
  steps: [
    {
      id: "gemeente-kpis",
      target: "gemeente-kpis",
      title: "Live statistieken",
      content:
        "Actieve matches, maatschappelijke waarde (SROI), retentie en aangesloten organisaties — live bijgewerkt.",
      placement: "bottom",
      spotlightPadding: 8,
    },
    {
      id: "sdg-bijdrage",
      target: "sdg-bijdrage",
      title: "SDG-bijdrage",
      content:
        "Zie hoe vrijwilligerswerk in jouw gemeente bijdraagt aan de 11 duurzame ontwikkelingsdoelen (Movisie-methodiek).",
      placement: "right",
      spotlightPadding: 8,
    },
    {
      id: "trend-chart",
      target: "trend-chart",
      title: "Maandelijkse groei",
      content:
        "Nieuwe en geaccepteerde matches per maand — ideaal voor beleidsrapportages aan de gemeenteraad.",
      placement: "left",
      spotlightPadding: 8,
    },
    {
      id: "org-table",
      target: "org-table",
      title: "Organisatieoverzicht",
      content:
        "Alle aangesloten organisaties met hun individuele uren, waarde en retentiescore op één plek.",
      placement: "top",
      spotlightPadding: 8,
    },
    {
      id: "export-btn",
      target: "export-btn",
      title: "Exporteer rapportage",
      content:
        "Download alle data als CSV. Klaar voor gebruik in beleidsrapportages en gemeenteraasvergaderingen.",
      placement: "bottom",
      spotlightPadding: 8,
    },
  ],
}
