import Link from "next/link"
import { AiAssistant } from "@/components/ai/ai-assistant"

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 truncate">Vrijwilligersmatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#hoe-het-werkt" className="hover:text-gray-900 transition-colors">Hoe het werkt</a>
            <a href="#organisaties" className="hover:text-gray-900 transition-colors">Organisaties</a>
            <a href="#impact" className="hover:text-gray-900 transition-colors">Impact</a>
            <Link href="/over-ons" className="hover:text-gray-900 transition-colors">Over ons</Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              Aanmelden
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ─── HERO ─── */}
        <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
          {/* Full-bleed background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vrijwilligersmatch.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Solid dark overlay — no gradient */}
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full py-16 lg:py-0">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left — Phone mockup — only on large screens */}
              <div className="hidden lg:flex justify-center lg:justify-start">
                {/* Phone frame */}
                <div className="relative w-[260px] md:w-[290px]">
                  <div className="rounded-[2.5rem] border-[6px] border-white/15 overflow-hidden shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/match.png"
                      alt="Vrijwilligersmatch app"
                      className="w-full h-auto block"
                    />
                  </div>

                  {/* Floating match notification */}
                  <div className="absolute -top-4 -right-6 bg-white rounded-xl px-3 py-2.5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 leading-none mb-0.5">It&apos;s a match!</p>
                        <p className="text-[10px] text-gray-400">Rode Kruis Amsterdam</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Text */}
              <div className="text-white text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 sm:mb-8 bg-white/10 border border-white/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-white/90">Matching platform voor Nederland</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-5 sm:mb-6">
                  Vrijwilligers&shy;werk dat
                  <br />
                  <span className="text-orange-400">bij je past.</span>
                </h1>

                <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0">
                  Swipe door vacatures van geverifieerde organisaties en word
                  gekoppeld op basis van jouw vaardigheden, interesses en locatie.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-14">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-4 sm:py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Ik ben vrijwilliger
                  </Link>
                  <Link
                    href="/register?role=organisation"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-4 sm:py-3.5 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Ik ben een organisatie
                  </Link>
                </div>

                {/* Inline stats */}
                <div className="flex items-center justify-center lg:justify-start divide-x divide-white/20">
                  {[
                    { value: "Gratis", label: "Voor iedereen" },
                    { value: "Heel NL", label: "Bereikbaar" },
                    { value: "100%", label: "Geverifieerd" },
                  ].map((s, i) => (
                    <div key={i} className={`${i === 0 ? "pr-4 sm:pr-6" : "px-4 sm:px-6"}`}>
                      <span className="block text-lg sm:text-xl font-bold text-white tracking-tight">{s.value}</span>
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-16 sm:py-24 border-t border-gray-100" id="hoe-het-werkt">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-10 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Hoe het werkt</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 max-w-lg">
                Drie stappen naar zinvol vrijwilligerswerk
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden">
              {[
                {
                  step: "01",
                  title: "Maak je profiel",
                  desc: "Voeg je vaardigheden, interesses en beschikbaarheid toe. Hoe meer je deelt, hoe beter de matches.",
                },
                {
                  step: "02",
                  title: "Swipe vacatures",
                  desc: "Blader door vacatures van geverifieerde organisaties bij jou in de buurt. Links voor nee, rechts voor ja.",
                },
                {
                  step: "03",
                  title: "Start je impact",
                  desc: "Bij een match nemen we contact met de organisatie. Je ontvangt een automatisch gespreksstarter via de app.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-white p-6 sm:p-8 lg:p-10">
                  <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">{item.step}</span>
                  <h3 className="mt-4 mb-3 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FOR ORGANISATIONS ─── */}
        <section className="py-16 sm:py-24 bg-gray-50 border-y border-gray-100" id="organisaties">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Voor organisaties</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
                  Vind de vrijwilliger die echt bij jou past
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8 sm:mb-10">
                  Maak gratis een profiel aan, voeg vacatures toe en ontvang gematchte kandidaten
                  direct in je dashboard. Geen tijdverlies, geen ruis.
                </p>
                <Link
                  href="/register?role=organisation"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Aanmelden als organisatie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </Link>
              </div>

              <ul className="space-y-4">
                {[
                  { title: "Geverifieerd platform", desc: "Alle organisaties worden handmatig goedgekeurd." },
                  { title: "Slimme matching", desc: "Ons algoritme koppelt op vaardigheden, locatie en motivatie." },
                  { title: "AI-gegenereerde icebreakers", desc: "Bij elke match: een persoonlijke gespreksopener." },
                  { title: "Realtime berichten", desc: "Communiceer direct met gematchte vrijwilligers in de app." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
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

        {/* ─── IMPACT STATS ─── */}
        <section className="py-16 sm:py-20 border-b border-gray-100" id="impact">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {[
                { value: "Gratis", label: "Altijd gratis voor vrijwilligers" },
                { value: "Heel NL", label: "Landelijk beschikbaar" },
                { value: "100%", label: "Geverifieerde organisaties" },
                { value: "AI", label: "Slimme matching" },
              ].map((stat, i) => (
                <div key={i} className="text-center py-6 sm:py-8 px-2 sm:px-4">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-1">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-16 sm:py-20 bg-orange-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
              Klaar om impact te maken?
            </h2>
            <p className="text-orange-100 mb-8 sm:mb-10 max-w-md mx-auto text-sm sm:text-base">
              Maak vandaag een gratis account aan en vind jouw perfecte vrijwilligersmatch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 sm:py-3.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Word vrijwilliger
              </Link>
              <Link
                href="/register?role=organisation"
                className="px-8 py-4 sm:py-3.5 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/70 transition-colors"
              >
                Aanmelden als organisatie
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    />
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
              <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <AiAssistant mode="presale" />
    </div>
  )
}
