/**
 * /organisaties/[slug] — Publiek organisatieprofiel met handprint showcase
 *
 * Publiek toegankelijk. Dient als social proof voor fondsenwerving en vrijwilligerswerving.
 * Bevat OG-tags voor mooie deling op LinkedIn / WhatsApp.
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Heart, MapPin, Globe, Mail, Clock, Share2, ArrowRight,
  Users, TrendingUp, Sprout,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { recalculateOrgHandprint } from "@/lib/handprint/recalculate"
import { HandprintCard } from "@/components/handprint/HandprintCard"
import { getSdgsByNumbers, getCategorySdgs, IMPACT_CONSTANTS } from "@/config/sdg"

export const dynamic = "force-dynamic"

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getOrgData(slug: string) {
  const org = await prisma.organisation.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      categories:     { include: { category: true } },
      handprint:      true,
      vacancies: {
        where: { status: "ACTIVE" },
        include: {
          categories: { include: { category: { select: { name: true } } } },
          skills:     { include: { skill: { select: { name: true } } } },
          _count:     { select: { matches: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  })
  return org
}

async function getOrComputeHandprint(org: NonNullable<Awaited<ReturnType<typeof getOrgData>>>) {
  if (org.handprint) return org.handprint
  try {
    return await recalculateOrgHandprint(org.id)
  } catch {
    return null
  }
}

// ── Metadata (OG tags) ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const org = await prisma.organisation.findUnique({
    where: { slug, status: "APPROVED" },
    include: { handprint: true },
  })

  if (!org) return { title: "Organisatie niet gevonden" }

  const waarde = org.handprint?.maatschappelijkeWaarde ?? 0
  const retentie = Math.round(org.handprint?.retentieScore ?? 0)

  const description = waarde > 0
    ? `${org.name} creëerde dit jaar €${waarde.toLocaleString("nl-NL")} maatschappelijke waarde via vrijwilligerswerk. Retentiescore: ${retentie}%.`
    : `${org.description ?? `${org.name} is actief op Vrijwilligersmatch.nl`}`

  return {
    title: `${org.name} — Impact op Vrijwilligersmatch`,
    description,
    openGraph: {
      title: `${org.name} maakt impact`,
      description: waarde > 0
        ? `€${waarde.toLocaleString("nl-NL")} maatschappelijke waarde dit jaar · Retentie ${retentie}%`
        : description,
      type: "website",
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatEur(n: number) {
  if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000) return `€ ${Math.round(n / 1_000).toLocaleString("nl")}.000`
  return `€ ${n.toLocaleString("nl-NL")}`
}

// Vergelijkingscontext: hoeveel voltijds zorgmedewerkers zou hetzelfde kosten?
function zorgEquivalent(waarde: number) {
  // Maandkosten één zorgmedewerker: 1,2 × 40h × 4w × €15,38 ≈ €2.953
  const maandkosten = 1.2 * 40 * 4 * IMPACT_CONSTANTS.HOURLY_VALUE_EUR
  return Math.round(waarde / maandkosten)
}

// ── Vacancy card ──────────────────────────────────────────────────────────────

function VacancyCard({
  vacancy,
  sdgNums,
  estimatedValue,
}: {
  vacancy: {
    id: string
    title: string
    description: string
    city: string | null
    hours: number | null
    duration: string | null
    categories: { category: { name: string } }[]
  }
  sdgNums: number[]
  estimatedValue: number
}) {
  const sdgDefs = getSdgsByNumbers(sdgNums.slice(0, 3))
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 mb-1">{vacancy.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{vacancy.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {vacancy.categories.slice(0, 2).map((c) => (
          <span key={c.category.name} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
            {c.category.name}
          </span>
        ))}
        {sdgDefs.map((sdg) => (
          <span
            key={sdg.number}
            className="text-xs text-white px-2 py-0.5 rounded-full"
            style={{ background: sdg.color }}
          >
            SDG {sdg.number}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {vacancy.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {vacancy.city}
            </span>
          )}
          {vacancy.hours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {vacancy.hours}u/week
            </span>
          )}
        </div>
        {estimatedValue > 0 && (
          <span className="text-green-600 font-medium">
            ~{formatEur(estimatedValue)}/jaar
          </span>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrgProfielPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const org = await getOrgData(slug)
  if (!org) notFound()

  const handprint = await getOrComputeHandprint(org)

  const catNames   = org.categories.map((c) => c.category.name)
  const waarde     = handprint?.maatschappelijkeWaarde ?? 0
  const totalMatches = handprint
    ? handprint.aantalActieveMatches + handprint.aantalAfgerondMatches
    : 0
  const equiv      = waarde > 0 ? zorgEquivalent(waarde) : 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
              {org.logo
                ? <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-gray-400">{org.name.charAt(0)}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
                {catNames.slice(0, 2).map((c) => (
                  <span key={c} className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>

              {org.description && (
                <p className="text-gray-600 leading-relaxed mb-4 max-w-2xl">{org.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {(org.city ?? org.address) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {org.city ?? org.address}
                  </span>
                )}
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-violet-600 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-1.5 hover:text-violet-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {org.email}
                  </a>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="flex gap-2 md:mt-0">
              <Link
                href={`/register`}
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <Heart className="w-4 h-4" />
                Word vrijwilliger
              </Link>
            </div>
          </div>

          {/* Impact statement */}
          {waarde > 0 && (
            <div className="mt-8 p-5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl">
              <p className="text-lg font-semibold text-gray-900">
                Dit jaar al{" "}
                <span className="text-violet-700">{formatEur(waarde)}</span>{" "}
                aan maatschappelijke waarde gecreëerd
              </p>
              {equiv > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Dat staat gelijk aan{" "}
                  <strong>{equiv} voltijds zorgmedewerker{equiv !== 1 ? "s" : ""}</strong>{" "}
                  voor een maand
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* ── Handprint visualisatie ────────────────────────────────────────── */}
        {handprint && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Onze impact handprint</h2>
                <p className="text-sm text-gray-500">Maatschappelijke bijdrage in cijfers</p>
              </div>
            </div>
            <HandprintCard handprint={handprint} accent="#7c3aed" />
          </section>
        )}

        {/* ── Social proof ─────────────────────────────────────────────────── */}
        {totalMatches > 0 && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-violet-600 tabular-nums">{totalMatches}</p>
                <p className="text-sm text-gray-500 mt-1">
                  vrijwilliger{totalMatches !== 1 ? "s" : ""} ging{totalMatches !== 1 ? "en" : ""} je voor
                </p>
              </div>
              {handprint && (
                <>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-3xl font-bold text-green-600 tabular-nums">
                      {Math.round(handprint.retentieScore)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">blijft langer dan 6 maanden</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-3xl font-bold text-gray-900 tabular-nums">
                      {handprint.totaalUrenJaarlijks.toLocaleString("nl")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">vrijwilligersuren bijgedragen</p>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── Openstaande vacatures ─────────────────────────────────────────── */}
        {org.vacancies.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Openstaande vacatures</h2>
                <p className="text-sm text-gray-500">Doe mee en maak impact</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {org.vacancies.map((v) => {
                const vCatNames = v.categories.map((c) => c.category.name)
                const sdgNums = getCategorySdgs(vCatNames)
                const yearlyHours = (v.hours ?? 2) * 52
                const estimatedValue = Math.round(yearlyHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR)
                return (
                  <VacancyCard
                    key={v.id}
                    vacancy={v}
                    sdgNums={sdgNums}
                    estimatedValue={estimatedValue}
                  />
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/swipe"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Alle vacatures bekijken
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Deel ─────────────────────────────────────────────────────────── */}
        <section>
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-white text-center">
            <Share2 className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <h2 className="text-xl font-bold mb-2">Deel dit profiel</h2>
            <p className="text-white/80 text-sm mb-5 max-w-sm mx-auto">
              Help {org.name} meer vrijwilligers te bereiken door dit profiel te delen.
            </p>
            <p className="text-xs text-white/60 font-mono bg-white/10 px-4 py-2 rounded-lg inline-block">
              {process.env.NEXT_PUBLIC_APP_URL ?? "https://vrijwilligersmatch.nl"}/organisaties/{org.slug}
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
