import Link from "next/link"
import type { Metadata } from "next"
import {
  Heart, Target, Lightbulb, MapPin,
  Clock, XCircle, Scale, BarChart2,
  Key, Frown, LogOut,
  User, Building2, Landmark,
  CheckCircle, ChevronDown, ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Demo Presentatie — Vrijwilligersmatch",
  description: "Pitch deck voor de demo van Vrijwilligersmatch.",
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 truncate">
              Vrijwilligersmatch
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#probleem" className="hover:text-gray-900 transition-colors">Probleem</a>
            <a href="#oplossing" className="hover:text-gray-900 transition-colors">Oplossing</a>
            <a href="#voordeel" className="hover:text-gray-900 transition-colors">Voordeel</a>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Start demo
          </Link>
        </nav>
      </header>

      <main>

        {/* ═══════════════════════════════════════════════════════
            1. WIE BEN IK
        ═══════════════════════════════════════════════════════ */}
        <section className="relative pt-16 min-h-screen flex items-center overflow-hidden border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-orange-50 border border-orange-100 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="text-xs font-medium text-orange-600">WeAreImpact · Hoofddorp</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
                Hoi, ik ben
                <br />
                <span className="text-orange-500">Vincent</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
                Oprichter van <span className="text-gray-900 font-medium">WeAreImpact</span> en maker van
                Vrijwilligersmatch.nl — een AI-platform dat vrijwilligers en organisaties slim koppelt
                op basis van motivatie. Sinds 2012 werk ik als sociaal ondernemer — met eigen projecten
                en als directeur van{" "}
                <span className="text-gray-900 font-medium">Stichting de Baan</span> — altijd met en voor
                vrijwilligers. Zij zijn het goud van elke vrijwilligersorganisatie.
              </p>

              {/* Tijdlijn */}
              <div className="flex flex-col gap-0 mb-12 max-w-lg">
                {[
                  {
                    year: "2009",
                    text: "Eerste datingsite voor mensen met een beperking — matchen op basis van wie je bent, niet wat je kunt.",
                  },
                  {
                    year: "2016",
                    text: "Idee voor slimme vrijwilligersmatching bedacht tijdens het groeiprogramma van het Oranje Fonds. Toen nog te duur om te bouwen.",
                  },
                  {
                    year: "2026",
                    text: "AI maakt het eindelijk toegankelijk voor iedereen. Vrijwilligersmatch.nl is live.",
                  },
                ].map((item, i, arr) => (
                  <div key={item.year} className="flex gap-4">
                    {/* Lijn + dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-orange-600">{item.year}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 my-1" />
                      )}
                    </div>
                    {/* Tekst */}
                    <div className={i < arr.length - 1 ? "pb-6 pt-1" : "pt-1"}>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Target className="w-4 h-4 text-orange-500" />,
                    label: "Missie",
                    value: "Vrijwilligerswerk toegankelijker maken door slimme technologie",
                  },
                  {
                    icon: <MapPin className="w-4 h-4 text-orange-500" />,
                    label: "Achtergrond",
                    value: "Ondernemer, product builder, impact-first denker vanuit Hoofddorp",
                  },
                  {
                    icon: <Lightbulb className="w-4 h-4 text-orange-500" />,
                    label: "Aanpak",
                    value: "Motivatie centraal — niet keywords, maar échte drijfveren als basis",
                  },
                ].map((card) => (
                  <div key={card.label} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      {card.icon}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{card.label}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-14">
                <a href="#probleem" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                  Bekijk het probleem
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. HET PROBLEEM
        ═══════════════════════════════════════════════════════ */}
        <section id="probleem" className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Het probleem</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter max-w-xl">
                Het huidige systeem werkt niet
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Voor coördinatoren */}
              <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Voor coördinatoren</p>
                    <p className="text-sm font-semibold text-gray-900">Vrijwilligerscentrale &amp; organisaties</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  {[
                    { icon: <Clock className="w-4 h-4" />, text: "Uren per week kwijt aan matching die toch niet werkt" },
                    { icon: <XCircle className="w-4 h-4" />, text: "Het gevoel van zinloos werk: matches die na drie maanden afvallen" },
                    { icon: <Scale className="w-4 h-4" />, text: "Kleine organisaties vissen steeds achter het net" },
                    { icon: <BarChart2 className="w-4 h-4" />, text: "Geen inzicht in wat werkt en wat niet" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-gray-400">
                        {item.icon}
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Voor vrijwilligers */}
              <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Voor vrijwilligers</p>
                    <p className="text-sm font-semibold text-gray-900">De mensen die willen helpen</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  {[
                    { icon: <Frown className="w-4 h-4" />, text: "Je meldt je aan, maar hoort nooit meer iets" },
                    { icon: <XCircle className="w-4 h-4" />, text: "Je komt ergens terecht — en het klopt gewoon niet" },
                    { icon: <LogOut className="w-4 h-4" />, text: "Teleurstelling → afhaken, soms voor altijd" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-gray-400">
                        {item.icon}
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gedeelde stat — brug tussen beide perspectieven */}
            <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="shrink-0 w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-0.5">1 op de 3 vrijwilligers stopt binnen 3 maanden</p>
                <p className="text-sm text-gray-500">
                  Omdat de match niet klopte. Verlies voor de vrijwilliger — en al dat matchwerk voor niets.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <a
                href="#oplossing"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Bekijk de oplossing
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. DE OPLOSSING — DRIE PERSPECTIEVEN
        ═══════════════════════════════════════════════════════ */}
        <section id="oplossing" className="py-20 sm:py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">De oplossing</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Drie perspectieven
              </h2>
            </div>

            {/* Perspectief 1 — Vrijwilliger */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-10 py-12 border-t border-gray-200 items-start">
              <div>
                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1">Vrijwilliger</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  Eindelijk een match die klopt
                </h3>
              </div>
              <div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Het huidige systeem werkt als een vacaturebank. Je zoekt op trefwoord, ziet een lijst, en kiest blind.
                  Vrijwilligersmatch brengt de motivatie van de vrijwilliger in kaart — op basis van{" "}
                  <span className="text-gray-900 font-medium">VFI</span> en{" "}
                  <span className="text-gray-900 font-medium">Schwartz-waarden</span> — en matcht op die drijfveren.
                  Iemand die eenzaamheid bij ouderen wil doorbreken, belandt niet bij een klussendienst.
                  Iemand die wil leren en groeien, niet in een repetitieve rol.
                </p>
                <div className="flex items-start gap-2.5 p-4 bg-white border border-gray-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Wat het oplost:</span>{" "}
                    motivatiemismatch, snelle uitval, het gevoel van "dit past toch niet bij me."
                  </p>
                </div>
                <div className="mt-4">
                  <Link href="/swipe" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                    Zie de vrijwilligers-app <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Perspectief 2 — Coördinator */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-10 py-12 border-t border-gray-200 items-start">
              <div>
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1">Coördinator</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  Minder handwerk, betere uitkomsten
                </h3>
              </div>
              <div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Een coördinator doet nu enorm veel handmatig: vacatureteksten schrijven, vrijwilligers benaderen,
                  afspraken inplannen — zonder systeem dat waarschuwt als iemand dreigt af te haken.
                  Vrijwilligersmatch neemt dat grotendeels over. Het platform genereert automatisch vacatureteksten,
                  matcht zelfstandig op profiel en locatie, en signaleert via AI wanneer betrokkenheid afneemt.
                  Zo kan de coördinator zich richten op de relatie, niet de administratie.
                </p>
                <div className="flex items-start gap-2.5 p-4 bg-white border border-gray-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Wat het oplost:</span>{" "}
                    onhoudbare werkdruk, trage plaatsingen, blinde vlekken in retentie.
                  </p>
                </div>
                <div className="mt-4">
                  <Link href="/organisation/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                    Zie het organisatie-dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Perspectief 3 — Gemeente */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-10 py-12 border-t border-gray-200 items-start">
              <div>
                <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                  <Landmark className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-violet-500 font-bold mb-1">Gemeente</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  Sturen op impact
                </h3>
              </div>
              <div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Een gemeente financiert welzijnswerk, maar heeft weinig inzicht in wat dat oplevert.
                  Hoeveel vrijwilligers zijn actief? Hoe lang blijven ze? Welke organisaties hebben urgent tekort?
                  Vrijwilligersmatch biedt een rapportagedashboard dat al die vragen beantwoordt in real-time —
                  zodat beleidsmakers vrijwilligersbeleid kunnen onderbouwen, subsidies verantwoorden
                  en bijsturen waar het misgaat.
                </p>
                <div className="flex items-start gap-2.5 p-4 bg-white border border-gray-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Wat het oplost:</span>{" "}
                    de kloof tussen vrijwilligersinzet en beleidsverantwoording, gebrek aan sturingsdata.
                  </p>
                </div>
                <div className="mt-4">
                  <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-500 hover:text-violet-600 transition-colors">
                    Zie het gemeentedashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Vergelijking — NLvoorelkaar */}
            <div className="mt-6 border-t border-gray-200 pt-12">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Waarom fundamenteel anders?</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">NLvoorelkaar &amp; bestaande platforms</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Logistieke infrastructuur — brengt vraag en aanbod bij elkaar op basis van trefwoorden en locatie.
                    Nuttig, maar agnostisch over motivatie. Het platform weet niet <em>waarom</em> iemand zich aanmeldt.
                  </p>
                  <p className="text-sm font-semibold text-gray-900">Lost het vinden-probleem op.</p>
                </div>
                <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-3">Vrijwilligersmatch</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Psychologische infrastructuur — de kern van het systeem is motivatie-gedreven matching,
                    gebaseerd op VFI en Schwartz-waarden. Daardoor voorspelbaar betere retentie en meer impact.
                  </p>
                  <p className="text-sm font-semibold text-orange-600">Lost het blijven-probleem op.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3B. LIVE DEMO KNOPPEN
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Live demo — 10 minuten</p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { label: "A. Vrijwilliger", desc: "Journey van aanmelden tot match", href: "/swipe", color: "orange" },
                { label: "B. Organisatie", desc: "Dashboard met AI-ondersteuning", href: "/organisation/dashboard", color: "blue" },
                { label: "C. Coördinator", desc: "Rapportage & overzicht gemeente", href: "/admin/dashboard", color: "violet" },
              ].map((item) => {
                const colors: Record<string, { bg: string; text: string; btn: string }> = {
                  orange: { bg: "bg-orange-100", text: "text-orange-500", btn: "bg-orange-500 hover:bg-orange-600" },
                  blue:   { bg: "bg-blue-50",   text: "text-blue-500",   btn: "bg-blue-500 hover:bg-blue-600" },
                  violet: { bg: "bg-violet-50", text: "text-violet-500", btn: "bg-violet-500 hover:bg-violet-600" },
                }
                const c = colors[item.color]
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${c.text}`}>{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{item.desc}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-4 ${c.btn} transition-colors`}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. DRIEVOUDIG VOORDEEL
        ═══════════════════════════════════════════════════════ */}
        <section id="voordeel" className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Drievoudig voordeel</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Iedereen wint
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* Vrijwilligers */}
              <div className="p-7 border border-gray-100 rounded-3xl">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <User className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Vrijwilligers</h3>
                <ul className="space-y-3.5">
                  {[
                    "Matches die echt passen → hogere tevredenheid",
                    "Minder zoeken, betere fit vanaf dag 1",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organisaties */}
              <div className="p-7 border border-gray-100 rounded-3xl">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Organisaties</h3>
                <ul className="space-y-3.5">
                  {[
                    "Gemotiveerde vrijwilligers → minder verloop",
                    "Eerlijke verdeling — kleine org's ook zichtbaar",
                    "Minder tijd kwijt aan slechte matches",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gemeente / coördinator */}
              <div className="p-7 border border-gray-100 rounded-3xl">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center mb-6">
                  <Landmark className="w-4 h-4 text-violet-500" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Gemeente &amp; coördinator</h3>
                <ul className="space-y-3.5">
                  {[
                    "Uren bespaard op handmatige matching",
                    "Data-gedreven: wat werkt wel/niet?",
                    "Hogere plaatsingsrate → meetbare impact",
                    "Rapportage naar gemeente: onderbouwing beleid",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. CTA
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-orange-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-4">
              Klaar voor de live demo?
            </h2>
            <p className="text-orange-100 mb-10 max-w-md mx-auto">
              Log in met het demo-account en zie het platform in actie. Alle data is gesimuleerd voor Heemstede.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="/login"
                className="px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Inloggen als demo-gebruiker
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/70 transition-colors"
              >
                Bekijk de homepage
              </Link>
            </div>
            <p className="text-orange-200/70 text-xs">
              vrijwilliger@heemstede-demo.nl · demo1234
            </p>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 py-8 px-6 text-center">
        <p className="text-xs text-gray-600">
          © 2026 Vrijwilligersmatch · een initiatief van WeAreImpact · Hoofddorp
        </p>
      </footer>

    </div>
  )
}
