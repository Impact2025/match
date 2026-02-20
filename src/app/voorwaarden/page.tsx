import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden — Vrijwilligersmatch.nl",
  description:
    "De gebruiksvoorwaarden van Vrijwilligersmatch.nl — lees wat u mag verwachten en wat wij van u verwachten.",
}

const HeartIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
)

export default function VoorwaardenPage() {
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
        <section className="py-16 sm:py-24 border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Juridisch</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter leading-[1.05] mb-6 text-gray-900">
              Gebruiksvoorwaarden
            </h1>
            <p className="text-gray-500 text-base">
              Versie 1.0 — Inwerkingtreding: 1 januari 2026<br />
              WeAreImpact, Hoofddorp — <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a>
            </p>
          </div>
        </section>

        {/* ─── CONTENT ─── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">

            <div className="space-y-10">

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 1 — Definities</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Platform:</strong> de website en applicatie Vrijwilligersmatch.nl, aangeboden door WeAreImpact.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Gebruiker:</strong> iedere natuurlijk persoon of rechtspersoon die het platform gebruikt.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Vrijwilliger:</strong> een geregistreerde gebruiker die op zoek is naar vrijwilligerswerk.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Organisatie:</strong> een geregistreerde en door WeAreImpact geverifieerde (non-profit) organisatie die vrijwilligers zoekt.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Match:</strong> een wederzijdse interesse tussen vrijwilliger en organisatie via het swipe-mechanisme of via directe uitnodiging.</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 2 — Toepasselijkheid</h2>
                <p className="text-gray-600 leading-relaxed">
                  Door een account aan te maken of het platform te gebruiken, gaat u akkoord met deze voorwaarden. WeAreImpact behoudt het recht deze voorwaarden te wijzigen. Bij wezenlijke wijzigingen wordt u per e-mail geïnformeerd. Voortgezet gebruik na wijziging geldt als aanvaarding.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 3 — Account en leeftijd</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>U dient minimaal <strong>16 jaar</strong> oud te zijn om als vrijwilliger een account aan te maken.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>U bent verantwoordelijk voor de vertrouwelijkheid van uw inloggegevens.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>U mag slechts één account aanmaken per rol (vrijwilliger of organisatiebeheerder).</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>WeAreImpact behoudt het recht accounts te verwijderen bij schending van deze voorwaarden.</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 4 — Toegestaan gebruik</h2>
                <p className="text-gray-600 leading-relaxed mb-3">U mag het platform uitsluitend gebruiken voor het rechtmatige doel waarvoor het is bedoeld: het tot stand brengen van vrijwilligersmatches. Het is <strong>niet</strong> toegestaan om:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>onjuiste, misleidende of frauduleuze informatie te verstrekken;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>het platform te gebruiken voor commerciële werving of spam;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>geautomatiseerde toegang (scraping, bots) toe te passen zonder schriftelijke toestemming;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>de rechten van andere gebruikers of derden te schenden;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>content te plaatsen die discriminerend, aanstootgevend of onwettig is.</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 5 — Aansprakelijkheid</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  WeAreImpact is een bemiddelingsplatform. Wij zijn niet aansprakelijk voor:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>de inhoud en juistheid van door gebruikers aangeleverde informatie;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>de uitkomst of duurzaamheid van een match;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>schade die voortvloeit uit het gebruik of de tijdelijke onbeschikbaarheid van het platform;</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>handelingen of nalatigheden van vrijwilligers of organisaties buiten het platform.</span></li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Voor zover aansprakelijkheid niet volledig uitgesloten kan worden, is deze beperkt tot het bedrag dat de gebruiker in het betreffende jaar aan WeAreImpact heeft betaald (€ 0 voor vrijwilligers).
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 6 — Intellectueel eigendom</h2>
                <p className="text-gray-600 leading-relaxed">
                  Alle rechten op het platform, de software, het ontwerp en de content van WeAreImpact berusten bij WeAreImpact of haar licentiegevers. U verleent WeAreImpact een niet-exclusieve, royalty-vrije licentie om door u ingediende content (profielteksten, afbeeldingen) te gebruiken voor de exploitatie van het platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 7 — Organisaties</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Organisaties worden handmatig beoordeeld en goedgekeurd door WeAreImpact.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Goedkeuring kan worden ingetrokken bij schending van deze voorwaarden of bij wijziging van de organisatieaard.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Organisaties zijn verantwoordelijk voor een correcte, transparante en respectvolle omgang met vrijwilligers.</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 8 — Toepasselijk recht en geschillen</h2>
                <p className="text-gray-600 leading-relaxed">
                  Op deze voorwaarden is <strong>Nederlands recht</strong> van toepassing. Geschillen worden bij voorkeur in onderling overleg opgelost. Indien dat niet lukt, is de <strong>Rechtbank Noord-Holland</strong> (locatie Haarlem) bij uitsluiting bevoegd.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Artikel 9 — Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vragen over deze voorwaarden? Neem contact op via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a>.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 border-t border-white/5 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <HeartIcon />
              </div>
              <span className="text-sm font-semibold text-white">Vrijwilligersmatch</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/over-ons" className="text-gray-400 hover:text-white transition-colors">Over ons</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacybeleid</Link>
              <Link href="/voorwaarden" className="text-orange-400 hover:text-orange-300 transition-colors">Gebruiksvoorwaarden</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600">
              © 2026 Vrijwilligersmatch · een initiatief van WeAreImpact · Hoofddorp
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
