import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo Presentatie — Vrijwilligersmatch",
  description: "Pitch deck voor de demo van Vrijwilligersmatch.",
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return (
    <div className="bg-gray-950 text-white antialiased">

      {/* ─── STICKY HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 backdrop-blur-sm border-b border-white/5">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Vrijwilligersmatch</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <a href="#probleem" className="hover:text-white transition-colors">Probleem</a>
            <span>·</span>
            <a href="#oplossing" className="hover:text-white transition-colors">Oplossing</a>
            <span>·</span>
            <a href="#voordeel" className="hover:text-white transition-colors">Voordeel</a>
            <span>·</span>
            <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">Live demo →</Link>
          </div>
        </nav>
      </header>

      <main className="pt-14">

        {/* ═══════════════════════════════════════════════════════
            1. WIE BEN IK
        ═══════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-10 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              WeAreImpact · Hoofddorp
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-8">
              Hoi, ik ben{" "}
              <span className="text-orange-400">Vincent</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-12 max-w-xl mx-auto">
              Oprichter van <span className="text-white font-medium">WeAreImpact</span> en maker van
              Vrijwilligersmatch.nl — een AI-platform dat vrijwilligers en organisaties slim koppelt.
            </p>

            {/* Bio cards */}
            <div className="grid sm:grid-cols-3 gap-3 text-left">
              {[
                { emoji: "🎯", label: "Missie", value: "Vrijwilligerswerk toegankelijker maken door slimme technologie" },
                { emoji: "🏙️", label: "Achtergrond", value: "Ondernemer, product builder, impact-first denker vanuit Hoofddorp" },
                { emoji: "💡", label: "Aanpak", value: "Motivatie centraal — niet keywords, maar échte drijfveren als basis" },
              ].map((card) => (
                <div key={card.label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                  <div className="text-2xl mb-3">{card.emoji}</div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{card.label}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <a href="#probleem" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Bekijk het probleem
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. HET PROBLEEM
        ═══════════════════════════════════════════════════════ */}
        <section id="probleem" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">

            <div className="mb-16 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">Het probleem</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
                Het huidige systeem<br />
                <span className="text-red-400">werkt niet</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Voor coördinatoren */}
              <div className="bg-red-950/30 border border-red-900/40 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-red-900/50 rounded-xl flex items-center justify-center text-lg">🏢</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold">Voor coördinatoren</p>
                    <p className="text-sm font-semibold text-white">WijHeemstede &amp; organisaties</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: "⏱️", text: "Handmatige matching kost uren per week" },
                    { icon: "❌", text: "Veel mismatches → vrijwilligers haken af" },
                    { icon: "⚖️", text: "Kleine organisaties krijgen minder aandacht" },
                    { icon: "🔍", text: "Geen inzicht in wat werkt en wat niet" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                      <span className="text-sm text-red-200/80 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Voor vrijwilligers */}
              <div className="bg-amber-950/30 border border-amber-900/40 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-amber-900/50 rounded-xl flex items-center justify-center text-lg">🙋</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Voor vrijwilligers</p>
                    <p className="text-sm font-semibold text-white">De mensen die willen helpen</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: "🔑", text: "Keywords matchen niet met échte motivatie" },
                    { icon: "😤", text: "Frustratie: \"dit is niet wat ik zocht\"" },
                    { icon: "🚪", text: "Hoge drop-out na eerste contact" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                      <span className="text-sm text-amber-200/80 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Stat callout */}
                <div className="mt-7 p-4 bg-amber-900/30 border border-amber-800/40 rounded-2xl">
                  <p className="text-xs text-amber-300/70 leading-relaxed">
                    <span className="text-amber-300 font-bold text-sm">1 op de 3</span> vrijwilligers stopt binnen
                    3 maanden omdat de match niet klopte.
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow to solution */}
            <div className="mt-16 text-center">
              <a href="#oplossing" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-sm font-semibold hover:bg-orange-500/20 transition-colors">
                Bekijk de oplossing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. DE OPLOSSING + LIVE DEMO
        ═══════════════════════════════════════════════════════ */}
        <section id="oplossing" className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-5xl mx-auto">

            <div className="mb-16 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">De oplossing</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">
                Live demo —{" "}
                <span className="text-orange-400">10 minuten</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Drie perspectieven. Eén platform. Klik op een rol om direct in de app te springen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">

              {/* A. Vrijwilliger journey */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
                <div className="w-12 h-12 bg-orange-500/15 rounded-2xl flex items-center justify-center text-2xl mb-6">🙋</div>
                <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-2">A. Vrijwilliger</p>
                <h3 className="text-lg font-bold mb-4 leading-tight">De journey van aanmelden tot match</h3>
                <ul className="space-y-3 text-sm text-gray-400 flex-1 mb-7">
                  {[
                    "Onboarding op motivatie (niet skills/keywords)",
                    "Slimme matches met % score + uitleg waarom",
                    "\"Deze organisatie past bij jou omdat...\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/swipe"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  Open vrijwilligers-app →
                </Link>
              </div>

              {/* B. Organisatie dashboard */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
                <div className="w-12 h-12 bg-blue-500/15 rounded-2xl flex items-center justify-center text-2xl mb-6">🏢</div>
                <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">B. Organisatie</p>
                <h3 className="text-lg font-bold mb-4 leading-tight">Dashboard met AI-ondersteuning</h3>
                <ul className="space-y-3 text-sm text-gray-400 flex-1 mb-7">
                  {[
                    "Vacature aanmaken met AI-hulp (schrijft tekst)",
                    "Inkomende matches met motivatie-inzicht",
                    "\"Deze vrijwilliger zoekt betekenis en groei\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/organisation/dashboard"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  Open organisatie-dashboard →
                </Link>
              </div>

              {/* C. WijHeemstede admin */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col">
                <div className="w-12 h-12 bg-purple-500/15 rounded-2xl flex items-center justify-center text-2xl mb-6">🏛️</div>
                <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">C. WijHeemstede</p>
                <h3 className="text-lg font-bold mb-4 leading-tight">Admin &amp; rapportage voor gemeente</h3>
                <ul className="space-y-3 text-sm text-gray-400 flex-1 mb-7">
                  {[
                    "Overzicht van alle matches in de gemeente",
                    "Welke matches leiden tot plaatsingen?",
                    "Rapportage met KPI's voor gemeente",
                    "Tijdsbesparing inzichtelijk",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/dashboard"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  Open admin-panel →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. DRIEVOUDIG VOORDEEL
        ═══════════════════════════════════════════════════════ */}
        <section id="voordeel" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">

            <div className="mb-16 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">Drievoudig voordeel</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
                Iedereen wint
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">

              {/* Vrijwilligers */}
              <div className="rounded-3xl p-7 bg-orange-500/8 border border-orange-500/20">
                <div className="text-3xl mb-5">🙋</div>
                <h3 className="text-base font-bold text-orange-300 mb-5 uppercase tracking-wide text-xs">Vrijwilligers</h3>
                <ul className="space-y-3">
                  {[
                    "Matches die echt passen → hogere tevredenheid",
                    "Minder zoeken, betere fit vanaf dag 1",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="text-orange-400 shrink-0 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organisaties */}
              <div className="rounded-3xl p-7 bg-blue-500/8 border border-blue-500/20">
                <div className="text-3xl mb-5">🏢</div>
                <h3 className="text-base font-bold text-blue-300 mb-5 uppercase tracking-wide text-xs">Organisaties</h3>
                <ul className="space-y-3">
                  {[
                    "Gemotiveerde vrijwilligers → minder verloop",
                    "Eerlijke verdeling (kleine org's ook zichtbaar)",
                    "Minder tijd kwijt aan slechte matches",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="text-blue-400 shrink-0 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* WijHeemstede */}
              <div className="rounded-3xl p-7 bg-purple-500/8 border border-purple-500/20">
                <div className="text-3xl mb-5">🏛️</div>
                <h3 className="text-base font-bold text-purple-300 mb-5 uppercase tracking-wide text-xs">WijHeemstede</h3>
                <ul className="space-y-3">
                  {[
                    "Renate bespaart uren per week",
                    "Data-gedreven: wat werkt wel/niet?",
                    "Hogere plaatsingsrate → meetbare impact",
                    "Rapportage naar gemeente: onderbouwing beleid",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="text-purple-400 shrink-0 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. CTA — START DEMO
        ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 border-t border-white/5 text-center bg-white/[0.02]">
          <div className="max-w-xl mx-auto">
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4">
              Klaar voor de live demo?
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Log in met het demo-account en zie het platform in actie. Alle data is gesimuleerd voor Heemstede.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Inloggen als demo-gebruiker
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors"
              >
                Bekijk de homepage
              </Link>
            </div>

            <p className="text-xs text-gray-600 mt-8">
              vrijwilliger@heemstede-demo.nl · demo1234
            </p>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600">
          © 2026 Vrijwilligersmatch · een initiatief van WeAreImpact · Hoofddorp
        </p>
      </footer>

    </div>
  )
}
