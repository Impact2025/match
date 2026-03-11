/**
 * SDG (Sustainable Development Goals) definitie-config
 *
 * Bevat alle 17 VN Duurzame Ontwikkelingsdoelstellingen die relevant zijn voor
 * vrijwilligerswerk, plus de mapping van platformcategorieën naar SDGs.
 *
 * Economische impact-constanten:
 * - CBS 2024 vervangingswaarde vrijwilligerswerk: €15,38/uur
 * - SROI-multiplier (Social Return on Investment): 4,2× (Movisie/SVI-methodiek)
 */

export interface SdgDefinition {
  number: number
  name: string          // kort (Engels, conform VN)
  nameNl: string        // vertaald
  description: string   // 1-zin uitleg voor weergave
  color: string         // officiële SDG kleur (hex)
  emoji: string         // SDG-icoon emoji
}

export const SDG_DEFINITIONS: SdgDefinition[] = [
  {
    number: 1,
    name: "No Poverty",
    nameNl: "Geen armoede",
    description: "Het uitbannen van armoede in al haar vormen, overal.",
    color: "#e5243b",
    emoji: "🏠",
  },
  {
    number: 3,
    name: "Good Health and Well-being",
    nameNl: "Goede gezondheid en welzijn",
    description: "Zorgen voor een gezond leven en welzijn voor iedereen.",
    color: "#4c9f38",
    emoji: "💚",
  },
  {
    number: 4,
    name: "Quality Education",
    nameNl: "Kwaliteitsonderwijs",
    description: "Inclusief en kwalitatief goed onderwijs en leven lang leren.",
    color: "#c5192d",
    emoji: "📚",
  },
  {
    number: 8,
    name: "Decent Work and Economic Growth",
    nameNl: "Eerlijk werk en economische groei",
    description: "Inclusieve economische groei, werkgelegenheid en fatsoenlijk werk.",
    color: "#a21942",
    emoji: "💼",
  },
  {
    number: 9,
    name: "Industry, Innovation and Infrastructure",
    nameNl: "Industrie, innovatie en infrastructuur",
    description: "Veerkrachtige infrastructuur, inclusieve industrialisering en innovatie.",
    color: "#fd6925",
    emoji: "⚙️",
  },
  {
    number: 10,
    name: "Reduced Inequalities",
    nameNl: "Minder ongelijkheid",
    description: "Vermindering van ongelijkheid binnen en tussen landen.",
    color: "#dd1367",
    emoji: "⚖️",
  },
  {
    number: 11,
    name: "Sustainable Cities and Communities",
    nameNl: "Duurzame steden en gemeenschappen",
    description: "Inclusieve, veilige en duurzame steden en gemeenschappen.",
    color: "#fd9d24",
    emoji: "🏘️",
  },
  {
    number: 13,
    name: "Climate Action",
    nameNl: "Klimaatactie",
    description: "Urgente actie ondernemen om klimaatverandering en effecten ervan aan te pakken.",
    color: "#3f7e44",
    emoji: "🌍",
  },
  {
    number: 15,
    name: "Life on Land",
    nameNl: "Leven op het land",
    description: "Bescherming, herstel en bevordering van duurzame ecosystemen.",
    color: "#56c02b",
    emoji: "🌱",
  },
  {
    number: 16,
    name: "Peace, Justice and Strong Institutions",
    nameNl: "Vrede, justitie en sterke instellingen",
    description: "Vreedzame, inclusieve samenlevingen en effectieve, verantwoordelijke instellingen.",
    color: "#00689d",
    emoji: "🕊️",
  },
  {
    number: 17,
    name: "Partnerships for the Goals",
    nameNl: "Partnerschap om doelstellingen te verwezenlijken",
    description: "Revitalisering van het mondiale partnerschap voor duurzame ontwikkeling.",
    color: "#19486a",
    emoji: "🤝",
  },
]

/** Mapping: categorienaam → SDG-nummers */
export const CATEGORY_SDG_MAP: Record<string, number[]> = {
  "Kinderen (0–12 jaar)":        [3, 4],
  "Jongeren (12–18 jaar)":       [4, 8],
  "Ouderen":                     [3, 10],
  "Mensen met een beperking":    [3, 10],
  "Gezinnen & Ouderschap":       [1, 3, 4],
  "Daklozen & Armoede":          [1, 10, 11],
  "Vluchtelingen & Integratie":  [10, 11, 16],
  "Verslaving & Herstel":        [3, 16],
  "Justitie & Re-integratie":    [16],
  "Onderwijs":                   [4],
  "Zorg & Welzijn":              [3, 10],
  "Gezondheid":                  [3],
  "Sport & Recreatie":           [3, 11],
  "Cultuur & Kunst":             [11],
  "Natuur & Milieu":             [11, 13, 15],
  "Dieren":                      [15],
  "Levensbeschouwing & Religie": [16, 17],
  "Internationale samenwerking": [17],
  "Buurt & Gemeenschap":         [11, 17],
  "Technologie":                 [9, 17],
  "Evenementen":                 [11],
  "Financieel / Schuldhulp":     [1, 10],
  "Anders / Overig":             [17],
}

/** Economische impact-constanten (CBS / Movisie methodiek) */
export const IMPACT_CONSTANTS = {
  /** Vervangingswaarde vrijwilligerswerk per uur (CBS 2024) */
  HOURLY_VALUE_EUR: 15.38,
  /** SROI-multiplier: elke geïnvesteerde euro genereert €4,20 maatschappelijke waarde */
  SROI_MULTIPLIER: 4.2,
  /** Geschatte gemiddelde weken voor een COMPLETED match (bij onbekende einddatum) */
  AVG_COMPLETED_WEEKS: 10,
  /** Geschatte weken voor een ACCEPTED match zonder startdatum */
  DEFAULT_ACCEPTED_WEEKS: 4,
  /** Max weken te tellen voor een lopende match (1 jaar) */
  MAX_ACTIVE_WEEKS: 52,
}

/** Haal SDG-definities op voor een lijst van nummers */
export function getSdgsByNumbers(numbers: number[]): SdgDefinition[] {
  return SDG_DEFINITIONS.filter((s) => numbers.includes(s.number))
}

/** Bereken alle relevante SDGs voor een set categorienamen */
export function getCategorySdgs(categoryNames: string[]): number[] {
  const sdgSet = new Set<number>()
  for (const name of categoryNames) {
    const sdgs = CATEGORY_SDG_MAP[name] ?? []
    sdgs.forEach((n) => sdgSet.add(n))
  }
  return Array.from(sdgSet).sort((a, b) => a - b)
}
