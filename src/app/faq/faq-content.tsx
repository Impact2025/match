"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

/* ─── Icons ─── */
const HeartIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

/* ─── FAQ Data ─── */
type Category = "alles" | "vrijwilligers" | "organisaties" | "matching" | "privacy" | "technisch"

interface FAQItem {
  id: string
  category: Exclude<Category, "alles">
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  // Voor vrijwilligers
  {
    id: "v1",
    category: "vrijwilligers",
    question: "Is het platform gratis voor vrijwilligers?",
    answer: "Ja, altijd. Vrijwilligers betalen nooit — onder geen enkele voorwaarde. Dat is een principiële keuze, geen marketingslogan. Vrijwilligerswerk is de samenleving die voor zichzelf zorgt. Daar hoort geen prijskaartje aan te hangen.",
  },
  {
    id: "v2",
    category: "vrijwilligers",
    question: "Hoe maak ik een profiel aan?",
    answer: "Ga naar 'Aanmelden', kies 'Ik wil vrijwilligerswerk doen' en doorloop de onboarding in vijf stappen. Je vult je beschikbaarheid, interesses en vaardigheden in — en het systeem stelt je een paar motivatievragen. Die nemen twee minuten en zijn de kern van hoe we jou matchen. Geen lange formulieren, geen CV uploaden.",
  },
  {
    id: "v3",
    category: "vrijwilligers",
    question: "Wat is een swipe en hoe gebruik ik het?",
    answer: "Swipe rechts als een vacature je aanspreekt, links als niet. Simpel als dat. Ons algoritme toont je de vacatures die het beste bij jouw profiel passen — niet willekeurig, maar op basis van wat jou drijft. Swipe je rechts én de organisatie ook? Dan is het een match en kunnen jullie direct met elkaar in gesprek.",
  },
  {
    id: "v4",
    category: "vrijwilligers",
    question: "Wat gebeurt er na een match?",
    answer: "Na een wederzijdse match opent er automatisch een chatvenster. Jullie kunnen direct contact maken, verwachtingen bespreken en afspreken voor een kennismakingsgesprek. Het platform faciliteert de verbinding — de rest doen jullie samen.",
  },
  {
    id: "v5",
    category: "vrijwilligers",
    question: "Kan ik meerdere organisaties tegelijk volgen?",
    answer: "Ja. Je kunt met meerdere organisaties matchen en gesprekken voeren. Uiteindelijk kies jij met wie je verdergaat. Er is geen limiet aan het aantal swipes of gesprekken.",
  },
  {
    id: "v6",
    category: "vrijwilligers",
    question: "Hoe pas ik mijn beschikbaarheid of interesses aan?",
    answer: "Via 'Mijn profiel' → 'Profiel bewerken'. Aanpassingen worden direct meegenomen in nieuwe matchsuggesties. Als je beschikbaarheid tijdelijk verandert — een vakantie, drukke periode — kun je je account even op pauze zetten zonder dat je alles opnieuw hoeft in te vullen.",
  },
  {
    id: "v7",
    category: "vrijwilligers",
    question: "Kunnen organisaties mijn profiel zien zonder dat ik heb geswiped?",
    answer: "Nee. Organisaties zien jouw profiel pas nadat er een wederzijdse match is — jij rechts op hun vacature, zij rechts op jou. Vóór dat moment is jouw profiel niet zichtbaar voor organisaties. Jij houdt de controle.",
  },
  {
    id: "v8",
    category: "vrijwilligers",
    question: "Hoe stop ik met vrijwilligerswerk via het platform?",
    answer: "Ga naar je profiel-instellingen en archiveer de betreffende match. Je kunt ook je volledige account deactiveren via 'Instellingen' → 'Account'. Al je data wordt dan conform onze privacyverklaring verwijderd.",
  },

  // Voor organisaties
  {
    id: "o1",
    category: "organisaties",
    question: "Wat zijn de kosten voor organisaties?",
    answer: "We werken momenteel met een pilotmodel in samenwerking met gemeenten. Neem contact op via v.munster@weareimpact.nl voor de actuele tarieven en mogelijkheden. Kleine buurtverenigingen en stichtingen krijgen altijd bijzondere aandacht — we geloven in eerlijke toegang voor alle organisaties, ongeacht hun budget.",
  },
  {
    id: "o2",
    category: "organisaties",
    question: "Hoe wordt mijn organisatie geverifieerd?",
    answer: "Alle organisaties worden handmatig beoordeeld voordat ze live gaan. We controleren de naam, het KvK-nummer en of de beschreven activiteiten aansluiten bij de missie van het platform. Dit is geen drempel — het is kwaliteitsborging. Gemiddeld duurt verificatie één werkdag.",
  },
  {
    id: "o3",
    category: "organisaties",
    question: "Hoeveel vacatures kan ik tegelijk publiceren?",
    answer: "Tijdens de pilot is er een redelijke limiet per organisatie afhankelijk van je abonnement. Contacteer ons als je meer vacatures nodig hebt — we kijken altijd naar wat werkt. Meer vacatures is overigens niet altijd beter: specifieke, goed beschreven rollen trekken betere matches aan.",
  },
  {
    id: "o4",
    category: "organisaties",
    question: "Hoe zie ik welke vrijwilligers geïnteresseerd zijn?",
    answer: "Via je organisatiedashboard zie je real-time wie er rechts heeft geswiped op jouw vacatures. Je kunt vervolgens zelf ook rechts swipen om een match te bevestigen. Na de match start het chatgesprek automatisch. Je ziet altijd de matchscore en een samenvatting van het vrijwilligersprofiel.",
  },
  {
    id: "o5",
    category: "organisaties",
    question: "Kan ik meerdere beheerders toevoegen aan mijn organisatieaccount?",
    answer: "Dit staat op de roadmap voor Q2 2026. Momenteel is er één beheerderaccount per organisatie. Als dit urgent is, neem dan contact op — we zoeken samen naar een oplossing.",
  },
  {
    id: "o6",
    category: "organisaties",
    question: "Werkt het platform ook voor gemeenten?",
    answer: "Absoluut — gemeenten zijn een kernpartner. We bieden een white-label oplossing waarbij het platform onder de gemeentenaam draait, met eigen huisstijlkleuren en branding. Vrijwilligers uit de gemeente zien alleen relevante organisaties en vacatures. Gemeenten krijgen ook toegang tot een uitgebreid impactdashboard met SDG-rapportage en SROI-berekeningen.",
  },
  {
    id: "o7",
    category: "organisaties",
    question: "Hoe exporteer ik onze vrijwilligersdata en matches?",
    answer: "Via het organisatiedashboard kun je matched vrijwilligers en gesprekshistorie inzien. Export-functionaliteit (CSV/PDF) is in ontwikkeling. Voor urgente data-exports kan je contact opnemen — we helpen handmatig.",
  },

  // Over matching
  {
    id: "m1",
    category: "matching",
    question: "Hoe werkt het matching-algoritme?",
    answer: "Ons algoritme combineert zes lagen: (1) motivatie op basis van het VFI-model en Schwartz-waardentheorie, (2) geografische afstand, (3) vaardigheidsmatch, (4) beschikbaarheid, (5) hoe recent een vacature is, en (6) een eerlijkheidsfactor die voorkomt dat grote organisaties altijd voorgaan op kleine. Motivatie weegt het zwaarst (40%), omdat onderzoek aantoont dat intrinsiek gemotiveerde vrijwilligers langer blijven en meer geven.",
  },
  {
    id: "m2",
    category: "matching",
    question: "Wat is het VFI-model?",
    answer: "VFI staat voor Volunteer Functions Inventory, ontwikkeld door onderzoekers Clary & Snyder. Het model beschrijft zes motivatiefuncties: waarden (bijdragen aan iets dat ertoe doet), begrip (leren en groeien), loopbaan (relevante ervaring opdoen), sociaal (contacten en verbinding), beschermend (omgaan met eigen gevoelens), en ego-versterkend (zelfvertrouwen en identiteit). Door te begrijpen waarom iemand vrijwilligerswerk wil doen, kunnen we veel betere matches maken dan alleen op basis van vaardigheden.",
  },
  {
    id: "m3",
    category: "matching",
    question: "Waarom zie ik sommige vacatures niet?",
    answer: "Het algoritme filtert proactief op relevantie: afstand, beschikbaarheid en motivatieprofiel bepalen wat je ziet. Vacatures die ver buiten je profiel vallen, worden niet getoond. Dat is bewust — een slimme feed is beter dan een oneindig scroll. Als je denkt dat je te weinig ziet, check dan of je profiel volledig is ingevuld.",
  },
  {
    id: "m4",
    category: "matching",
    question: "Kan ik zelf invloed uitoefenen op mijn matches?",
    answer: "Ja. Hoe meer je je profiel invult, hoe beter de suggesties. Je kunt ook direct zoeken naar organisaties of categorieën als je een specifieke voorkeur hebt. Swipe-gedrag wordt niet teruggekoppeld aan het algoritme — elke swipe is dus een schone lei.",
  },
  {
    id: "m5",
    category: "matching",
    question: "Hoe nauwkeurig is het algoritme?",
    answer: "We meten continu. In onze pilot-data blijven matches die via het motivatiemodel tot stand kwamen significant langer actief dan traditionele plaatsingen. Het systeem leert op populatieniveau — niet op individueel niveau, want persoonsgegevens worden nooit gebruikt om het algoritme persoonlijk bij te sturen.",
  },

  // Privacy & veiligheid
  {
    id: "p1",
    category: "privacy",
    question: "Wie kan mijn profiel zien?",
    answer: "Niemand, totdat er een wederzijdse match is. Vóór een match is je profiel niet zichtbaar voor organisaties. Na een match ziet de organisatie je naam, motivatieprofiel en beschikbaarheid — niet je adres of contactgegevens, tenzij jij die deelt in de chat.",
  },
  {
    id: "p2",
    category: "privacy",
    question: "Zijn jullie AVG-compliant?",
    answer: "Ja. We verwerken alleen de persoonsgegevens die nodig zijn voor de dienst, op basis van toestemming of gerechtvaardigd belang. Alle data staat op servers in de EU. We hebben een verwerkersovereenkomst met onze infrastructuurpartners en een volledige privacyverklaring beschikbaar op vrijwilligersmatch.nl/privacy.",
  },
  {
    id: "p3",
    category: "privacy",
    question: "Worden mijn gegevens gedeeld met derden?",
    answer: "Nee, nooit voor commerciële doeleinden. We delen geen profieldata met adverteerders, datamakelaars of andere externe partijen. Data wordt uitsluitend gedeeld met matched organisaties, en alleen de informatie die voor de match relevant is.",
  },
  {
    id: "p4",
    category: "privacy",
    question: "Kan ik mijn account en alle data laten verwijderen?",
    answer: "Ja. Stuur een verzoek naar v.munster@weareimpact.nl of gebruik de 'Account verwijderen'-optie in je instellingen. Binnen 30 dagen worden alle persoonsgegevens gewist, conform AVG artikel 17 (recht op vergetelheid). Geanonimiseerde statistieken voor impactrapportages blijven bewaard.",
  },
  {
    id: "p5",
    category: "privacy",
    question: "Hoe worden mijn wachtwoord en gegevens beveiligd?",
    answer: "Wachtwoorden worden nooit opgeslagen in leesbare vorm — we gebruiken bcrypt hashing met hoge kostfactor. Alle verbindingen zijn versleuteld via HTTPS/TLS. Sessietokens verlopen automatisch. We voeren periodieke beveiligingsreviews uit.",
  },

  // Technisch
  {
    id: "t1",
    category: "technisch",
    question: "Werkt het platform ook op mobiel?",
    answer: "Ja, volledig. De interface is mobile-first ontworpen en werkt op alle moderne smartphones en tablets. Er is geen aparte app nodig — de webapp gedraagt zich als een native app op je telefoon. Voeg hem toe aan je beginscherm via 'Voeg toe aan beginscherm' in je browser voor de snelste ervaring.",
  },
  {
    id: "t2",
    category: "technisch",
    question: "Welke browsers worden ondersteund?",
    answer: "Alle moderne browsers: Chrome, Firefox, Safari, Edge (laatste twee versies). Internet Explorer wordt niet ondersteund. Voor de beste swipe-ervaring raden we Chrome of Safari op mobiel aan.",
  },
  {
    id: "t3",
    category: "technisch",
    question: "Ik ben mijn wachtwoord vergeten, wat nu?",
    answer: "Ga naar de loginpagina en klik op 'Wachtwoord vergeten'. Je ontvangt een resetlink op je e-mailadres. Die link is 1 uur geldig. Check ook je spam-map als je de mail niet ziet. Lukt het nog niet? Stuur een bericht naar v.munster@weareimpact.nl.",
  },
  {
    id: "t4",
    category: "technisch",
    question: "Ik zie een foutmelding — wat moet ik doen?",
    answer: "Probeer eerst de pagina te vernieuwen en opnieuw in te loggen. Als het probleem aanhoudt, stuur dan een screenshot en beschrijving naar v.munster@weareimpact.nl. Vermeld je e-mailadres en welke actie je probeerde uit te voeren. We reageren binnen één werkdag.",
  },
  {
    id: "t5",
    category: "technisch",
    question: "Hoe werkt de real-time chat?",
    answer: "Chat-berichten worden via Pusher real-time afgeleverd — zonder dat je de pagina hoeft te vernieuwen. Je ziet ook een notificatiebadge in de navigatie als je nieuwe berichten hebt. Berichten worden versleuteld opgeslagen en zijn alleen zichtbaar voor de deelnemers aan het gesprek.",
  },
]

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "alles", label: "Alles" },
  { id: "vrijwilligers", label: "Voor vrijwilligers" },
  { id: "organisaties", label: "Voor organisaties" },
  { id: "matching", label: "Over matching" },
  { id: "privacy", label: "Privacy & veiligheid" },
  { id: "technisch", label: "Technisch" },
]

/* ─── Accordion Item ─── */
function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? "border-orange-200 shadow-sm shadow-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left bg-white"
        aria-expanded={isOpen}
      >
        <span className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${isOpen ? "text-orange-600" : "text-gray-900"}`}>
          {item.question}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 bg-white">
          <div className="h-px bg-gray-100 mb-4 sm:mb-5" />
          <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function FAQContent() {
  const [activeCategory, setActiveCategory] = useState<Category>("alles")
  const [searchQuery, setSearchQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>("v1")

  const filtered = useMemo(() => {
    let items = FAQ_ITEMS
    if (activeCategory !== "alles") {
      items = items.filter((i) => i.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (i) =>
          i.question.toLowerCase().includes(q) ||
          i.answer.toLowerCase().includes(q),
      )
    }
    return items
  }, [activeCategory, searchQuery])

  const grouped = useMemo(() => {
    if (activeCategory !== "alles" || searchQuery.trim()) return null
    const groups: Record<string, FAQItem[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered, activeCategory, searchQuery])

  const categoryLabel: Record<Exclude<Category, "alles">, string> = {
    vrijwilligers: "Voor vrijwilligers",
    organisaties: "Voor organisaties",
    matching: "Over matching",
    privacy: "Privacy & veiligheid",
    technisch: "Technisch",
  }

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <HeartIcon />
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 truncate">Vrijwilligersmatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/#hoe-het-werkt" className="hover:text-gray-900 transition-colors">Hoe het werkt</Link>
            <Link href="/#organisaties" className="hover:text-gray-900 transition-colors">Organisaties</Link>
            <Link href="/over-ons" className="hover:text-gray-900 transition-colors">Over ons</Link>
            <Link href="/faq" className="text-orange-500 font-medium">FAQ</Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Inloggen
            </Link>
            <Link href="/register" className="px-3 sm:px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
              Aanmelden
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-16">

        {/* ─── HERO ─── */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-6">Veelgestelde vragen</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-6 text-gray-900">
                Alles wat je wil weten<br />
                <span className="text-orange-500">eerlijk beantwoord.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
                Geen marketingtaal. Gewoon duidelijke antwoorden op de vragen die je écht hebt.
              </p>

              {/* Search */}
              <div className="relative max-w-lg">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="search"
                  placeholder="Zoek een vraag..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setActiveCategory("alles")
                  }}
                  className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS STRIP ─── */}
        <section className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { value: `${FAQ_ITEMS.length}`, label: "vragen beantwoord" },
                { value: "5", label: "onderwerpen" },
                { value: "< 1 dag", label: "reactietijd support" },
              ].map((s) => (
                <div key={s.label} className="py-5 sm:py-6 px-4 sm:px-8 text-center">
                  <span className="block text-xl sm:text-2xl font-bold tracking-tighter text-gray-900">{s.value}</span>
                  <span className="text-xs text-gray-400 mt-0.5 block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONTENT ─── */}
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

              {/* Sidebar — category nav */}
              <aside className="lg:w-56 flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 lg:mb-4">Onderwerp</p>
                <nav className="flex lg:flex-col gap-1.5 flex-wrap">
                  {CATEGORIES.map((cat) => {
                    const count = cat.id === "alles"
                      ? FAQ_ITEMS.length
                      : FAQ_ITEMS.filter((i) => i.category === cat.id).length
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id)
                          setSearchQuery("")
                        }}
                        className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                          activeCategory === cat.id && !searchQuery
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-xs tabular-nums ${activeCategory === cat.id && !searchQuery ? "text-orange-400" : "text-gray-300"}`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </nav>

                {/* Contact card — sticky on desktop */}
                <div className="hidden lg:block mt-8 p-5 bg-gray-950 rounded-2xl text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Staat je vraag er niet bij?</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    Stuur een bericht. We reageren binnen één werkdag.
                  </p>
                  <a
                    href="mailto:v.munster@weareimpact.nl"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Stuur een bericht
                    <ArrowIcon />
                  </a>
                </div>
              </aside>

              {/* FAQ list */}
              <div className="flex-1 min-w-0">

                {/* Search results */}
                {searchQuery.trim() && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">
                      {filtered.length === 0
                        ? "Geen resultaten voor"
                        : `${filtered.length} ${filtered.length === 1 ? "resultaat" : "resultaten"} voor`}{" "}
                      <span className="font-semibold text-gray-700">&ldquo;{searchQuery}&rdquo;</span>
                    </p>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <SearchIcon />
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">Geen vragen gevonden</p>
                    <p className="text-sm text-gray-400 mb-6">Probeer een andere zoekterm of selecteer een ander onderwerp.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveCategory("alles") }}
                      className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      Toon alle vragen
                    </button>
                  </div>
                )}

                {/* Grouped (default view) */}
                {grouped && Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat} className="mb-10 sm:mb-12">
                    <div className="flex items-center gap-3 mb-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                        {categoryLabel[cat as Exclude<Category, "alles">]}
                      </p>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="space-y-2 sm:space-y-2.5">
                      {items.map((item) => (
                        <AccordionItem
                          key={item.id}
                          item={item}
                          isOpen={openId === item.id}
                          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Flat (filtered/search view) */}
                {!grouped && filtered.length > 0 && (
                  <div className="space-y-2 sm:space-y-2.5">
                    {filtered.map((item) => (
                      <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CONTACT MOBILE ─── */}
        <section className="lg:hidden py-14 bg-gray-50 border-t border-gray-100 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Staat je vraag er niet bij?</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-gray-900 mb-4">We helpen je graag.</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              Stuur een bericht of bel direct. We reageren binnen één werkdag.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:v.munster@weareimpact.nl"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Stuur een bericht
                <ArrowIcon />
              </a>
              <a
                href="tel:0614470977"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors bg-white"
              >
                06 144 709 77
              </a>
            </div>
          </div>
        </section>

        {/* ─── CTA — DARK ─── */}
        <section className="py-20 sm:py-28 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-6">Klaar om te starten?</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-[1.1] mb-6">
                  Je match wacht.<br />
                  <span className="text-orange-400">Het duurt twee minuten.</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm sm:text-base max-w-sm">
                  Maak een gratis profiel aan en ontdek welke organisaties bij jouw motivatie en beschikbaarheid passen.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Maak gratis profiel aan
                    <ArrowIcon />
                  </Link>
                  <Link
                    href="/register?role=organisation"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-gray-300 text-sm font-medium rounded-lg hover:border-white/40 hover:text-white transition-colors"
                  >
                    Aanmelden als organisatie
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "♾", label: "Altijd gratis voor vrijwilligers" },
                  { icon: "🔒", label: "AVG-compliant & veilig" },
                  { icon: "⚡", label: "Match in minuten, niet weken" },
                  { icon: "🎯", label: "Matching op motivatie & waarden" },
                ].map((f) => (
                  <div key={f.label} className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-xl mb-3 block">{f.icon}</span>
                    <p className="text-sm text-gray-300 leading-snug font-medium">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">Vrijwilligersmatch</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Vrijwilligerswerk toegankelijker maken door slimme matching en intuïtief design.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Voor vrijwilligers</Link></li>
                <li><Link href="/register?role=organisation" className="text-gray-400 hover:text-white transition-colors">Voor organisaties</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Inloggen</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Bedrijf</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/over-ons" className="text-gray-400 hover:text-white transition-colors">Over ons</Link></li>
                <li><Link href="/faq" className="text-orange-400 hover:text-orange-300 transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacybeleid</Link></li>
                <li><Link href="/voorwaarden" className="text-gray-400 hover:text-white transition-colors">Gebruiksvoorwaarden</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © 2026 Vrijwilligersmatch · een initiatief van WeAreImpact · Hoofddorp
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
