import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacybeleid — Vrijwilligersmatch.nl",
  description:
    "Lees hoe Vrijwilligersmatch.nl omgaat met jouw persoonsgegevens conform de AVG (GDPR).",
}

const HeartIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
)

export default function PrivacyPage() {
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
              Privacybeleid
            </h1>
            <p className="text-gray-500 text-base">
              Versie 1.0 — Inwerkingtreding: 1 januari 2026<br />
              Verantwoordelijke: WeAreImpact, Hoofddorp — <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a>
            </p>
          </div>
        </section>

        {/* ─── CONTENT ─── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-gray max-w-none">

            <div className="space-y-10">

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Wie zijn wij?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vrijwilligersmatch.nl is een platform van <strong>WeAreImpact</strong> (hierna: "wij", "ons"), gevestigd in Hoofddorp. Wij zijn verwerkingsverantwoordelijke in de zin van de Algemene Verordening Gegevensbescherming (AVG / GDPR) voor de persoonsgegevens die worden verwerkt via dit platform.
                </p>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Contactgegevens: WeAreImpact, Hoofddorp · <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a> · 06 144 709 77
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Welke gegevens verwerken wij?</h2>
                <p className="text-gray-600 leading-relaxed mb-3">Afhankelijk van je rol op het platform verwerken wij de volgende gegevens:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld via bcrypt).</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Profielgegevens:</strong> profielfoto, biografie, locatie (stad/gemeente), vaardigheden, beschikbaarheid, motivatie-indicatoren.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Gedragsgegevens:</strong> swipes (links/rechts), matches, berichtgeschiedenis.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Organisatiegegevens:</strong> naam, beschrijving, KVK-nummer (indien opgegeven), vestigingsplaats, logo.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Technische gegevens:</strong> IP-adres, browsertype, sessiecookies (uitsluitend functioneel).</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. Waarom verwerken wij uw gegevens?</h2>
                <p className="text-gray-600 leading-relaxed mb-3">Wij verwerken persoonsgegevens op basis van de volgende grondslagen (AVG Art. 6):</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Overeenkomst (Art. 6 lid 1b):</strong> om de dienst te kunnen leveren — accounts aanmaken, matchingen uitvoeren, berichten doorsturen.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Gerechtvaardigd belang (Art. 6 lid 1f):</strong> verbetering van de matchkwaliteit, fraudepreventie, platform-beveiliging.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Toestemming (Art. 6 lid 1a):</strong> voor het versturen van niet-transactionele e-mails (indien van toepassing).</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Met wie delen wij uw gegevens?</h2>
                <p className="text-gray-600 leading-relaxed mb-3">Wij verkopen uw gegevens nooit aan derden. Wij maken gebruik van de volgende sub-verwerkers:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Vercel Inc.</strong> (hosting, VS — adequaatheidsbesluit EU-VS Data Privacy Framework)</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Resend Inc.</strong> (e-mailverzending, VS — standaardcontractbepalingen)</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>OpenAI Inc.</strong> (AI-matching, VS — standaardcontractbepalingen; geen persoonsgegevens direct naar OpenAI)</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Pusher Ltd.</strong> (real-time berichten, VK — adequaatheidsbesluit)</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Neon / Supabase</strong> (PostgreSQL database, EU-regio)</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Bewaartermijnen</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Actieve accountgegevens: zolang uw account actief is.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Na verwijdering van account: gegevens worden binnen 30 dagen geanonimiseerd, tenzij een wettelijke bewaarplicht van toepassing is.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span>Logbestanden: maximaal 90 dagen.</span></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Uw rechten</h2>
                <p className="text-gray-600 leading-relaxed mb-3">Op grond van de AVG heeft u de volgende rechten:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Inzage</strong> — u kunt opvragen welke gegevens wij van u verwerken.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Rectificatie</strong> — onjuiste gegevens laten corrigeren.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Verwijdering ("recht op vergetelheid")</strong> — verwijder uw account via het profiel of neem contact op.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Bezwaar</strong> — bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Dataportabiliteit</strong> — uw gegevens ontvangen in een machine-leesbaar formaat.</span></li>
                  <li className="flex gap-2"><span className="text-orange-500 font-bold mt-0.5">·</span><span><strong>Klacht indienen</strong> — bij de Autoriteit Persoonsgegevens (<a href="https://www.autoriteitpersoonsgegevens.nl" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a>).</span></li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Stuur uw verzoek naar <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a>. Wij reageren binnen 4 weken.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. Beveiliging</h2>
                <p className="text-gray-600 leading-relaxed">
                  Wij treffen passende technische en organisatorische maatregelen om uw gegevens te beschermen. Dit omvat onder meer: versleuteling van wachtwoorden (bcrypt), HTTPS voor alle verbindingen, toegangscontrole op productiestystemen en reguliere security-reviews.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vrijwilligersmatch.nl gebruikt uitsluitend <strong>functionele cookies</strong> die strikt noodzakelijk zijn voor de werking van de dienst (authenticatie-sessie). Wij plaatsen geen tracking- of analytische cookies van derden. Er is geen cookiebanner vereist op basis van de Cookiewet omdat wij uitsluitend vrijgestelde cookies gebruiken.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">9. Wijzigingen</h2>
                <p className="text-gray-600 leading-relaxed">
                  Wij kunnen dit privacybeleid aanpassen. Bij wezenlijke wijzigingen informeren wij u per e-mail of via een melding op het platform. De meest actuele versie is altijd beschikbaar op deze pagina.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vragen of verzoeken? Neem contact op via <a href="mailto:v.munster@weareimpact.nl" className="text-orange-500 hover:underline">v.munster@weareimpact.nl</a> of schrijf naar WeAreImpact, Hoofddorp.
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
              <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">Privacybeleid</Link>
              <Link href="/voorwaarden" className="text-gray-400 hover:text-white transition-colors">Gebruiksvoorwaarden</Link>
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
