export const dynamic = "force-dynamic"

import Link from "next/link"
import type { Metadata } from "next"
import {
  Heart, User, Building2, Landmark,
  CheckCircle, ArrowRight, ArrowLeft,
  TrendingUp, Zap, Clock, BarChart2,
  FileText, Calendar, Users, Rocket,
  Euro, Info, Shield, AlertCircle,
  Mail, Phone,
} from "lucide-react"
import { getCurrentGemeente } from "@/lib/gemeente"

export const metadata: Metadata = {
  title: "Samen Impact Maken — Vrijwilligersmatch",
  description: "Pilotvoorstel voor WIJ Heemstede en Gemeente Heemstede · April 2026",
  robots: { index: false, follow: false },
}

export default async function SamenPage() {
  const gemeente = await getCurrentGemeente()
  const brand     = gemeente?.primaryColor ?? "#f97316"
  const brandLight  = brand + "22"
  const brandXLight = brand + "12"
  const brandBorder = brand + "44"

  return (
    <div className="bg-white text-gray-900 antialiased overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brand }}>
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 truncate">
              Vrijwilligersmatch
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/pitch" className="hover:text-gray-900 transition-colors">← Terug naar pitch</Link>
            <a href="#investering" className="hover:text-gray-900 transition-colors">Investering</a>
            <a href="#planning" className="hover:text-gray-900 transition-colors">Planning</a>
            <a href="#partners" className="hover:text-gray-900 transition-colors">Partners</a>
            <a href="#ask" className="font-semibold transition-colors" style={{ color: brand }}>Wat vragen we</a>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: brand }}
          >
            Bekijk demo
          </Link>
        </nav>
      </header>

      <main className="pt-16">

        {/* ═══════════════════════════════════════════════════════
            1. HERO
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Breadcrumb */}
            <Link href="/pitch" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-10">
              <ArrowLeft className="w-3.5 h-3.5" />
              Terug naar de pitch
            </Link>

            {/* Partner badges */}
            <div className="flex flex-wrap gap-3 mb-12">
              {[
                { label: "WIJ Heemstede",        icon: <Users    className="w-3.5 h-3.5" /> },
                { label: "Gemeente Heemstede",    icon: <Landmark className="w-3.5 h-3.5" /> },
                { label: "Vrijwilligersmatch.nl", icon: <Heart    className="w-3.5 h-3.5 fill-current" /> },
              ].map((p) => (
                <div
                  key={p.label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
                  style={{ backgroundColor: brandXLight, borderColor: brandBorder, color: brand }}
                >
                  {p.icon}
                  {p.label}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>
                  Pilotvoorstel · April 2026
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.05] mb-6">
                  Samen impact<br />
                  <span style={{ color: brand }}>maken</span><br />
                  in Heemstede
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                  Vrijwilligersmatch.nl is klaar voor zijn eerste gemeente-pilot. Wij vragen WIJ Heemstede
                  en Gemeente Heemstede om samen de volgende stap te zetten — en van Heemstede
                  een voorbeeld te maken voor de rest van Nederland.
                </p>
              </div>

              {/* Quote */}
              <div className="p-8 rounded-3xl border" style={{ backgroundColor: brandXLight, borderColor: brandBorder }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: brand }}>
                  <span className="text-white text-lg font-serif leading-none">&ldquo;</span>
                </div>
                <blockquote className="text-gray-800 text-base leading-relaxed font-medium mb-4">
                  Één op de drie vrijwilligers stopt binnen drie maanden.
                  Niet omdat ze niet willen — maar omdat de match niet klopte.
                </blockquote>
                <p className="text-sm text-gray-500">
                  Vrijwilligersmatch.nl lost dat op — door te matchen op{" "}
                  <span className="font-semibold text-gray-700">motivatie</span>, niet op logistiek.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. WAT LEVERT HET OP — KPIs + GEMEENTE VOORDELEN
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Wat levert het op</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Concreet resultaat<br />voor Heemstede
              </h2>
            </div>

            {/* 4 KPI tiles */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-14">
              {[
                {
                  stat: "60%",
                  label: "Retentie-doelstelling",
                  sub: "pilot-target na 3 mnd · op basis van VFI-matchonderzoek",
                  icon: <TrendingUp className="w-5 h-5" style={{ color: brand }} />,
                },
                {
                  stat: "3×",
                  label: "Snellere matching",
                  sub: "van weken naar dagen",
                  icon: <Zap className="w-5 h-5" style={{ color: brand }} />,
                },
                {
                  stat: "−60%",
                  label: "Minder handwerk",
                  sub: "voor coördinatoren",
                  icon: <Clock className="w-5 h-5" style={{ color: brand }} />,
                },
                {
                  stat: "100%",
                  label: "Meetbare impact",
                  sub: "rapportage voor gemeente",
                  icon: <BarChart2 className="w-5 h-5" style={{ color: brand }} />,
                },
              ].map((item) => (
                <div key={item.label} className="p-7 bg-white border border-gray-100 rounded-3xl">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: brandLight }}>
                    {item.icon}
                  </div>
                  <p className="text-4xl font-bold tracking-tighter mb-1" style={{ color: brand }}>{item.stat}</p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Gemeente checkmarks */}
            <div className="p-8 bg-white border border-gray-100 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-violet-500 font-bold">Gemeente Heemstede</p>
                  <p className="text-sm font-semibold text-gray-900">Wat de gemeente concreet terugkrijgt</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Kwartaalrapportages",
                    desc: "Retentiecijfers en matchkwaliteit — concrete onderbouwing van subsidie-effectiviteit richting gemeenteraad.",
                  },
                  {
                    title: "SDG-koppeling per organisatie",
                    desc: "Aansluiting op landelijke rapportage-eisen en beleidsdoelen. Per vrijwilliger inzichtelijk gemaakt.",
                  },
                  {
                    title: "SROI-berekening vrijwillige inzet",
                    desc: "1 vrijwilligersuur = €14–22 maatschappelijke waarde. Onderbouwd en exporteerbaar voor subsidieaanvragen.",
                  },
                  {
                    title: "Eindevaluatie als beleidsdocument",
                    desc: "Klaar voor gebruik in toekomstige subsidieaanvragen. Geen extra werk voor de beleidsmedewerker.",
                  },
                  {
                    title: "Realtime dashboard voor WIJ Heemstede",
                    desc: "Minder e-mails, minder handmatig bijhouden, meer overzicht. Voor coördinator én beleidsmaker.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-violet-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. INVESTERING — VOLLEDIG TRANSPARANT
        ═══════════════════════════════════════════════════════ */}
        <section id="investering" className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Volledig transparant</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Wat het werkelijk<br />kost
              </h2>
            </div>

            {/* Totaaltabel */}
            <div className="bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden mb-6">
              <div className="px-7 py-5 border-b border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                  <Euro className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Pilotperiode april – december 2026</p>
                  <p className="text-sm font-semibold text-gray-900">Totale investering gemeente — cash én in-kind</p>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    post: "Co-financiering (cash)",
                    bedrag: "€5.000 – 10.000",
                    toelichting: "Eenmalig uit WMO- of innovatiebudget",
                    type: "cash",
                  },
                  {
                    post: "Coördinator WIJ Heemstede (~4 u/week × 36 weken)",
                    bedrag: "~€5.760 – 7.200",
                    toelichting: "In-kind · 144 uur à €40–50/uur all-in loonkosten",
                    type: "inkind",
                  },
                  {
                    post: "Beleidsmedewerker gemeente (~1,5 u/week)",
                    bedrag: "~€2.000 – 3.500",
                    toelichting: "In-kind · afstemming, rapportages, raadscommunicatie",
                    type: "inkind",
                  },
                  {
                    post: "AVG/verwerkersovereenkomst + DPIA-review",
                    bedrag: "~€1.000 – 2.000",
                    toelichting: "Juridische review persoonsgegevens vrijwilligers — wettelijk vereist",
                    type: "pm",
                  },
                  {
                    post: "Lanceringsevenement september + communicatie",
                    bedrag: "~€500 – 1.500",
                    toelichting: "Bijeenkomst, flyers, social — uitvoering deels bij WIJ Heemstede",
                    type: "pm",
                  },
                ].map((row) => (
                  <div key={row.post} className="flex items-start justify-between gap-6 px-7 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{row.post}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{row.toelichting}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: brand }}>{row.bedrag}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mt-0.5">
                        {row.type === "cash" ? "cash" : row.type === "inkind" ? "in-kind" : "pm"}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-7 py-5" style={{ backgroundColor: brandXLight }}>
                  <p className="text-sm font-bold text-gray-900">Totale pilotinvestering</p>
                  <p className="text-base font-bold" style={{ color: brand }}>~€14.000 – 24.000</p>
                </div>
              </div>
            </div>

            {/* Oranje Fonds + structureel */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="p-6 bg-white border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Oranje Fonds — context</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Het leeuwendeel van de pilotkosten wordt gefinancierd via een aanvraag bij het{" "}
                  <span className="font-semibold text-gray-900">Oranje Fonds</span>.
                  Co-financiering door de gemeente is een formele voorwaarde voor toewijzing.
                </p>
                <div className="space-y-2">
                  {[
                    "Fondsaanvraag ingediend zodra samenwerkingsverklaring is ondertekend",
                    "Bij afwijzing: pilot gaat niet van start — geen verdere verplichting voor gemeente",
                    "Verwachte beslissing: binnen 8–10 weken na indiening",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="w-1 h-1 rounded-full bg-blue-300 shrink-0 mt-1.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl border" style={{ backgroundColor: brandXLight, borderColor: brandBorder }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <FileText className="w-4 h-4 shrink-0" style={{ color: brand }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand }}>Structureel vanaf 2027 — volledig beeld</p>
                </div>
                <div className="space-y-3 mb-4">
                  {[
                    { post: "Platformlicentie", bedrag: "€6.000–7.800/jr" },
                    { post: "Coördinatorstijd (~2 u/week)", bedrag: "~€4.000/jr in-kind" },
                  ].map((row) => (
                    <div key={row.post} className="flex justify-between text-sm border-b pb-2" style={{ borderColor: brandBorder }}>
                      <span className="text-gray-700">{row.post}</span>
                      <span className="font-semibold" style={{ color: brand }}>{row.bedrag}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-1">
                    <span className="font-bold text-gray-900">Totaal jaarlijks</span>
                    <span className="font-bold" style={{ color: brand }}>~€10.000–12.000/jr</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ter vergelijking: één FTE vrijwilligersbegeleiding kost{" "}
                  <span className="font-semibold text-gray-700">€50.000–70.000 per jaar</span>.
                  Het platform verhoogt de effectiviteit van diezelfde coördinator voor 15–20% van die kosten.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. PLANNING + KPIs
        ═══════════════════════════════════════════════════════ */}
        <section id="planning" className="py-20 sm:py-28 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Pilot april – december 2026</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Hoe we het aanpakken
              </h2>
            </div>

            <div className="grid md:grid-cols-[1fr_1.1fr] gap-16">

              {/* Tijdlijn */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Planning</p>
                <div className="flex flex-col gap-0">
                  {[
                    {
                      period: "Apr – mei",
                      phase: "Voorbereiding",
                      items: ["Samenwerkingsverklaring ondertekend", "Fondsenaanvraag Oranje Fonds ingediend", "Platform ingericht op huisstijl Heemstede"],
                      icon: <Calendar className="w-3.5 h-3.5" />,
                      highlight: false,
                    },
                    {
                      period: "Jun – aug",
                      phase: "Inrichting & werving",
                      items: ["Training coördinatoren", "Werving 20+ vrijwilligers en 8+ organisaties", "Testmatches uitvoeren — feedback verwerken"],
                      icon: <Users className="w-3.5 h-3.5" />,
                      highlight: false,
                    },
                    {
                      period: "September",
                      phase: "Livegang",
                      items: ["Officieel lanceringsmoment in Heemstede", "Bijeenkomst met vrijwilligers, organisaties, gemeente en fondsen"],
                      icon: <Rocket className="w-3.5 h-3.5" />,
                      highlight: true,
                    },
                    {
                      period: "Okt – nov",
                      phase: "Pilotfase",
                      items: ["Actieve matching — wekelijkse monitoring", "Bijsturing op basis van retentie- en matchkwaliteitsdata"],
                      icon: <TrendingUp className="w-3.5 h-3.5" />,
                      highlight: false,
                    },
                    {
                      period: "December",
                      phase: "Evaluatie",
                      items: ["Eindrapportage KPIs + SDG-meting + euro-waarde", "Presentatie aan gemeente en fondsen", "Besluit over structurele licentie 2027"],
                      icon: <FileText className="w-3.5 h-3.5" />,
                      highlight: false,
                    },
                  ].map((step, i, arr) => (
                    <div key={step.phase} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                          style={
                            step.highlight
                              ? { backgroundColor: brand, borderColor: brand, color: "white" }
                              : { backgroundColor: brandLight, borderColor: brandBorder, color: brand }
                          }
                        >
                          {step.icon}
                        </div>
                        {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-2" />}
                      </div>
                      <div className={i < arr.length - 1 ? "pb-8" : ""}>
                        <div className="flex items-baseline gap-3 mb-2 mt-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{step.period}</span>
                          <span className="text-sm font-bold" style={step.highlight ? { color: brand } : {}}>
                            {step.phase}{step.highlight ? " 🚀" : ""}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {step.items.map((item) => (
                            <li key={item} className="text-xs text-gray-500 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0 mt-1.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Hoe meten we succes — 7 KPI&apos;s</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { nr: "01", kpi: "Retentie na 3 mnd (doelstelling)", doel: "≥60%",     meting: "Platform-data" },
                    { nr: "02", kpi: "Actieve matches eind september",    doel: "20+",      meting: "Dashboard" },
                    { nr: "03", kpi: "Deelnemende organisaties",          doel: "8+",       meting: "Accounts" },
                    { nr: "04", kpi: "Tijd per match coördinator",        doel: "<15 min",  meting: "Tijdregistratie" },
                    { nr: "05", kpi: "Tevredenheid vrijwilligers (NPS)",  doel: "Score ≥7", meting: "In-app na 6 wkn" },
                    { nr: "06", kpi: "Maatschappelijke euro-waarde",      doel: "Berekend", meting: "SROI-methode" },
                    { nr: "07", kpi: "SDG-dekking deelnemers",            doel: "≥3 SDG's", meting: "Impact module" },
                  ].map((item) => (
                    <div key={item.nr} className="p-4 bg-white border border-gray-100 rounded-2xl">
                      <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-2">{item.nr}</p>
                      <p className="text-xs font-semibold text-gray-900 mb-1 leading-snug">{item.kpi}</p>
                      <p className="text-lg font-bold mb-1" style={{ color: brand }}>{item.doel}</p>
                      <p className="text-[10px] text-gray-400">{item.meting}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. TWEE PARTNERS, ÉÉN DOEL
        ═══════════════════════════════════════════════════════ */}
        <section id="partners" className="py-20 sm:py-28 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: brand }}>Twee partners, één doel</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Wat wint iedereen<br />concreet?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* WIJ Heemstede */}
              <div className="p-7 bg-white border border-gray-100 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">WIJ Heemstede</p>
                    <p className="text-sm font-semibold text-gray-900">Vrijwilligerscentrale & coördinatoren</p>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Wat we vragen</p>
                <div className="space-y-2 mb-6">
                  {[
                    "Coördinator beschikbaar voor ~4 uur/week (apr–dec)",
                    "Deelname als operationele pilotpartner",
                    "Meehelpen bij werving organisaties en vrijwilligers",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-gray-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Wat WIJ wint</p>
                <div className="space-y-2">
                  {[
                    "Minder handmatige matching — meer tijd voor de relatie",
                    "Betere matches → minder uitval → minder herplaatsingen",
                    "Realtime dashboard: altijd overzicht, geen e-mailchaos",
                    "AI-assistent schrijft vacatureteksten en signaleert risico op afhaken",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemeente Heemstede */}
              <div className="p-7 bg-white border border-gray-100 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-violet-500 font-bold">Gemeente Heemstede</p>
                    <p className="text-sm font-semibold text-gray-900">Beleidsmedewerker & wethouder</p>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Wat we vragen</p>
                <div className="space-y-2 mb-6">
                  {[
                    "Samenwerkingsverklaring op gemeentebriefhoofd (nodig voor fonds)",
                    "Co-financiering €5.000–10.000 uit WMO- of innovatiebudget",
                    "Beleidsmedewerker ~1,5 uur/week voor afstemming",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-gray-300" />
                      {item}
                    </div>
                  ))}
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Wat de gemeente wint</p>
                <div className="space-y-2">
                  {[
                    "Kwartaalrapportages met retentiecijfers voor de gemeenteraad",
                    "SDG-koppeling per organisatie — aansluiting op landelijk beleid",
                    "SROI-berekening: onderbouwing subsidie-effectiviteit",
                    "Eindrapport bruikbaar als beleidsdocument voor subsidieaanvragen",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AVG/DPIA banner */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-start gap-4">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">AVG & privacy — geregeld vóór livegang</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Vrijwilligersmatch verwerkt persoonsgegevens van vrijwilligers. Vóór livegang sluiten we een{" "}
                  <span className="font-semibold text-gray-700">verwerkersovereenkomst</span> af en voeren we gezamenlijk
                  een <span className="font-semibold text-gray-700">DPIA</span> uit.
                  De gemeente hoeft hier geen extra capaciteit voor vrij te maken — wij leveren het concept, jullie accorderen.
                  Kosten zijn opgenomen in de pilotbegroting.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            6. WAT VRAGEN WE VANDAAG — AFSLUITENDE CTA
        ═══════════════════════════════════════════════════════ */}
        <section id="ask" className="py-20 sm:py-28" style={{ backgroundColor: brand }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="grid md:grid-cols-[1.4fr_1fr] gap-16 items-start">

              {/* 4 asks */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Wat vragen we vandaag</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-10">
                  Vier stappen naar<br />de pilot
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      nr: "1",
                      who: "WIJ Heemstede",
                      title: "Bevestigt deelname als operationele pilotpartner",
                      desc: "Coördinator beschikbaar voor ~4 uur/week. Geen extra aanstelling nodig.",
                    },
                    {
                      nr: "2",
                      who: "Gemeente Heemstede",
                      title: "Geeft akkoord op samenwerkingsverklaring",
                      desc: "Ondertekende intentiebrief op gemeentebriefhoofd — noodzakelijk voor de fondsenaanvraag bij het Oranje Fonds.",
                    },
                    {
                      nr: "3",
                      who: "Gemeente Heemstede",
                      title: "Bespreekt co-financiering intern",
                      desc: "€5.000–10.000 eenmalig uit WMO- of innovatiebudget. Bij afwijzing Oranje Fonds: geen verdere verplichting.",
                    },
                    {
                      nr: "4",
                      who: "Beide partners",
                      title: "Plannen een vervolgafspraak vóór 1 juni 2026",
                      desc: "Ondertekening samenwerkingsverklaring — zodat de fondsaanvraag op tijd in en we in september live kunnen.",
                    },
                  ].map((ask) => (
                    <div key={ask.nr} className="flex gap-5 items-start">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{ask.nr}</span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">{ask.who}</p>
                        <p className="text-sm font-semibold text-white mb-1">{ask.title}</p>
                        <p className="text-sm text-white/70 leading-relaxed">{ask.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact + risico + demo */}
              <div className="md:pt-14 space-y-5">

                <div className="p-7 bg-white/10 border border-white/20 rounded-3xl">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Contact</p>
                  <p className="text-lg font-bold text-white mb-0.5">Vincent van Münster</p>
                  <p className="text-sm text-white/70 mb-5">Oprichter Vrijwilligersmatch.nl & WeAreImpact</p>
                  <div className="space-y-3">
                    <a href="mailto:v.munster@weareimpact.nl" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                      <Mail className="w-4 h-4 shrink-0 text-white/50" />
                      v.munster@weareimpact.nl
                    </a>
                    <a href="tel:0614470977" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                      <Phone className="w-4 h-4 shrink-0 text-white/50" />
                      06-14470977
                    </a>
                    <a href="https://vrijwilligersmatch.nl" className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors">
                      <Heart className="w-4 h-4 shrink-0 text-white/50" />
                      vrijwilligersmatch.nl
                    </a>
                  </div>
                </div>

                {/* Risico-noot */}
                <div className="p-5 bg-white/10 border border-white/15 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-white/50" />
                    <div>
                      <p className="text-xs font-semibold text-white/80 mb-1">Wat als het Oranje Fonds nee zegt?</p>
                      <p className="text-xs text-white/55 leading-relaxed">
                        De samenwerkingsverklaring legt geen financiële verplichting vast.
                        Bij afwijzing gaat de pilot niet van start — en is er geen verdere
                        verplichting voor WIJ of de gemeente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demo */}
                <Link
                  href="/login"
                  className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-2xl group hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nog niet gezien?</p>
                    <p className="text-sm font-semibold" style={{ color: brand }}>Bekijk de live demo</p>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: brand }} />
                </Link>

              </div>

            </div>
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
