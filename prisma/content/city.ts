// Programmatische steden-landingspagina's (Programmatic SEO)
import type { ContentSeed } from "./blog"

const CITIES: { city: string; name: string; extra: string }[] = [
  { city: "amsterdam", name: "Amsterdam", extra: "Met 800.000 inwoners en een enorm verenigingsleven is Amsterdam de scherpste test voor schaalbare burgerparticipatie." },
  { city: "rotterdam", name: "Rotterdam", extra: "De havenstad kent een sterke buurtcultuur waar lokale verbinding het verschil maakt." },
  { city: "den-haag", name: "Den Haag", extra: "Als bestuurlijke stad zoekt Den Haag naar bewijsbare maatschappelijke impact voor haar wijken." },
  { city: "utrecht", name: "Utrecht", extra: "De snelst groeiende studentenstad combineert jonge energie met bestaande zorgstructuren." },
  { city: "eindhoven", name: "Eindhoven", extra: "De innovatiestad waar technologie en warme zorg elkaar ontmoeten in het sociaal domein." },
  { city: "groningen", name: "Groningen", extra: "Een hechte regio waar burgerkracht en leefbaarheid hand in hand gaan." },
  { city: "maastricht", name: "Maastricht", extra: "Zuid-Limburg toonde al dat eenzaamheid bestrijden 40-50% lagere zorgkosten kan opleveren." },
  { city: "haarlem", name: "Haarlem", extra: "Het levende voorbeeld van een white-label gemeente op Vrijwilligersmatch, naast buurgemeente Heemstede." },
  { city: "heemstede", name: "Heemstede", extra: "De bakermat van het WijHeemstede-framework: een gemeente met eigen identiteit op gedeelde infrastructuur." },
  { city: "breda", name: "Breda", extra: "Een Brabantse stad met een rijke vrijwilligerstraditie die digitaal een nieuwe impuls krijgt." },
]

export const CITY: ContentSeed[] = CITIES.map((c, i) => ({
  type: "CITY" as const,
  slug: `vrijwilligerswerk-${c.city}`,
  city: c.city,
  title: `Vrijwilligerswerk in ${c.name} vind je via het slimme platform`,
  html: `<p>Zoek je <strong>vrijwilligerswerk in ${c.name}</strong>? Of ben je een organisatie die vrijwilligers zoekt in ${c.name}? Vrijwilligersmatch verbindt burger, organisatie en gemeente in één slimme omgeving. ${c.extra}</p>

<h2>Waarom een lokaal platform voor ${c.name}</h2>
<p>Onderzoek naar succesvolle matching-platforms laat zien dat "in de buurt" matching in Nederland veel sterker werkt dan nationale platforms. Vrijwilligers blijven dichter bij huis, reiskosten dalen en deelname stijgt. In ${c.name} betekent dat: vacatures die echt bij jouw buurt passen, van organisaties die je kent.</p>

<h2>Swipe, match en maak impact</h2>
<p>Vrijwilligers swipen langs vacatures en matchen op basis van waarden, beschikbaarheid en locatie. Geen muur van tekst, maar directe ontdekking. Organisaties publiceren in minuten en volgen elke match tot aan de bevestigde plaatsing. Zo verdwijnt de drempel die traditionele vacaturebanken opwerpen.</p>

<h2>Maatschappelijke waarde met SROI 4,2x</h2>
<p>Gemeenten in ${c.name} krijgen een live dashboard met de OrgHandprint: uren, maatschappelijke waarde, SROI-factor 4,2x en SDG-scores. Zo sturen ze op impact in plaats van op tellingen. Eenzaamheid kost Nederland circa 2 miljard euro per jaar aan extra zorgkosten, elke lokale match telt mee in die berekening.</p>

<h2>Retentie die echt werkt</h2>
<p>Wie eenmaal matched, blijft niet aan zichzelf overgelaten. Geautomatiseerde check-ins na 1, 4 en 12 weken houden contact warm, en een buddy-systeem verhoogt de retentie met 52 tot 125 procent. Zo groeit ${c.name} aan een bestendige pool van betrokken vrijwilligers.</p>

<h2>Aan de slag in ${c.name}</h2>
<p>Ben je organisatie of gemeente in ${c.name}? <a href="/kennisbank/white-label-gemeente-configureren">Stel een white-label omgeving in</a> of <a href="/blog/multi-tenant-burgerplatform">lees hoe het multi-tenant model werkt</a>. Vrijwilliger? <a href="/blog/traditionele-vrijwilligersvacatures-falen">Zo vind je werk dat bij je past</a>.</p>

<h2>Onderdeel van een groter ecosysteem</h2>
<p>Vrijwilligersmatch is het vlaggenschip van <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">WeAreImpact</a>, het sociale innovatiebureau van Vincent van Munster. <a href="https://www.weareimpact.nl" target="_blank" rel="noopener">Lees meer op WeAreImpact.nl</a>.</p>`,
  excerpt: `Vrijwilligerswerk in ${c.name} vind je via Vrijwilligersmatch: lokaal matchen, SROI 4,2x impact en white-label voor gemeenten.`,
  metaTitle: `Vrijwilligerswerk ${c.name} | Vrijwilligersmatch`,
  metaDescription: `Vind vrijwilligerswerk in ${c.name} of zoek vrijwilligers voor je organisatie. Lokaal matchen met SROI 4,2x impact. Vrijwilligersmatch.`,
  keywords: [`vrijwilligerswerk ${c.name}`, `vrijwilligers ${c.name}`, `vrijwilliger gezocht ${c.name}`],
  tags: ["programmatic", "lokaal", c.city],
  relatedSlugs: ["multi-tenant-burgerplatform", "white-label-gemeente-configureren", "sroi-4-2x-sturingsinstrument"],
  publishedAt: ["2026-02-01", "2026-02-15", "2026-03-01", "2026-03-15", "2026-04-01", "2026-04-15", "2026-05-01", "2026-05-15", "2026-06-01", "2026-06-22"][i],
  readingTime: 4,
}))
