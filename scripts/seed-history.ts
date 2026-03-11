/**
 * scripts/seed-history.ts
 *
 * Voegt 12 maanden historische demo-data toe voor WijHeemstede.
 * Maakt realistische aantallen vrijwilligers, matches, gesprekken en
 * check-ins aan verspreid over de afgelopen 12 maanden.
 *
 * Verwacht dat seed-heemstede.ts al gedraaid heeft (organisaties + vacatures aanwezig).
 *
 * Usage:
 *   pnpm tsx scripts/seed-history.ts
 *
 * Veilig om meerdere keren uit te voeren — alle records krijgen vaste IDs.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ── Helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date("2026-03-11T12:00:00Z")

/** Datum X maanden en Y dagen terug */
function daysAgo(days: number, plusHours = 0): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000 + plusHours * 60 * 60 * 1000)
}

function monthsAgo(months: number, dayOffset = 0): Date {
  return daysAgo(months * 30 + dayOffset)
}

async function hp(pw: string) {
  return bcrypt.hash(pw, 10)
}

// ── Demo vrijwilligers ────────────────────────────────────────────────────────

const VOLUNTEERS = [
  { id: "vol-anna",    name: "Anna van der Berg",   email: "anna@heemstede-demo.nl",    bio: "Gepensioneerde lerares, houd van mensen helpen.",        availability: ["tuesday","thursday","weekend"] },
  { id: "vol-jan",     name: "Jan Bakker",           email: "jan@heemstede-demo.nl",     bio: "Ik ben actief en wil iets terugdoen voor de buurt.",     availability: ["monday","wednesday","friday"] },
  { id: "vol-maria",   name: "Maria Jansen",         email: "maria@heemstede-demo.nl",   bio: "Zorg zit in mijn bloed. Altijd bereid te helpen.",       availability: ["wednesday","saturday","morning"] },
  { id: "vol-peter",   name: "Peter de Groot",       email: "peter@heemstede-demo.nl",   bio: "Rijbewijs B, auto beschikbaar, graag vervoerstaak.",     availability: ["monday","tuesday","afternoon"] },
  { id: "vol-lisa",    name: "Lisa Smit",            email: "lisa@heemstede-demo.nl",    bio: "Student pedagogiek, affiniteit met kinderen en ouderen.", availability: ["tuesday","thursday","weekend"] },
  { id: "vol-kees",    name: "Kees Mulder",          email: "kees@heemstede-demo.nl",    bio: "Gepensioneerd accountant, financieel advies geven.",     availability: ["monday","wednesday","morning"] },
  { id: "vol-fiona",   name: "Fiona Visser",         email: "fiona@heemstede-demo.nl",   bio: "Ik wandel graag en ontmoet mensen in de buurt.",         availability: ["thursday","friday","morning"] },
  { id: "vol-tom",     name: "Tom Hendriks",         email: "tom@heemstede-demo.nl",     bio: "ICT-er, kan ook prima administratieve taken doen.",      availability: ["evening","weekend"] },
  { id: "vol-noor",    name: "Noor van Dam",         email: "noor@heemstede-demo.nl",    bio: "Maatschappelijk werker, veel ervaring met kwetsbare groepen.", availability: ["monday","tuesday","wednesday"] },
  { id: "vol-erik",    name: "Erik Bosman",          email: "erik@heemstede-demo.nl",    bio: "Tuinman van beroep, ook bereid andere klussen te doen.", availability: ["saturday","sunday"] },
  { id: "vol-hanna",   name: "Hanna Willems",        email: "hanna@heemstede-demo.nl",   bio: "Creatief en sociaal, hou van activiteiten begeleiden.",  availability: ["tuesday","friday","afternoon"] },
  { id: "vol-rob",     name: "Rob van Leeuwen",      email: "rob@heemstede-demo.nl",     bio: "Oud-bankmedewerker, veel kennis van financiën.",         availability: ["wednesday","thursday","morning"] },
  { id: "vol-sanne",   name: "Sanne de Vries",       email: "sanne@heemstede-demo.nl",   bio: "Verpleegkundige in deeltijd, kan goed luisteren.",       availability: ["monday","weekend"] },
  { id: "vol-bas",     name: "Bas Koopmans",         email: "bas@heemstede-demo.nl",     bio: "Sportief en actief, begeleid graag wandelingen.",        availability: ["tuesday","thursday","weekend"] },
  { id: "vol-inge",    name: "Inge Brouwer",         email: "inge@heemstede-demo.nl",    bio: "Lerares basisschool, geduldig en vriendelijk.",           availability: ["wednesday","saturday","morning"] },
  { id: "vol-daan",    name: "Daan van Oss",         email: "daan@heemstede-demo.nl",    bio: "Woon nieuw in Heemstede, wil de buurt leren kennen.",    availability: ["friday","weekend","evening"] },
  { id: "vol-mirjam",  name: "Mirjam Schouten",      email: "mirjam@heemstede-demo.nl",  bio: "Zelfstandig ondernemer, zet me graag in voor de buurt.", availability: ["monday","wednesday","afternoon"] },
  { id: "vol-gerard",  name: "Gerard van Houten",    email: "gerard@heemstede-demo.nl",  bio: "Gepensioneerde arts, kan mensen goed bijstaan.",         availability: ["tuesday","thursday","morning"] },
]

// ── Vacature IDs uit seed-heemstede.ts ───────────────────────────────────────

const VAC_IDS = [
  "vac-gastheer-heemstede-demo",
  "vac-telefonisch-heemstede-demo",
  "vac-fiets-locatie-heemstede-demo",
  "vac-wandelteam-heemstede-demo",
  "vac-secretaris-heemstede-demo",
  "vac-welzijn-activiteiten-heemstede-demo",
  "vac-welzijn-transport-heemstede-demo",
  "vac-welzijn-leesmaatje-heemstede-demo",
  "vac-welzijn-tuinteam-heemstede-demo",
  "vac-welzijn-admin-heemstede-demo",
]

// ── Org admin IDs voor gesprekken ─────────────────────────────────────────────

const ORG_ADMINS: Record<string, string> = {
  "vac-gastheer-heemstede-demo":              "org-wij-eten-heemstede-demo-admin",
  "vac-telefonisch-heemstede-demo":           "org-wij-eten-heemstede-demo-admin",
  "vac-fiets-locatie-heemstede-demo":         "org-fietsmaatjes-heemstede-demo-admin",
  "vac-wandelteam-heemstede-demo":            "org-wij-heemstede-heemstede-demo-admin",
  "vac-secretaris-heemstede-demo":            "org-schuldhulp-heemstede-demo-admin",
  "vac-welzijn-activiteiten-heemstede-demo":  "org-welzijn-heemstede-demo-admin",
  "vac-welzijn-transport-heemstede-demo":     "org-welzijn-heemstede-demo-admin",
  "vac-welzijn-leesmaatje-heemstede-demo":    "org-welzijn-heemstede-demo-admin",
  "vac-welzijn-tuinteam-heemstede-demo":      "org-welzijn-heemstede-demo-admin",
  "vac-welzijn-admin-heemstede-demo":         "org-welzijn-heemstede-demo-admin",
}

// ── Korte gespreksscripts per vacature ────────────────────────────────────────

const CONV_SCRIPTS: Record<string, { org: string; vol: string }[]> = {
  "vac-gastheer-heemstede-demo": [
    { org: "Hallo! Fijn dat je interesse hebt getoond als gastheer/gastvrouw bij WIJ Eten Samen. Ik ben de coördinator. Heb je nog vragen?", vol: "Hoi! Ik vind het geweldig initiatief. Maandagavonden passen me prima. Is er een inwerkperiode?" },
    { org: "Zeker! We laten je eerst twee keer meedraaien met een ervaren vrijwilliger. Kun je volgende maandag om 17:00 langskomen?", vol: "Ja, dat kan ik. Welk adres?" },
    { org: "Raadhuisstraat 22, Heemstede. Fijn dat je er snel bij kunt zijn. Tot maandag!", vol: "Tot dan!" },
  ],
  "vac-wandelteam-heemstede-demo": [
    { org: "Dag! Welkom bij het wandelteam van WIJ Heemstede. Op welke ochtend wil je meedoen?", vol: "Donderdag werkt goed voor mij. Hoe laat beginnen jullie?" },
    { org: "We starten om 10:00 bij de Blekersvaartweg. Ongeveer 5-6 km, altijd terug voor de lunch.", vol: "Perfect, ik kom aanstaande donderdag!" },
  ],
  "vac-welzijn-activiteiten-heemstede-demo": [
    { org: "Hoi! Bedankt voor je aanmelding als activiteitenbegeleider. Wanneer kun je beginnen?", vol: "Ik ben flexibel, dinsdag- of woensdagochtend past me goed.", org: "Super! We plannen een introductiegesprek op woensdag 18 maart om 10:00. Gaat dat?" },
  ],
  "vac-welzijn-transport-heemstede-demo": [
    { org: "Bedankt voor je interesse in de transportrol. Heb je een eigen auto?", vol: "Ja, ik heb een Volkswagen Polo. Ik kan doordeweeks overdag rijden.", org: "Geweldig! We sturen je een overzicht van ritten deze week." },
  ],
  "vac-welzijn-leesmaatje-heemstede-demo": [
    { org: "Fijn dat je leesmaatje wilt worden! Er is iemand in jouw buurt die graag geholpen wil worden.", vol: "Dat is geweldig. Wanneer kan ik starten na de training?", org: "De eerstvolgende training is op 20 maart, 19:00-21:00 uur in ons kantoor." },
  ],
}

// Fallback gesprek voor vacatures zonder specifiek script
function defaultScript(vacId: string): { org: string; vol: string }[] {
  return [
    { org: "Hallo! Bedankt voor je aanmelding. Kunnen we een kennismakingsgesprek inplannen?", vol: "Ja, zeker! Ik ben beschikbaar doordeweeks overdag en in het weekend." },
    { org: "Super. Ik stuur je een uitnodiging. Heb je nog vragen over de rol?", vol: "Nee, de vacature was duidelijk. Ik kijk er naar uit!" },
  ]
}

// ── Match-planning over 12 maanden ────────────────────────────────────────────
// Elke entry: { volIdx, vacIdx, status, createdDaysAgo, startedDaysAgo?, checkIn1?, checkIn4?, checkIn12? }

interface MatchPlan {
  id: string
  volId: string
  vacId: string
  status: "ACCEPTED" | "COMPLETED" | "PENDING" | "REJECTED"
  createdAt: Date
  startedAt?: Date
  checkIn1SentAt?: Date
  checkIn4SentAt?: Date
  checkIn12SentAt?: Date
}

function plan(
  idx: number,
  volId: string,
  vacId: string,
  status: MatchPlan["status"],
  createdDays: number,
  startedDays?: number,
  ci1Days?: number,
  ci4Days?: number,
  ci12Days?: number,
): MatchPlan {
  return {
    id: `match-hist-${idx}`,
    volId,
    vacId,
    status,
    createdAt:      daysAgo(createdDays),
    startedAt:      startedDays !== undefined ? daysAgo(startedDays) : undefined,
    checkIn1SentAt: ci1Days    !== undefined ? daysAgo(ci1Days)    : undefined,
    checkIn4SentAt: ci4Days    !== undefined ? daysAgo(ci4Days)    : undefined,
    checkIn12SentAt: ci12Days  !== undefined ? daysAgo(ci12Days)   : undefined,
  }
}

const V = VOLUNTEERS
const PLANS: MatchPlan[] = [
  // ── 12 maanden geleden (mrt 2025) ──────────────────────────────────────
  plan(1,  V[0].id,  VAC_IDS[3], "COMPLETED", 360, 355, 348, 327, 271), // Anna - wandelteam ✓
  plan(2,  V[1].id,  VAC_IDS[0], "COMPLETED", 355, 350, 343, 322, 266), // Jan - gastheer ✓
  plan(3,  V[2].id,  VAC_IDS[5], "COMPLETED", 350, 345, 338, 317, 261), // Maria - activiteiten ✓

  // ── 10 maanden geleden (mei 2025) ──────────────────────────────────────
  plan(4,  V[3].id,  VAC_IDS[6], "COMPLETED", 305, 300, 293, 272, 216), // Peter - transport ✓
  plan(5,  V[4].id,  VAC_IDS[7], "COMPLETED", 298, 293, 286, 265, 209), // Lisa - leesmaatje ✓
  plan(6,  V[5].id,  VAC_IDS[4], "COMPLETED", 290, 285, 278, 257, 201), // Kees - secretaris ✓
  plan(7,  V[6].id,  VAC_IDS[3], "COMPLETED", 285, 280, 273, 252, 196), // Fiona - wandelteam ✓

  // ── 8 maanden geleden (jul 2025) ───────────────────────────────────────
  plan(8,  V[7].id,  VAC_IDS[9], "COMPLETED", 245, 240, 233, 212, 156), // Tom - admin ✓
  plan(9,  V[8].id,  VAC_IDS[5], "COMPLETED", 238, 233, 226, 205, 149), // Noor - activiteiten ✓
  plan(10, V[9].id,  VAC_IDS[8], "COMPLETED", 230, 225, 218, 197, 141), // Erik - tuinteam ✓
  plan(11, V[10].id, VAC_IDS[0], "COMPLETED", 225, 220, 213, 192, 136), // Hanna - gastheer ✓

  // ── 6 maanden geleden (sep 2025) ───────────────────────────────────────
  plan(12, V[11].id, VAC_IDS[4], "ACCEPTED",  185, 180, 173, 152),      // Rob - secretaris (nog actief)
  plan(13, V[12].id, VAC_IDS[6], "ACCEPTED",  178, 173, 166, 145),      // Sanne - transport (nog actief)
  plan(14, V[13].id, VAC_IDS[3], "ACCEPTED",  170, 165, 158, 137),      // Bas - wandelteam (nog actief)
  plan(15, V[14].id, VAC_IDS[7], "ACCEPTED",  165, 160, 153, 132),      // Inge - leesmaatje (nog actief)
  plan(16, V[0].id,  VAC_IDS[2], "ACCEPTED",  160, 155, 148, 127),      // Anna - fiets (nog actief)

  // ── 4 maanden geleden (nov 2025) ───────────────────────────────────────
  plan(17, V[1].id,  VAC_IDS[5], "ACCEPTED",  125, 120, 113, 92),       // Jan - activiteiten
  plan(18, V[15].id, VAC_IDS[0], "ACCEPTED",  118, 113, 106, 85),       // Daan - gastheer
  plan(19, V[16].id, VAC_IDS[9], "ACCEPTED",  112, 107, 100, 79),       // Mirjam - admin
  plan(20, V[3].id,  VAC_IDS[3], "ACCEPTED",  105, 100, 93,  72),       // Peter - wandelteam
  plan(21, V[6].id,  VAC_IDS[8], "ACCEPTED",  100, 95,  88,  67),       // Fiona - tuinteam

  // ── 2 maanden geleden (jan 2026) ───────────────────────────────────────
  plan(22, V[17].id, VAC_IDS[1], "ACCEPTED",  65, 60, 53, 32),          // Gerard - telefonisch
  plan(23, V[4].id,  VAC_IDS[5], "ACCEPTED",  58, 53, 46, 25),          // Lisa - activiteiten
  plan(24, V[8].id,  VAC_IDS[4], "ACCEPTED",  52, 47, 40, 19),          // Noor - secretaris
  plan(25, V[2].id,  VAC_IDS[6], "ACCEPTED",  45, 40, 33, 12),          // Maria - transport
  plan(26, V[10].id, VAC_IDS[3], "ACCEPTED",  42, 37, 30, 9),           // Hanna - wandelteam

  // ── Afgelopen maand (feb 2026) ─────────────────────────────────────────
  plan(27, V[11].id, VAC_IDS[7], "ACCEPTED",  28, 23, 16),              // Rob - leesmaatje
  plan(28, V[5].id,  VAC_IDS[0], "ACCEPTED",  25, 20, 13),              // Kees - gastheer
  plan(29, V[14].id, VAC_IDS[5], "ACCEPTED",  22, 17, 10),              // Inge - activiteiten
  plan(30, V[12].id, VAC_IDS[8], "ACCEPTED",  18, 13, 6),               // Sanne - tuinteam
  plan(31, V[7].id,  VAC_IDS[3], "ACCEPTED",  15, 10, 3),               // Tom - wandelteam

  // ── Recent (mrt 2026) — pending en nieuw ──────────────────────────────
  plan(32, V[9].id,  VAC_IDS[1], "PENDING",   10),                      // Erik - telefonisch
  plan(33, V[13].id, VAC_IDS[9], "PENDING",   8),                       // Bas - admin
  plan(34, V[15].id, VAC_IDS[5], "PENDING",   6),                       // Daan - activiteiten
  plan(35, V[16].id, VAC_IDS[2], "PENDING",   5),                       // Mirjam - fiets
  plan(36, V[17].id, VAC_IDS[8], "PENDING",   3),                       // Gerard - tuinteam
  plan(37, V[0].id,  VAC_IDS[6], "ACCEPTED",  12, 7, 0),                // Anna - transport (nieuw)
  plan(38, V[1].id,  VAC_IDS[7], "ACCEPTED",  9,  4),                   // Jan - leesmaatje (nieuw)
  plan(39, V[3].id,  VAC_IDS[4], "REJECTED",  14),                      // Peter - secretaris (afgewezen)
  plan(40, V[6].id,  VAC_IDS[1], "REJECTED",  20),                      // Fiona - telefonisch (afgewezen)
]

// ── Swipes (voor like-ratio) ──────────────────────────────────────────────────

function makeSwipes() {
  const swipes: { id: string; fromId: string; vacId: string; dir: "LIKE"|"DISLIKE"|"SUPER_LIKE"; daysAgoVal: number }[] = []
  let idx = 0

  // Elke volunteer swipt meerdere keren
  for (const vol of VOLUNTEERS) {
    const vacCount = Math.floor(Math.random() * 5) + 3 // 3-7 swipes per persoon
    const shuffled = [...VAC_IDS].sort(() => Math.random() - 0.5).slice(0, vacCount)
    for (const vacId of shuffled) {
      const dir: "LIKE"|"DISLIKE"|"SUPER_LIKE" = Math.random() < 0.65 ? "LIKE" : Math.random() < 0.3 ? "SUPER_LIKE" : "DISLIKE"
      swipes.push({
        id: `swipe-hist-${idx++}`,
        fromId: vol.id,
        vacId,
        dir,
        daysAgoVal: Math.floor(Math.random() * 340) + 5,
      })
    }
  }
  return swipes
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding historische demo-data voor WijHeemstede...\n")

  const pw = await hp("demo1234")

  // ── 1. Vrijwilligers aanmaken ──────────────────────────────────────────
  for (const vol of VOLUNTEERS) {
    await prisma.user.upsert({
      where: { email: vol.email },
      update: {},
      create: {
        id: vol.id,
        name: vol.name,
        email: vol.email,
        password: pw,
        role: "VOLUNTEER",
        status: "ACTIVE",
        onboarded: true,
        bio: vol.bio,
        location: "Heemstede",
        postcode: "2101",
        lat: 52.358 + (Math.random() - 0.5) * 0.01,
        lon: 4.617  + (Math.random() - 0.5) * 0.01,
        maxDistance: 10,
        availability: JSON.stringify(vol.availability),
        motivationProfile: JSON.stringify({
          waarden: Math.floor(Math.random() * 3) + 3,
          begrip: Math.floor(Math.random() * 3) + 2,
          sociaal: Math.floor(Math.random() * 2) + 4,
          loopbaan: Math.floor(Math.random() * 3) + 1,
          bescherming: Math.floor(Math.random() * 3) + 2,
          verbetering: Math.floor(Math.random() * 3) + 3,
        }),
        // Registratie verspreid over afgelopen jaar
        createdAt: daysAgo(Math.floor(Math.random() * 360) + 10),
      },
    })
  }
  console.log(`✅  ${VOLUNTEERS.length} vrijwilligers aangemaakt`)

  // ── 2. Vacature IDs verifiëren ─────────────────────────────────────────
  const existingVacs = await prisma.vacancy.findMany({
    where: { id: { in: VAC_IDS } },
    select: { id: true },
  })
  const existingVacIds = new Set(existingVacs.map((v) => v.id))
  const missingVacs = VAC_IDS.filter((id) => !existingVacIds.has(id))
  if (missingVacs.length > 0) {
    console.warn(`⚠️  Ontbrekende vacatures: ${missingVacs.join(", ")}`)
    console.warn("   Draai eerst: pnpm tsx scripts/seed-heemstede.ts")
  }

  // ── 3. Matches aanmaken ────────────────────────────────────────────────
  let matchCount = 0
  for (const p of PLANS) {
    if (!existingVacIds.has(p.vacId)) continue

    await prisma.match.deleteMany({ where: { id: p.id } })
    await prisma.match.create({
      data: {
        id: p.id,
        volunteerId: p.volId,
        vacancyId: p.vacId,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.createdAt,
        startedAt: p.startedAt ?? null,
        checkIn1SentAt: p.checkIn1SentAt ?? null,
        checkIn4SentAt: p.checkIn4SentAt ?? null,
        checkIn12SentAt: p.checkIn12SentAt ?? null,
      },
    })
    matchCount++
  }
  console.log(`✅  ${matchCount} historische matches aangemaakt`)

  // ── 4. Gesprekken + berichten voor ACCEPTED/COMPLETED matches ──────────
  const acceptedPlans = PLANS.filter((p) => p.status === "ACCEPTED" || p.status === "COMPLETED")
  let convCount = 0
  let msgCount  = 0

  for (const p of acceptedPlans) {
    if (!existingVacIds.has(p.vacId) || !p.startedAt) continue

    const convId = `conv-hist-${p.id}`
    const orgAdminId = ORG_ADMINS[p.vacId]
    if (!orgAdminId) continue

    // Verwijder bestaand gesprek
    await prisma.message.deleteMany({ where: { conversationId: convId } })
    await prisma.conversationParticipant.deleteMany({ where: { conversationId: convId } })
    await prisma.conversation.deleteMany({ where: { id: convId } })

    // Aanmaken
    const conv = await prisma.conversation.create({
      data: {
        id: convId,
        matchId: p.id,
        createdAt: p.startedAt,
        updatedAt: p.startedAt,
        participants: {
          create: [
            { userId: p.volId },
            { userId: orgAdminId },
          ],
        },
      },
    })

    // Script bepalen
    const script = CONV_SCRIPTS[p.vacId] ?? defaultScript(p.vacId)

    // Berichten aanmaken
    let msgTime = new Date(p.startedAt.getTime() + 2 * 60 * 60 * 1000) // 2u na start
    for (let i = 0; i < script.length; i++) {
      const s = script[i]
      // Org bericht
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: orgAdminId,
          content: s.org,
          createdAt: msgTime,
          updatedAt: msgTime,
        },
      })
      msgTime = new Date(msgTime.getTime() + 45 * 60 * 1000) // 45 min later
      msgCount++

      // Vol bericht
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: p.volId,
          content: s.vol,
          createdAt: msgTime,
          updatedAt: msgTime,
        },
      })
      msgTime = new Date(msgTime.getTime() + 60 * 60 * 1000) // 1u later
      msgCount++
    }

    convCount++
  }
  console.log(`✅  ${convCount} gesprekken aangemaakt met ${msgCount} berichten`)

  // ── 5. Swipes ─────────────────────────────────────────────────────────
  const swipes = makeSwipes()
  let swipeCount = 0
  for (const s of swipes) {
    if (!existingVacIds.has(s.vacId)) continue
    const ts = daysAgo(s.daysAgoVal)
    try {
      await prisma.swipe.upsert({
        where: { fromId_vacancyId: { fromId: s.fromId, vacancyId: s.vacId } },
        update: {},
        create: {
          id: s.id,
          fromId: s.fromId,
          vacancyId: s.vacId,
          direction: s.dir,
          createdAt: ts,
        },
      })
      swipeCount++
    } catch {
      // Ignore duplicates
    }
  }
  console.log(`✅  ~${swipeCount} swipes aangemaakt`)

  // ── 6. Summary ────────────────────────────────────────────────────────
  const [totalMatches, accepted, completed, totalVols] = await Promise.all([
    prisma.match.count(),
    prisma.match.count({ where: { status: "ACCEPTED" } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.user.count({ where: { role: "VOLUNTEER" } }),
  ])

  const totalHoursEst = (accepted * 3 * 12) + (completed * 3 * 10)
  const economicValue = totalHoursEst * 15.38

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         WijHeemstede — Historische demo-data klaar!          ║
╠══════════════════════════════════════════════════════════════╣
║  Vrijwilligers totaal:    ${String(totalVols).padEnd(32)}║
║  Matches totaal:          ${String(totalMatches).padEnd(32)}║
║    Geaccepteerd:          ${String(accepted).padEnd(32)}║
║    Afgerond:              ${String(completed).padEnd(32)}║
║  Geschatte uren:          ~${String(totalHoursEst + " uur").padEnd(31)}║
║  Economische waarde:      ~€${String(Math.round(economicValue)).padEnd(30)}║
╠══════════════════════════════════════════════════════════════╣
║  Impactpagina:  /impact?gemeente=heemstede                   ║
║  Admin:         /admin/impact                                ║
╚══════════════════════════════════════════════════════════════╝
`)
}

main()
  .catch((e) => {
    console.error("❌  Seed mislukt:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
