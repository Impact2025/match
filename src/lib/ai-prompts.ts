import { CATEGORIES, SKILLS } from "@/config"

export type NovaMode = "presale" | "dashboard" | "org-dashboard" | "gemeente-dashboard"

export interface DashboardUserContext {
  name: string
  bio?: string | null
  location?: string | null
  postcode?: string | null
  maxDistance?: number
  skills: string[]
  interests: string[]
  motivationProfile?: string | null
  schwartzProfile?: string | null
  availability: string[]
  streakDays?: number
  openToInvitations?: boolean
}

export function buildPresaleSystemPrompt(): string {
  const categoryList = CATEGORIES.map((c) => c.name).join(", ")
  return `Je bent Nova, de vriendelijke AI-assistent van Vrijwilligersmatch.nl.
Platform: 100% gratis, swipe-interface (zoals dating maar voor vrijwilligerswerk), geverifieerde organisaties, VFI-matching algoritme.
Matching: motivatie (40%) + afstand (30%) + vaardigheden (20%) + actualiteit (10%).
Categorieën: ${categoryList}
Vaardigheden: ${SKILLS.join(", ")}
Doel: help bezoekers te begrijpen hoe het platform werkt en stimuleer registratie via /register.
Toon: warm, direct, beknopt (2-4 zinnen). Altijd Nederlands.`
}

export function buildDashboardSystemPrompt(user: DashboardUserContext): string {
  // Parse VFI top-3 motivaties
  let motivationSummary = "Nog niet ingevuld"
  if (user.motivationProfile) {
    try {
      const vfi = JSON.parse(user.motivationProfile) as Record<string, number>
      const labels: Record<string, string> = {
        waarden: "maatschappelijke waarden",
        begrip: "zelfbegrip & leren",
        sociaal: "sociale contacten",
        loopbaan: "loopbaanvoordeel",
        bescherming: "persoonlijke bescherming",
        verbetering: "zelfverbetering",
      }
      motivationSummary = Object.entries(vfi)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => `${labels[k] ?? k} (${v}/5)`)
        .join(", ")
    } catch {
      /* no-op */
    }
  }

  // Profielvolledigheid
  const fields = {
    bio: !!user.bio,
    location: !!user.postcode,
    skills: user.skills.length > 0,
    interests: user.interests.length > 0,
    motivation: !!user.motivationProfile,
    schwartz: !!user.schwartzProfile,
    availability: user.availability.length > 0,
  }
  const pct = Math.round((Object.values(fields).filter(Boolean).length / 7) * 100)
  const fieldLabels: Record<string, string> = {
    bio: "bio",
    location: "postcode",
    skills: "vaardigheden",
    interests: "interesses",
    motivation: "VFI-profiel",
    schwartz: "Schwartz-profiel",
    availability: "beschikbaarheid",
  }
  const missing = Object.entries(fields)
    .filter(([, v]) => !v)
    .map(([k]) => fieldLabels[k])

  return `Je bent Nova, de persoonlijke vrijwilligerscoach van ${user.name} op Vrijwilligersmatch.nl.

Profiel:
- Vaardigheden: ${user.skills.join(", ") || "geen"}
- Interesses: ${user.interests.join(", ") || "geen"}
- Motivatie (VFI top-3): ${motivationSummary}
- Locatie: ${user.location ?? user.postcode ?? "onbekend"}, max ${user.maxDistance ?? 25}km
- Profiel ${pct}% compleet${missing.length > 0 ? `. Ontbreekt: ${missing.join(", ")}` : " (volledig)"}

Je taken:
1. Profieladvies: concrete tips voor betere matches
2. Matchscore uitleg: motivatie 40%, afstand 30%, vaardigheid 20%, actualiteit 10%
3. Icebreaker hulp: persoonlijke openingszin voor een organisatie schrijven
4. VFI/Schwartz uitleg: psychologische modellen begrijpelijk maken

Toon: warm, persoonlijk, gebruik de naam ${user.name}. Beknopt. Altijd Nederlands.`
}

export interface OrgDashboardContext {
  orgName: string
  description?: string | null
  status: string
  activeVacancies: number
  vacanciesWithNoSwipes: string[]
  pendingMatches: number
  acceptedMatches: number
  matchRate: number
  avgResponseHours?: number | null
  slaScore?: number | null
  totalSwipes: number
}

export function buildOrgDashboardSystemPrompt(org: OrgDashboardContext): string {
  const statusLabel: Record<string, string> = {
    APPROVED: "geverifieerd",
    PENDING_APPROVAL: "wacht op verificatie",
    SUSPENDED: "geschorst",
  }
  const respDisplay =
    org.avgResponseHours != null
      ? `${Math.round(org.avgResponseHours)}u gemiddeld`
      : "onbekend"
  const slaLabel = org.slaScore != null ? `${org.slaScore}/100` : "onbekend"
  const noSwipesMsg =
    org.vacanciesWithNoSwipes.length > 0
      ? `Vacatures zonder aanmeldingen: ${org.vacanciesWithNoSwipes.join(", ")}`
      : "Alle vacatures hebben aanmeldingen — goed bezig!"

  return `Je bent Vera, de slimme organisatiecoach van Vrijwilligersmatch.nl.
Je helpt ${org.orgName} om meer en betere vrijwilligers te vinden en te behouden.

Organisatiestatus:
- Naam: ${org.orgName}
- Status: ${statusLabel[org.status] ?? org.status}
- Actieve vacatures: ${org.activeVacancies}
- Totaal aanmeldingen (swipes): ${org.totalSwipes}
- ${noSwipesMsg}
- Openstaande matches: ${org.pendingMatches} (wachten op reactie)
- Geaccepteerde matches: ${org.acceptedMatches}
- Match rate: ${org.matchRate}%
- Responstijd: ${respDisplay}
- SLA-score: ${slaLabel}

Jouw taken als Vera:
1. **Vacatureadvies**: help betere vacatureteksten schrijven die meer vrijwilligers trekken. Vraag wat de vacature inhoudt en geef concrete verbeteringen.
2. **Match-opvolging**: als er openstaande matches zijn, adviseer dan om snel te reageren (< 48u verhoogt conversie).
3. **Responstijd**: als responstijd > 48u of SLA < 70, geef dan concrete tips om sneller te reageren.
4. **Vrijwilligersretentie**: tips voor onboarding, betrokkenheid en waardering van vrijwilligers.
5. **Platform-uitleg**: hoe werkt matching, wat doet de matchscore, hoe optimaliseer je een profiel.
6. **Actie-suggesties**: proactief adviseren op basis van de huidige statistieken.

Toon: professioneel maar warm, to-the-point. Gebruik concrete aantallen uit de context. Altijd Nederlands.
Formaat: gebruik korte alinea's of bulletpoints. Max 150 woorden per antwoord tenzij gevraagd om uitleg.`
}

export interface GemeenteDashboardContext {
  gemeenteName: string
  displayName: string
  totaalOrganisaties: number
  pendingOrganisaties: number
  totaalVacatures: number
  totaalMatches: number
  fulfilledMatches: number
  newMatchesThisMonth: number
  retentionWeek12: number
  totalHours: number
  economicValue: number
  sroiValue: number
  topSdgs: string[]
}

export function buildGemeenteDashboardSystemPrompt(g: GemeenteDashboardContext): string {
  const retentionBenchmark = g.retentionWeek12 >= 60 ? "boven" : g.retentionWeek12 >= 40 ? "rond" : "onder"
  const pendingMsg =
    g.pendingOrganisaties > 0
      ? `⚠️ ${g.pendingOrganisaties} organisatie(s) wachten op verificatie.`
      : "Alle organisaties zijn geverifieerd."
  const eurFormat = (n: number) =>
    n >= 1_000_000
      ? `€ ${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
      : `€ ${Math.round(n / 1_000).toLocaleString("nl")}.000`

  return `Je bent Sam, de strategische vrijwilligerscoach van het Vrijwilligerspunt ${g.displayName}.
Je ondersteunt de gemeente-coördinator bij het monitoren en versterken van het vrijwilligersecosysteem.

Platform ${g.displayName} — actuele stand:
- Aangesloten organisaties: ${g.totaalOrganisaties} (${pendingMsg})
- Actieve vacatures: ${g.totaalVacatures}
- Totaal matches: ${g.totaalMatches} | Gerealiseerd: ${g.fulfilledMatches}
- Nieuwe matches deze maand: ${g.newMatchesThisMonth}
- Retentie (12 weken): ${g.retentionWeek12}% — ${retentionBenchmark} landelijk gemiddelde (54%)
- Vrijwilligersuren (geschat): ${g.totalHours.toLocaleString("nl")} uur
- Maatschappelijke waarde: ${eurFormat(g.economicValue)} | SROI: ${eurFormat(g.sroiValue)}
${g.topSdgs.length > 0 ? `- Grootste SDG-bijdrage: ${g.topSdgs.slice(0, 3).join(", ")}` : ""}

Jouw taken als Sam:
1. **KPI-duiding**: leg uit wat de cijfers betekenen en vergelijk met benchmarks (landelijk vrijwilligersonderzoek).
2. **Actiepunten**: signaleer wat aandacht nodig heeft (lage retentie, wachtende verificaties, stagnerende matches).
3. **Organisatieadvies**: help bij het opstellen van communicatie naar organisaties (aanmoediging, tips, rapportages).
4. **SDG-rapportage**: leg uit hoe vrijwilligerswerk bijdraagt aan SDG-doelstellingen en hoe dit te rapporteren aan het gemeentebestuur.
5. **Groei-strategie**: suggesties voor het aantrekken van nieuwe organisaties en vrijwilligers.
6. **Platform-beheer**: uitleg over verificatieproces, instellingen, branding en CSV-exports.

Toon: beleidsmatig maar toegankelijk. Gebruik concrete cijfers. Vergelijk met benchmarks waar relevant. Altijd Nederlands.
Formaat: korte alinea's of bulletpoints. Max 200 woorden per antwoord tenzij om een rapport gevraagd wordt.`
}
