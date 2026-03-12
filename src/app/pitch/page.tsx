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

              <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-xl">
                Oprichter van <span className="text-gray-900 font-medium">WeAreImpact</span> en maker van
                Vrijwilligersmatch.nl — een AI-platform dat vrijwilligers en organisaties slim koppelt
                op basis van motivatie.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed mb-12 max-w-xl">
                Sinds 2012 werk ik als sociaal ondernemer — met eigen projecten en als directeur van{" "}
                <span className="text-gray-900 font-medium">Stichting de Baan</span> — altijd met en voor
                vrijwilligers. Zij zijn het goud van elke vrijwilligersorganisatie.
              </p>

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
                    { icon: <Clock className="w-4 h-4" />, text: "Handmatige matching kost uren per week" },
                    { icon: <XCircle className="w-4 h-4" />, text: "Veel mismatches → vrijwilligers haken af" },
                    { icon: <Scale className="w-4 h-4" />, text: "Kleine organisaties krijgen minder aandacht" },
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
                    { icon: <Key className="w-4 h-4" />, text: "Keywords matchen niet met échte motivatie" },
                    { icon: <Frown className="w-4 h-4" />, text: "Frustratie: \"dit is niet wat ik zocht\"" },
                    { icon: <LogOut className="w-4 h-4" />, text: "Hoge drop-out na eerste contact" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-gray-400">
                        {item.icon}
                      </div>
                      <span className="text-sm text-gray-600 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    <span className="text-gray-900 font-bold">1 op de 3</span> vrijwilligers stopt binnen
                    3 maanden omdat de match niet klopte.
                  </p>
                </div>
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
            3. DE OPLOSSING + LIVE DEMO
        ═══════════════════════════════════════════════════════ */}
        <section id="oplossing" className="py-20 sm:py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">De oplossing</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-3">
                Live demo — 10 minuten
              </h2>
              <p className="text-gray-500 max-w-lg">
                Drie perspectieven. Eén platform. Klik op een rol om direct in de app te springen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">

              {/* A. Vrijwilliger */}
              <div className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1.5">A. Vrijwilliger</p>
                <h3 className="text-base font-bold mb-4 leading-snug text-gray-900">
                  Journey van aanmelden tot match
                </h3>
                <ul className="space-y-3 text-sm text-gray-500 flex-1 mb-7">
                  {[
                    "Onboarding op motivatie — niet skills/keywords",
                    "Slimme matches met score + uitleg waarom",
                    "\"Deze organisatie past bij jou omdat...\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/swipe"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl text-center transition-colors inline-flex items-center justify-center gap-2"
                >
                  Open vrijwilligers-app
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* B. Organisatie */}
              <div className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1.5">B. Organisatie</p>
                <h3 className="text-base font-bold mb-4 leading-snug text-gray-900">
                  Dashboard met AI-ondersteuning
                </h3>
                <ul className="space-y-3 text-sm text-gray-500 flex-1 mb-7">
                  {[
                    "Vacature aanmaken met AI-hulp (schrijft tekst)",
                    "Inkomende matches met motivatie-inzicht",
                    "\"Deze vrijwilliger zoekt betekenis en groei\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/organisation/dashboard"
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl text-center transition-colors inline-flex items-center justify-center gap-2"
                >
                  Open organisatie-dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* C. Gemeente / coördinator */}
              <div className="bg-white border border-gray-100 rounded-3xl p-7 flex flex-col shadow-sm">
                <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center mb-6">
                  <Landmark className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-violet-500 font-bold mb-1.5">C. Coördinator</p>
                <h3 className="text-base font-bold mb-4 leading-snug text-gray-900">
                  Rapportage &amp; overzicht voor gemeente
                </h3>
                <ul className="space-y-3 text-sm text-gray-500 flex-1 mb-7">
                  {[
                    "Overzicht van alle matches in de gemeente",
                    "Welke matches leiden tot plaatsingen?",
                    "Rapportage met KPI's voor gemeente",
                    "Tijdsbesparing inzichtelijk",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/dashboard"
                  className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl text-center transition-colors inline-flex items-center justify-center gap-2"
                >
                  Open coördinator-panel
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
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
