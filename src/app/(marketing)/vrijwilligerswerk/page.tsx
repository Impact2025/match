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

const BASE_URL = "https://vrijwilligersmatch.nl"

export const metadata: Metadata = {
  title: "Vrijwilligerswerk vind je hier — voor vrijwilligers én organisaties",
  description:
    "Vrijwilligersmatch verbindt vrijwilligers en organisaties via swipe-matching op motivatie en waarden. Voor wie wil helpen én voor wie vrijwilligers zoekt: ontdek, match en behoud.",
  alternates: { canonical: `${BASE_URL}/vrijwilligerswerk` },
  openGraph: {
    title: "Vrijwilligerswerk vind je hier — voor vrijwilligers én organisaties",
    description:
      "Swipe-matching op motivatie en waarden. Voor vrijwilligers die willen helpen en organisaties die vrijwilligers zoeken.",
    url: `${BASE_URL}/vrijwilligerswerk`,
    type: "website",
  },
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

export default function VrijwilligerswerkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vrijwilligerswerk — voor vrijwilligers en organisaties",
    url: `${BASE_URL}/vrijwilligerswerk`,
    description:
      "Vrijwilligersmatch verbindt vrijwilligers en organisaties via swipe-matching op motivatie en waarden.",
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
      <section className="relative bg-gradient-to-b from-orange-50 to-white pt-16 pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Lokaal vrijwilligerswerk, slim gematcht
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]">
              Vrijwilligerswerk vind je hier
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-2xl">
              Of je nu wilt <span className="font-semibold text-gray-900">helpen</span> of{' '}
              <span className="font-semibold text-gray-900">vrijwilligers zoekt</span> —
              Vrijwilligersmatch brengt de juiste mensen bij elkaar via swipe-matching op motivatie en waarden.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                <Heart className="w-5 h-5" /> Ik wil vrijwilliger worden
              </Link>
              <Link
                href="/register?role=organisation"
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
            {/* For volunteers */}
            <div className="rounded-3xl border border-orange-100 bg-orange-50/40 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Voor vrijwilligers</h2>
              </div>
              <ul className="space-y-5">
                {forVolunteers.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <f.icon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{f.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-1.5 text-orange-600 font-semibold hover:gap-2.5 transition-all"
              >
                Begin met swipen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* For organisations */}
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
                href="/register?role=organisation"
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
              { stat: "44%", label: "van de vrijwilligers wereldwijd stopte sinds 2018 — blevende aandacht voor retentie is onmisbaar" },
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
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Klaar om te matchen?
          </h2>
          <p className="mt-3 text-gray-400">
            Of je nu wilt helpen of vrijwilligers zoekt — het begint met een swipe.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Heart className="w-5 h-5" /> Word vrijwilliger
            </Link>
            <Link
              href="/register?role=organisation"
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
