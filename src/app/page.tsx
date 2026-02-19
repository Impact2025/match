import Link from "next/link"

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 antialiased">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">Vrijwilligersmatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#hoe-het-werkt" className="hover:text-gray-900 transition-colors">Hoe het werkt</a>
            <a href="#organisaties" className="hover:text-gray-900 transition-colors">Organisaties</a>
            <a href="#impact" className="hover:text-gray-900 transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
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

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-20 lg:py-0">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left — Phone mockup */}
              <div className="flex justify-center lg:justify-start">
                {/* Phone frame */}
                <div className="relative w-[260px] md:w-[290px]">
                  <div className="rounded-[2.5rem] border-[6px] border-white/15 bg-white overflow-hidden shadow-2xl">
                    {/* Status bar */}
                    <div className="bg-gray-900 px-5 pt-3 pb-1 flex justify-between items-center">
                      <span className="text-white text-[10px] font-semibold">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-2 border border-white/70 rounded-[2px] relative">
                          <div className="absolute inset-[2px] right-auto w-[60%] bg-white rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* App header */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </div>
                        <span className="text-[11px] font-bold text-gray-900">Vrijwilligersmatch</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100" />
                    </div>

                    {/* Vacancy card in app */}
                    <div className="bg-gray-50 p-3">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Card image */}
                        <div className="h-32 bg-orange-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div className="p-3">
                          {/* Org */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0" />
                            <span className="text-[10px] text-gray-400 font-medium">Rode Kruis Amsterdam</span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight">EHBO Ondersteuner bij Evenementen</h3>
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-full">4 uur/week</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">Amsterdam</span>
                          </div>
                          {/* Match score */}
                          <div className="flex items-center gap-1">
                            <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full w-[82%] bg-orange-500 rounded-full" />
                            </div>
                            <span className="text-[10px] font-bold text-orange-500">82%</span>
                          </div>
                        </div>
                      </div>

                      {/* Swipe buttons */}
                      <div className="flex justify-center items-center gap-5 mt-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-red-100 flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Bottom nav */}
                    <div className="bg-white border-t border-gray-100 px-6 py-2 flex justify-around">
                      {[
                        <path key="s" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
                        <path key="m" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
                        <path key="c" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
                      ].map((d, i) => (
                        <div key={i} className={`w-5 h-5 ${i === 0 ? "text-orange-500" : "text-gray-300"}`}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">{d}</svg>
                        </div>
                      ))}
                    </div>
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
                        <p className="text-[11px] font-bold text-gray-900 leading-none mb-0.5">It&apos;s a match! 🎉</p>
                        <p className="text-[10px] text-gray-400">Rode Kruis Amsterdam</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Text */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-white/10 border border-white/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-xs font-medium text-white/90">Matching platform voor Nederland</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.0] mb-6">
                  Vrijwilligers&shy;werk dat
                  <br />
                  <span className="text-orange-400">bij je past.</span>
                </h1>

                <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-md">
                  Swipe door vacatures van geverifieerde organisaties en word
                  gekoppeld op basis van jouw vaardigheden, interesses en locatie.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-14">
                  <Link
                    href="/register"
                    className="inline-flex justify-center items-center px-6 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Ik ben vrijwilliger
                  </Link>
                  <Link
                    href="/register?role=organisation"
                    className="inline-flex justify-center items-center px-6 py-3.5 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Ik ben een organisatie
                  </Link>
                </div>

                {/* Inline stats */}
                <div className="flex items-center divide-x divide-white/20">
                  {[
                    { value: "15k+", label: "Matches" },
                    { value: "850+", label: "Organisaties" },
                    { value: "4.9", label: "Gebruikersscore" },
                  ].map((s, i) => (
                    <div key={i} className={`${i === 0 ? "pr-6" : "px-6"}`}>
                      <span className="block text-2xl font-bold text-white tracking-tight">{s.value}</span>
                      <span className="text-xs text-white/50 uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-24 border-t border-gray-100" id="hoe-het-werkt">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Hoe het werkt</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 max-w-lg">
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
                <div key={item.step} className="bg-white p-8 lg:p-10">
                  <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">{item.step}</span>
                  <h3 className="mt-4 mb-3 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FOR ORGANISATIONS ─── */}
        <section className="py-24 bg-gray-50 border-y border-gray-100" id="organisaties">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Voor organisaties</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
                  Vind de vrijwilliger die echt bij jou past
                </h2>
                <p className="text-gray-500 leading-relaxed mb-10">
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
                  <li key={item.title} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-xl">
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
        <section className="py-20 border-b border-gray-100" id="impact">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {[
                { value: "15.000+", label: "Succesvolle matches" },
                { value: "850+", label: "Geverifieerde organisaties" },
                { value: "22", label: "Steden in Nederland" },
                { value: "4.9/5", label: "Gemiddelde beoordeling" },
              ].map((stat, i) => (
                <div key={i} className="text-center py-8 px-4">
                  <span className="block text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-1">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-20 bg-orange-500">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
              Klaar om impact te maken?
            </h2>
            <p className="text-orange-100 mb-10 max-w-md mx-auto">
              Maak vandaag een gratis account aan en vind jouw perfecte vrijwilligersmatch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Word vrijwilliger
              </Link>
              <Link
                href="/register?role=organisation"
                className="px-8 py-3.5 bg-transparent border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/70 transition-colors"
              >
                Aanmelden als organisatie
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
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
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Over ons</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacybeleid</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gebruiksvoorwaarden</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © 2026 Vrijwilligersmatch. Gemaakt voor sociale impact.
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
    </div>
  )
}
