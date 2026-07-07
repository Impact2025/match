import type { Metadata } from "next"
import Link from "next/link"
import {
  Heart,
  HandHeart,
  Users,
  Building2,
  Search,
  Sparkles,
  CalendarCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Quote,
} from "lucide-react"
import { getCurrentGemeente } from "@/lib/gemeente"

const BASE_URL = "https://vrijwilligersmatch.nl"

export async function generateMetadata(): Promise<Metadata> {
  const gemeente = await getCurrentGemeente()
  const place = gemeente?.displayName ?? "jouw gemeente"
  const title = gemeente
    ? `Vrijwilligerswerk in ${place} — vind vrijwilligers en organisaties`
    : "Vrijwilligerswerk vind je hier — voor vrijwilligers én organisaties"
  const description = gemeente
    ? `Vrijwilligersmatch in ${place}: swipe-matching op motivatie en waarden. Voor inwoners die willen helpen en organisaties die vrijwilligers zoeken.`
    : "Vrijwilligersmatch verbindt vrijwilligers en organisaties via swipe-matching op motivatie en waarden. Voor wie wil helpen én voor wie vrijwilligers zoekt."
  const canonical = `${BASE_URL}/vrijwilligerswerk`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  }
}

const faqs = [
  {
    q: "Ik ben vrijwilliger, moet ik een cv uploaden?",
    a: "Nee. Je begint met een korte swipetest op wat je motiveert en waar je goed in bent. Op basis daarvan krijg je matches die écht bij je passen — geen muur van tekst, geen sollicitatie.",
  },
  {
    q: "Ik zoek vrijwilligers voor mijn organisatie, hoe werkt dat?",
    a: "Je plaatst je vacatures en onze AI-assistent Vera verrijkt ze automatisch. Vrijwilligers swipen naar jouw activiteiten en jij ziet direct wie gemotiveerd is. Handmatig werven en bellen wordt zo minimaal.",
  },
  {
    q: "Is Vrijwilligersmatch gratis voor vrijwilligers?",
    a: "Ja. Vrijwilligers gebruiken de app gratis. Organisaties en gemeenten werken met een white-label portaal met SROI-rapportage.",
  },
  {
    q: "Kan onze gemeente een eigen omgeving krijgen?",
    a: "Ja. Gemeenten krijgen een white-label portaal met eigen URL, logo en kleuren, plus de Handprint SROI-module die de maatschappelijke waarde van vrijwilligerswerk automatisch doorrekent.",
  },
  {
    q: "Hoe worden vrijwilligers behouden?",
    a: "Retentietracking signaleert wanneer iemand dreigt uit te vallen, zodat je vroeg kunt bijsturen. Uit onderzoek blijkt dat een persoonlijke buddy de retentie tot 52% verhoogt.",
  },
]

const forVolunteers = [
  { icon: Search, title: "Ontdek in plaats van solliciteren", text: "Swipe door activiteiten die aansluiten op jouw motivatie. Geen cv, geen sollicitatiebrief." },
  { icon: Sparkles, title: "Matches op waarden", text: "Het algoritme kijkt naar het Schwartz-waardenprofiel en het VFI-motivatiemodel. Je matcht op wie je bent." },
  { icon: CalendarCheck, title: "Direct aan de slag", text: "Van swipe naar bevestigde plaatsing in een paar tikken. Je ziet meteen waar en wanneer." },
]

const forOrganisations = [
  { icon: HandHeart, title: "Vera schrijft je vacatures", text: "De AI-assistent verrijkt je organisatiebeschrijving en maakt elke vacature aantrekkelijk en leesbaar." },
  { icon: Users, title: "Vind gemotiveerde vrijwilligers", text: "Vrijwilligers swipen actief naar jouw activiteiten. Jij spreekt mensen die écht willen." },
  { icon: TrendingUp, title: "Behoud ze met data", text: "Retentietracking en SROI-rapportage tonen je impact en signaleren wanneer iemand dreigt uit te vallen." },
]

const deepen = [
  {
    kicker: "Voor organisaties",
    title: "Vacatures schrijven met AI-assistent Vera",
    text: "Zo verrijk je je organisatiebeschrijving en maak je elke vacature aantrekkelijk.",
    href: "/kennisbank/vacatures-optimaliseren-vera",
    tag: "Kennisbank",
  },
  {
    kicker: "Voor gemeenten",
    title: "De gemeentelijke Handprint en SROI uitgelegd",
    text: "Hoe de OrgHandprint-module de maatschappelijke waarde automatisch doorrekent.",
    href: "/kennisbank/gemeentelijke-handprint-sroi",
    tag: "Kennisbank",
  },
  {
    kicker: "Thought leadership",
    title: "Waarom traditionele vrijwilligersvacatures falen",
    text: "Wat we leren van swipe-cultuur en hoe dat de uitval van jonge vrijwilligers keert.",
    href: "/blog/traditionele-vrijwilligersvacatures-falen",
    tag: "Blog",
  },
  {
    kicker: "Impact",
    title: "SROI vrijwilligerswerk berekenen (4,2x factor)",
    text: "Hoe je de maatschappelijke waarde van vrijwilligerswerk hard maakt voor de wethouder.",
    href: "/blog/sroi-vrijwilligerswerk-berekenen",
    tag: "Blog",
  },
]

export default async function VrijwilligerswerkPage() {
  const gemeente = await getCurrentGemeente()
  const place = gemeente?.displayName ?? null
  const brand = gemeente?.primaryColor ?? "#f97316"
  const heroTitle = place
    ? `Vrijwilligerswerk in ${place}`
    : "Vrijwilligerswerk vind je hier"
  const heroSub = place
    ? `Vrijwilligersmatch brengt inwoners en organisaties in ${place} bij elkaar via swipe-matching op motivatie en waarden.`
    : "Of je nu wilt helpen of vrijwilligers zoekt — Vrijwilligersmatch brengt de juiste mensen bij elkaar via swipe-matching op motivatie en waarden."

  const orgCta = place
    ? `/register?role=organisation&gemeente=${gemeente!.slug}`
    : "/register?role=organisation"
  const volCta = place ? `/register?gemeente=${gemeente!.slug}` : "/register"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heroTitle,
    url: `${BASE_URL}/vrijwilligerswerk`,
    description: heroSub,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — dual intent */}
      <section className="relative bg-gradient-to-b from-orange-50 to-white pt-16 pb-16 lg:pb-24" style={{ ["--brand" as string]: brand }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" /> {place ? `Lokaal in ${place}` : "Lokaal vrijwilligerswerk, slim gematcht"}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
              {heroTitle}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-2xl">{heroSub}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={volCta}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brand }}
              >
                <Heart className="w-5 h-5" /> Ik wil vrijwilliger worden
              </Link>
              <Link
                href={orgCta}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-800 hover:border-gray-400 transition-colors"
              >
                <Building2 className="w-5 h-5" /> Ik zoek vrijwilligers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two columns: volunteer vs organisation */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-orange-100 bg-orange-50/40 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: brand }}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Voor vrijwilligers</h2>
              </div>
              <ul className="space-y-5">
                {forVolunteers.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <f.icon className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: brand }} />
                    <div>
                      <p className="font-semibold text-gray-900">{f.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={volCta}
                className="mt-7 inline-flex items-center gap-1.5 font-semibold hover:gap-2.5 transition-all"
                style={{ color: brand }}
              >
                Begin met swipen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Voor organisaties</h2>
              </div>
              <ul className="space-y-5">
                {forOrganisations.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <f.icon className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{f.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={orgCta}
                className="mt-7 inline-flex items-center gap-1.5 text-gray-900 font-semibold hover:gap-2.5 transition-all"
              >
                Plaats je vacatures <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="py-14 lg:py-20 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Waarom traditionele vrijwilligersvacatures falen
          </h2>
          <p className="mt-3 text-gray-400 max-w-2xl">
            Een muur van tekst leest niemand. Vrijwilligersmatch draait om ontdekken, niet om solliciteren.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { stat: "44%", label: "van de vrijwilligers wereldwijd stopte sinds 2018 — blijvende aandacht voor retentie is onmisbaar" },
              { stat: "4,2x", label: "SROI-factor: elke euro aan ondersteuning levert ruim vier euro maatschappelijke waarde op" },
              { stat: "+52%", label: "hogere retentie bij een persoonlijke buddy — het bewijs dat matching op motivatie loont" },
            ].map((s) => (
              <div key={s.stat} className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                <p className="text-4xl font-bold text-orange-400">{s.stat}</p>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Bronnen: onderzoeken naar vrijwilligersretentie en SROI (zie ons{' '}
            <Link href="/blog" className="text-orange-400 hover:underline">blog</Link> en de{' '}
            <Link href="/kennisbank" className="text-orange-400 hover:underline">kennisbank</Link>).
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Zo werkt het voor beide kanten
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Profiel in 2 minuten", d: "Vrijwilliger swipet op motivatie, organisatie plaatst een vacature." },
              { n: "2", t: "Slimme match", d: "Het algoritme koppelt op waarden en vaardigheden, niet op toeval." },
              { n: "3", t: "Swipe naar yes", d: "Beide kanten bevestigen de match. Geen eindeloos e-mailcontact." },
              { n: "4", t: "Aan de slag", d: "Check-in via QR-code, impact zichtbaar in de Handprint." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-gray-100 p-6">
                <span className="inline-flex w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold items-center justify-center">
                  {s.n}
                </span>
                <p className="mt-4 font-semibold text-gray-900">{s.t}</p>
                <p className="mt-1 text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdieping — interne links naar blog & kennisbank (SEO sculpting) */}
      <section className="py-14 lg:py-20 bg-orange-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Verdiep je kennis
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Praktische handleidingen en onderbouwing voor wie vrijwilligers werft, behoudt of aanstuurt.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {deepen.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group block rounded-2xl bg-white border border-orange-100 p-6 hover:shadow-lg hover:border-orange-300 transition-all"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                  {d.kicker} · {d.tag}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {d.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600">{d.text}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600">
                  Lees meer <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-14 bg-orange-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="w-8 h-8 text-orange-400 mx-auto" />
          <p className="mt-4 text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed">
            “De traditionele vacaturebank is dood. De toekomst is een ecosysteem waarin vrijwilligers
            ontdekken in plaats van solliciteren.”
          </p>
          <p className="mt-4 text-sm text-gray-500">Vincent van Munster, architect Vrijwilligersmatch</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
            Veelgestelde vragen
          </h2>
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-gray-900 pr-4">{f.q}</span>
                  <span className="text-orange-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-white" style={{ backgroundColor: "#111827" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Klaar om te matchen?
          </h2>
          <p className="mt-3 text-gray-400">
            Of je nu wilt helpen of vrijwilligers zoekt — het begint met een swipe.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={volCta}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: brand }}
            >
              <Heart className="w-5 h-5" /> Word vrijwilliger
            </Link>
            <Link
              href={orgCta}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 px-6 py-3.5 text-base font-semibold text-white hover:border-gray-500 transition-colors"
            >
              <Building2 className="w-5 h-5" /> Zoek vrijwilligers
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
