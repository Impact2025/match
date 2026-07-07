export const dynamic = "force-dynamic"

import Link from "next/link"
import { AiAssistant } from "@/components/ai/ai-assistant"
import { IrisSection } from "@/components/ai/iris-section"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"
import { getCurrentGemeente } from "@/lib/gemeente"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { FeaturedVacancies } from "@/components/home/featured-vacancies"

export default async function HomePage() {
  const gemeente = await getCurrentGemeente()

  // Brand color: gemeente primaryColor or default Vrijwilligersmatch orange
  const brand = gemeente?.primaryColor ?? "#f97316"
  const brandAccent = gemeente?.accentColor ?? gemeente?.primaryColor ?? "#fb923c"
  const tagline = gemeente?.tagline ?? null

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vrijwilligersmatch",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: "https://vrijwilligersmatch.nl",
    description:
      "Vrijwilligersmatch verbindt vrijwilligers en organisaties via swipe-matching op motivatie en waarden. Gemeenten krijgen een white-label portaal met SROI-rapportage.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: {
      "@type": "Organization",
      name: "WeAreImpact",
      url: "https://www.weareimpact.nl",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <SiteHeader />

      <main>
        {/* ─── HERO ─── */}
        <section data-tour-id="website-hero" className="relative pt-16 min-h-screen flex items-center overflow-hidden">
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
                <div className="relative w-[260px] md:w-[290px]">
                  <div className="rounded-[2.5rem] border-[6px] border-white/15 overflow-hidden shadow-2xl relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/match.png"
                      alt="Vrijwilligersmatch app"
                      className="w-full h-auto block"
                    />
                    {/* Kleur-overlay: verandert oranje naar gemeente-kleur */}
                    {gemeente && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: brand, mixBlendMode: "hue", opacity: 0.92 }}
                      />
                    )}
                  </div>

                  {/* Floating match notification */}
                  <div className="absolute -top-4 -right-6 bg-white rounded-xl px-3 py-2.5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: brand + "20" }}
                      >
                        <svg className="w-4 h-4" style={{ color: brand }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 leading-none mb-0.5">Gelukt, een koppeling!</p>
                        <p className="text-[10px] text-gray-400">
                          {gemeente ? gemeente.displayName : "Rode Kruis Amsterdam"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Text */}
              <div className="text-white text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 sm:mb-8 bg-white/10 border border-white/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandAccent }} />
                  <span className="text-xs font-medium text-white/90">
                    {tagline ?? "Matching platform voor Nederland"}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-5 sm:mb-6">
                  Vrijwilligers&shy;werk dat
                  <br />
                  <span style={{ color: brandAccent }}>bij je past.</span>
                </h1>

                <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0">
                  Blader door vrijwilligersplekken van organisaties bij jou in de buurt en
                  word gekoppeld op basis van jouw vaardigheden, interesses en beschikbaarheid.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-14">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-4 sm:py-3.5 text-white font-semibold rounded-xl transition-colors"
                    style={{ backgroundColor: brand }}
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
        <section data-tour-id="website-hoe-het-werkt" className="py-16 sm:py-24 border-t border-gray-100" id="hoe-het-werkt">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-10 sm:mb-16">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Hoe het werkt</p>
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
                  title: "Bekijk vrijwilligersplekken",
                  desc: "Blader door plekken van organisaties bij jou in de buurt. Geef aan wat je aanspreekt — links voor nee, rechts voor ja.",
                },
                {
                  step: "03",
                  title: "Ga aan de slag",
                  desc: "Bij een goede koppeling nemen we contact op met de organisatie. Je ontvangt een persoonlijke gespreksopener via de app.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-white p-6 sm:p-8 lg:p-10">
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: brand }}>{item.step}</span>
                  <h3 className="mt-4 mb-3 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED VACANCIES ─── */}
        <FeaturedVacancies brand={brand} gemeenteSlug={gemeente?.slug} />

        {/* ─── IRIS ─── */}
        <IrisSection color={brand} />

        {/* ─── FOR ORGANISATIONS ─── */}
        <section data-tour-id="website-organisaties" className="py-16 sm:py-24 bg-gray-50 border-y border-gray-100" id="organisaties">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Voor organisaties</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-6">
                  Vind de vrijwilliger die echt bij jou past
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8 sm:mb-10">
                  Maak gratis een profiel aan, voeg vrijwilligersplekken toe en ontvang geschikte
                  vrijwilligers direct in je overzicht. Geen tijdverlies, geen ruis.
                </p>
                <Link
                  href="/register?role=organisation"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: brand }}
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
                  { title: "Persoonlijke gespreksopeners", desc: "Bij elke koppeling: een op maat gemaakte gespreksopener." },
                  { title: "Realtime berichten", desc: "Communiceer direct met gematchte vrijwilligers in de app." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                      <svg className="w-5 h-5" style={{ color: brand }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section data-tour-id="website-impact" className="py-16 sm:py-20 border-b border-gray-100" id="impact">
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
        <section
          data-tour-id="website-cta"
          className="py-16 sm:py-20"
          style={{ backgroundColor: brand }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
              Klaar om te beginnen?
            </h2>
            <p className="text-white/80 mb-8 sm:mb-10 max-w-md mx-auto text-sm sm:text-base">
              Maak vandaag een gratis account aan en vind jouw perfecte vrijwilligersmatch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 sm:py-3.5 bg-white font-semibold rounded-xl hover:bg-white/90 transition-colors"
                style={{ color: brand }}
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

      <SiteFooter />
      <AiAssistant mode="presale" color={brand} />
      <TourLauncher
        tourId="website"
        accentColor={brand}
        welcomeTitle={gemeente ? `Welkom bij ${gemeente.name}!` : "Welkom bij Vrijwilligersmatch!"}
      />
    </>
  )
}
