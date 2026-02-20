import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Over ons — Vrijwilligersmatch.nl",
  description:
    "Vrijwilligerswerk verdient betere infrastructuur. Lees het verhaal achter Vrijwilligersmatch.nl, onze missie, visie en kernwaarden.",
}

const HeartIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
)

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

export default function OverOnsPage() {
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
            <Link href="/over-ons" className="text-orange-500 font-medium">Over ons</Link>
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
        <section className="py-20 sm:py-32 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-6">Over ons</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-8 text-gray-900">
                Vrijwilligerswerk verdient<br />
                <span className="text-orange-500">betere infrastructuur.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl">
                Dat is de gedachte waarmee dit platform is geboren. Niet achter een bureau, niet in een vergaderzaal, maar na jaren in de dagelijkse praktijk van vrijwilligersbeheer.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FOUNDER ─── */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20">

              {/* Founder card */}
              <div>
                <div className="lg:sticky lg:top-24">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-100">
                    <span className="text-white text-2xl sm:text-3xl font-bold tracking-tight select-none">VM</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Vincent van Münster</h2>
                  <p className="text-sm text-gray-500 mb-0.5">Oprichter, Vrijwilligersmatch.nl</p>
                  <p className="text-sm text-gray-400 mb-6">WeAreImpact · Hoofddorp</p>
                  <div className="flex flex-col gap-2.5">
                    <a
                      href="mailto:v.munster@weareimpact.nl"
                      className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      v.munster@weareimpact.nl
                    </a>
                    <a
                      href="tel:0614470977"
                      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      06 144 709 77
                    </a>
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="space-y-5 text-gray-600 leading-relaxed text-[15px] sm:text-base">
                <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed">
                  Meer dan 15 jaar heb ik gewerkt met vrijwilligers.
                </p>
                <p>
                  Als directeur van Stichting de Baan in Haarlem was ik verantwoordelijk voor een organisatie met 700 deelnemers met een verstandelijke beperking en 180 vrijwilligers die elke week zorgen voor wat wij <em>geluksmomenten</em> noemen.
                </p>
                <p>
                  Ik heb gezien hoe een vrijwilliger opbloeit als de match klopt. Hoe iemand die eerst twijfelde, na drie maanden niet meer weg wil. Maar ik heb ook gezien hoe goede mensen afhaken. Niet omdat ze niet willen, maar omdat het systeem hen in de steek liet. Geen snelle reactie. Een rol die niet klopte. Verwachtingen die niet werden uitgesproken.
                </p>

                {/* Pull quote */}
                <blockquote className="border-l-4 border-orange-500 pl-6 py-3 my-8 sm:my-10">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
                    "Elke keer dat een vrijwilliger stopte, vroeg ik me af: had dit voorkomen kunnen worden?"
                  </p>
                  <footer className="mt-3 text-sm font-semibold text-orange-500 uppercase tracking-wide">
                    Het antwoord is ja.
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HET PROBLEEM ─── */}
        <section className="py-20 sm:py-28 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-8">Het probleem dat wij oplossen</p>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 mb-14 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-[1.1]">
                Niet een gebrek<br />aan bereidheid.<br />
                <span className="text-orange-400">Een mismatch.</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Nederland heeft bijna vijf miljoen actieve vrijwilligers. Dat is iets om trots op te zijn. Maar tegelijkertijd worstelen organisaties in de hele sector met hetzelfde probleem: het vinden én behouden van de juiste mensen.
                </p>
                <p>
                  Bijna zes op de tien Nederlanders staat open voor vrijwilligerswerk. De bereidheid is er. De verbinding niet.
                </p>
                <p>
                  Bestaande platforms werken als zoekmachines. Je zoekt, je filtert, je stuurt een mailtje, je wacht. Intussen is de motivatie al half weggezakt.
                </p>
                <p className="text-white font-semibold">Wij geloven dat het anders kan.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
              {[
                { value: "~5 miljoen", label: "Actieve vrijwilligers in Nederland" },
                { value: "6 op 10", label: "Nederlanders staat open voor vrijwilligerswerk" },
                { value: "1 kloof", label: "Tussen intentie en daadwerkelijke verbinding" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900/80 p-7 sm:p-8">
                  <span className="block text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-2 leading-none">{s.value}</span>
                  <span className="text-sm text-gray-400 leading-relaxed">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MISSIE ─── */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-20">
              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Onze missie</p>
                <div className="w-8 h-0.5 bg-orange-500" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-snug mb-8">
                  Vrijwilligers en maatschappelijke organisaties verbinden op basis van wie je bent — niet alleen op basis van wat je kunt.
                </p>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    Onze technologie kijkt naar motivatie, naar waarden, naar wat iemand echt drijft. Want een vrijwilliger die om de juiste redenen begint, blijft langer, geeft meer en groeit harder.
                  </p>
                  <p>
                    De interface is zo intuïtief als een app op je telefoon. Maar het systeem achter die simpele swipe is gebouwd op jaren onderzoek, bewezen psychologische modellen en technologie die leert van wat werkt.
                  </p>
                  <p className="font-semibold text-gray-900">
                    En dit is onze belofte: vrijwilligers zijn altijd gratis. Altijd. Want vrijwilligerswerk is geen product — het is de samenleving die voor zichzelf zorgt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VISIE ─── */}
        <section className="py-20 sm:py-28 bg-orange-500 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200 mb-8">Onze visie</p>
              <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] mb-8">
                "Een goed werkende vrijwilligerssector is geen vanzelfsprekendheid. Het vraagt onderhoud, aandacht en innovatie."
              </blockquote>
              <p className="text-orange-100 text-base sm:text-lg leading-relaxed">
                Wij geloven in een Nederland waar elke organisatie de vrijwilligers vindt die ze verdient, en elke vrijwilliger de plek vindt waar ze kunnen groeien. Technologie moet daarvoor dienen — niet andersom.
              </p>
            </div>
          </div>
        </section>

        {/* ─── KERNWAARDEN ─── */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Kernwaarden</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-gray-900 max-w-lg">
                Waarden die in de code zitten
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                {
                  number: "01",
                  title: "Eerlijkheid",
                  desc: "Grote organisaties krijgen geen voorrang boven kleine. Een buurtvereniging heeft evenveel recht op zichtbaarheid als een landelijke instelling. Fairness by design.",
                },
                {
                  number: "02",
                  title: "Motivatie centraal",
                  desc: "We kijken niet alleen naar wat je kunt, maar naar waarom je het wilt. Psychologisch onderbouwde matching op waarden, interesses en drijfveren.",
                },
                {
                  number: "03",
                  title: "Altijd gratis",
                  desc: "Vrijwilligers betalen nooit, onder geen enkele voorwaarde. Vrijwilligerswerk is geen product — het is de samenleving die voor zichzelf zorgt.",
                },
                {
                  number: "04",
                  title: "Echte verbinding",
                  desc: "Geen zoekmachine die je aan je lot overlaat. Een platform dat de verbinding faciliteert — van eerste swipe tot duurzame match.",
                },
              ].map((v) => (
                <div key={v.number} className="group p-6 border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 transition-all duration-200">
                  <span className="text-xs font-bold text-orange-400 tracking-widest uppercase mb-5 block">{v.number}</span>
                  <h3 className="font-bold text-gray-900 text-base mb-3">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAIRNESS BY DESIGN ─── */}
        <section className="py-20 sm:py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Eerlijkheid als ontwerpprincipe</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
                  Fairness by design
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    We hebben er bewust voor gekozen om nooit geld te laten kopen wat algoritmen bepalen. Geen betaalde zichtbaarheid. Geen premium plaatsing.
                  </p>
                  <p>
                    Dat is niet alleen een technische keuze. Het is een waarde. En het is de reden waarom organisaties die meedoen kunnen vertrouwen dat ze worden beoordeeld op wie ze zijn — niet op wat ze betalen.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4">
                {[
                  { title: "Geen betaalde rankings", desc: "Algoritmische volgorde is nooit te koop." },
                  { title: "Gelijke zichtbaarheid", desc: "Groot of klein — iedereen speelt op hetzelfde veld." },
                  { title: "Transparante matching", desc: "We leggen uit waarom een match gemaakt wordt." },
                  { title: "Geverifieerde organisaties", desc: "Alle organisaties worden handmatig beoordeeld voor toelating." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── WIE WIJ ZIJN ─── */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Wie wij zijn</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
                  Een initiatief van WeAreImpact
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    Vrijwilligersmatch.nl is een initiatief van WeAreImpact, een impactbureau voor sociaal ondernemerschap gevestigd in Hoofddorp.
                  </p>
                  <p>
                    WeAreImpact verbindt bedrijven en maatschappelijke organisaties en ontwikkelt concepten die mensen samenbrengen met betekenisvolle impact als resultaat.
                  </p>
                  <p>
                    We werken samen met vrijwilligersorganisaties, gemeenten en fondsen die geloven dat een goed werkende vrijwilligerssector onderhoud, aandacht en innovatie vraagt.
                  </p>
                </div>
              </div>

              {/* WeAreImpact card */}
              <div className="bg-gray-950 text-white rounded-2xl p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold tracking-wide">WAI</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">WeAreImpact</p>
                    <p className="text-xs text-gray-400 mt-0.5">Impactbureau · Hoofddorp</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base italic mb-8">
                  "Vrijwilligersmatch.nl is de nieuwste stap in onze missie om mensen en organisaties te verbinden waar het er echt toe doet."
                </p>
                <div className="pt-8 border-t border-white/10 space-y-2">
                  <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                    v.munster@weareimpact.nl
                  </a>
                  <a href="tel:0614470977" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                    06 144 709 77
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA — UITNODIGING ─── */}
        <section className="py-20 sm:py-28 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-6">Een uitnodiging</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-12 max-w-2xl leading-[1.1]">
              Dit platform is er voor iedereen die iets wil bijdragen.
            </h2>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
              {[
                {
                  tag: "Organisaties",
                  desc: "Wil je meedoen aan onze pilot? Neem contact op en we bespreken wat er mogelijk is.",
                  cta: "Stuur een bericht",
                  href: "mailto:v.munster@weareimpact.nl",
                  highlight: true,
                },
                {
                  tag: "Fondsen & gemeenten",
                  desc: "Zie je wat wij zien in de kracht van betere vrijwilligersinfrastructuur? Dan praten we graag.",
                  cta: "Plan een gesprek",
                  href: "mailto:v.munster@weareimpact.nl",
                  highlight: false,
                },
                {
                  tag: "Vrijwilligers",
                  desc: "Klaar om iets te betekenen? Maak je profiel aan. Je match wacht.",
                  cta: "Maak je profiel aan",
                  href: "/register",
                  highlight: false,
                },
              ].map((item) => (
                <div
                  key={item.tag}
                  className={`p-6 sm:p-7 rounded-2xl border flex flex-col ${
                    item.highlight
                      ? "border-orange-500/60 bg-orange-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${item.highlight ? "text-orange-400" : "text-gray-500"}`}>
                    {item.tag}
                  </span>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">{item.desc}</p>
                  <a
                    href={item.href}
                    className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                      item.highlight ? "text-orange-400 hover:text-orange-300" : "text-white hover:text-orange-400"
                    }`}
                  >
                    {item.cta}
                    <ArrowIcon />
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">
                  Of bel direct:{" "}
                  <a href="tel:0614470977" className="text-white font-semibold hover:text-orange-400 transition-colors">
                    06 144 709 77
                  </a>
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Vincent van Münster, oprichter — Haarlem / Nieuw-Vennep, 2026
              </p>
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
                <li><Link href="/over-ons" className="text-orange-400 hover:text-orange-300 transition-colors">Over ons</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacybeleid</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gebruiksvoorwaarden</a></li>
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
