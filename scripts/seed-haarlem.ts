/**
 * scripts/seed-haarlem.ts
 *
 * Seeds demo data for the HaarlemHelpt × Vrijwilligersmatch tenant.
 *
 * Run AFTER:
 *   pnpm db:push          (applies schema to DB)
 *
 * Usage:
 *   pnpm seed:haarlem
 *
 * Safe to run multiple times — uses upsert / ON CONFLICT DO UPDATE.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ── Helpers ────────────────────────────────────────────────────────────────

function cuid(prefix: string) {
  // Deterministic IDs make the script idempotent
  return `${prefix}-haarlem-demo`
}

async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding HaarlemHelpt demo data...\n")

  // ── 1. Gemeente ──────────────────────────────────────────────────────────
  await prisma.gemeente.upsert({
    where: { slug: "haarlem" },
    update: {
      name: "HaarlemHelpt",
      displayName: "Haarlem",
      tagline: "Vrijwilligerswerk in Haarlem & omgeving",
    },
    create: {
      id: "gemeente-haarlem",
      slug: "haarlem",
      name: "HaarlemHelpt",
      displayName: "Haarlem",
      primaryColor: "#B91C1C",
      tagline: "Vrijwilligerswerk in Haarlem & omgeving",
      website: "https://www.haarlem.nl",
    },
  })
  console.log("✅  Gemeente Haarlem aangemaakt / bijgewerkt")

  // ── 2. Categories & Skills ────────────────────────────────────────────────

  const categoryNames = [
    "Ouderen",
    "Zorg & Welzijn",
    "Sport & Recreatie",
    "Natuur & Milieu",
    "Buurt & Gemeenschap",
    "Financieel / Schuldhulp",
    "Onderwijs & Taal",
  ]

  const categories: Record<string, string> = {}
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories[name] = cat.id
  }

  const skillNames = [
    "Communicatie",
    "Organisatie",
    "Administratie",
    "Coaching / Begeleiding",
    "Vervoer / Rijbewijs",
    "Financieel advies",
    "Teamwork",
    "Taalvaardigheid",
    "Koken",
  ]

  const skills: Record<string, string> = {}
  for (const name of skillNames) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    skills[name] = skill.id
  }

  console.log("✅  Categorieën & vaardigheden klaar")

  // ── 3. Demo volunteer ────────────────────────────────────────────────────

  const volunteerUser = await prisma.user.upsert({
    where: { email: "vrijwilliger@haarlem-demo.nl" },
    update: {},
    create: {
      id: cuid("vol-user"),
      name: "Alex de Vrijwilliger",
      email: "vrijwilliger@haarlem-demo.nl",
      password: await hashPassword("demo1234"),
      role: "VOLUNTEER",
      status: "ACTIVE",
      onboarded: true,
      bio: "Ik woon in Haarlem-Noord en wil me graag inzetten voor mijn buurt. Ik heb tijd in de avonden en weekenden en help graag mensen op weg.",
      location: "Haarlem",
      postcode: "2015",
      lat: 52.3874,
      lon: 4.6462,
      maxDistance: 10,
      availability: JSON.stringify(["tuesday", "thursday", "saturday", "evening"]),
      motivationProfile: JSON.stringify({
        waarden: 5,
        begrip: 4,
        sociaal: 4,
        loopbaan: 2,
        bescherming: 3,
        verbetering: 5,
      }),
    },
  })

  const volunteerInterestCategories = ["Buurt & Gemeenschap", "Zorg & Welzijn", "Ouderen"]
  for (const catName of volunteerInterestCategories) {
    const catId = categories[catName]
    if (!catId) continue
    await prisma.userCategory.upsert({
      where: { userId_categoryId: { userId: volunteerUser.id, categoryId: catId } },
      update: {},
      create: { userId: volunteerUser.id, categoryId: catId },
    })
  }

  console.log(`✅  Demo vrijwilliger: ${volunteerUser.email}  (wachtwoord: demo1234)`)

  // ── 4. Organisations + their admin users ─────────────────────────────────

  const orgs = [
    {
      id: cuid("org-vvc-buuv"),
      slug: "vvc-buuv-haarlem",
      name: "VVC-Buuv",
      description:
        "VVC-Buuv verbindt vrijwilligers aan bewoners in Haarlem die een helpende hand kunnen gebruiken. " +
        "Of het nu gaat om een boodschapje doen, een ritje naar de dokter, klusjes in huis of gewoon " +
        "iemand om mee te praten — Buuv-vrijwilligers zijn er voor hun buren. " +
        "Samen maken we Haarlem een stukje warmer en zorgzamer.",
      city: "Haarlem",
      postcode: "2011",
      lat: 52.388,
      lon: 4.638,
      email: "info@vvc-buuv.nl",
      website: "https://www.vvc-buuv.nl",
      adminEmail: "beheerder.buuv@haarlem-demo.nl",
      adminName: "Beheerder VVC-Buuv",
      categories: ["Buurt & Gemeenschap", "Ouderen", "Zorg & Welzijn"],
    },
    {
      id: cuid("org-welzijn-haarlem"),
      slug: "welzijn-haarlem",
      name: "Welzijn Haarlem",
      description:
        "Welzijn Haarlem werkt aan een stad waar iedereen mee kan doen. " +
        "Wij organiseren activiteiten voor ouderen, ondersteunen mantelzorgers en versterken de sociale " +
        "samenhang in wijken als Schalkwijk, Haarlem-Noord en het Centrum. " +
        "Onze vrijwilligers zijn het kloppende hart van alles wat wij doen.",
      city: "Haarlem",
      postcode: "2012",
      lat: 52.383,
      lon: 4.641,
      email: "info@welzijnhaarlem.nl",
      website: "https://www.welzijnhaarlem.nl",
      adminEmail: "beheerder.welzijn@haarlem-demo.nl",
      adminName: "Beheerder Welzijn Haarlem",
      categories: ["Ouderen", "Zorg & Welzijn", "Buurt & Gemeenschap"],
    },
    {
      id: cuid("org-voedselbank"),
      slug: "voedselbank-haarlem",
      name: "Voedselbank Haarlem",
      description:
        "De Voedselbank Haarlem verstrekt wekelijks voedselpakketten aan gezinnen en alleenstaanden " +
        "die het financieel moeilijk hebben. Zonder onze vrijwilligers is dat onmogelijk. " +
        "Van sorteren en inpakken tot het uitdelen van pakketten — iedere hulp telt.",
      city: "Haarlem",
      postcode: "2031",
      lat: 52.392,
      lon: 4.667,
      email: "info@voedselbankhaarlem.nl",
      website: "https://www.voedselbankhaarlem.nl",
      adminEmail: "beheerder.voedselbank@haarlem-demo.nl",
      adminName: "Beheerder Voedselbank Haarlem",
      categories: ["Buurt & Gemeenschap", "Zorg & Welzijn", "Financieel / Schuldhulp"],
    },
    {
      id: cuid("org-taal-aan-zee"),
      slug: "taal-aan-zee-haarlem",
      name: "Taal aan Zee",
      description:
        "Taal aan Zee biedt taalondersteuning aan nieuwkomers en inburgeraars in de regio Haarlem. " +
        "Onze vrijwillige taaldocenten en gesprekspartners helpen cursisten het Nederlands te verbeteren " +
        "en vergroten zo hun kansen op werk, opleiding en sociale participatie.",
      city: "Haarlem",
      postcode: "2023",
      lat: 52.376,
      lon: 4.648,
      email: "info@taalaanzee.nl",
      website: "https://www.taalaanzee.nl",
      adminEmail: "beheerder.taal@haarlem-demo.nl",
      adminName: "Beheerder Taal aan Zee",
      categories: ["Onderwijs & Taal", "Buurt & Gemeenschap"],
    },
    {
      id: cuid("org-schuldhulp-haarlem"),
      slug: "schuldhulpmaatje-haarlem",
      name: "Schuldhulpmaatje Haarlem",
      description:
        "Schuldhulpmaatje Haarlem koppelt getrainde vrijwilligers aan mensen met (dreigende) schulden. " +
        "Onze maatjes bieden een luisterend oor, helpen de papierberg begrijpelijk te maken " +
        "en ondersteunen bij contact met instanties. Discreet, persoonlijk en dichtbij.",
      city: "Haarlem",
      postcode: "2015",
      lat: 52.385,
      lon: 4.652,
      email: "haarlem@schuldhulpmaatje.nl",
      website: "https://www.schuldhulpmaatje.nl",
      adminEmail: "beheerder.schuldhulp@haarlem-demo.nl",
      adminName: "Beheerder Schuldhulpmaatje Haarlem",
      categories: ["Financieel / Schuldhulp", "Buurt & Gemeenschap", "Zorg & Welzijn"],
    },
  ]

  const orgIds: Record<string, string> = {}

  for (const org of orgs) {
    const adminUser = await prisma.user.upsert({
      where: { email: org.adminEmail },
      update: {},
      create: {
        id: `${org.id}-admin`,
        name: org.adminName,
        email: org.adminEmail,
        password: await hashPassword("demo1234"),
        role: "ORGANISATION",
        status: "ACTIVE",
        onboarded: true,
      },
    })

    const created = await prisma.organisation.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        description: org.description,
      },
      create: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        city: org.city,
        postcode: org.postcode,
        lat: org.lat,
        lon: org.lon,
        email: org.email,
        website: org.website,
        status: "APPROVED",
        verifiedAt: new Date(),
        adminId: adminUser.id,
      },
    })

    orgIds[org.slug] = created.id

    await prisma.organisation.update({
      where: { id: created.id },
      data: { gemeenteId: "gemeente-haarlem" },
    })

    for (const catName of org.categories) {
      const catId = categories[catName]
      if (!catId) continue
      await prisma.orgCategory.upsert({
        where: {
          organisationId_categoryId: {
            organisationId: created.id,
            categoryId: catId,
          },
        },
        update: {},
        create: { organisationId: created.id, categoryId: catId },
      })
    }

    console.log(`✅  Organisatie: ${org.name}`)
  }

  // ── 5. Vacancies ──────────────────────────────────────────────────────────

  const vacancies = [
    // ── VVC-Buuv ──────────────────────────────────────────────────────────
    {
      id: cuid("vac-buuv-boodschappen"),
      orgSlug: "vvc-buuv-haarlem",
      title: "Buuv-vrijwilliger: help een buurtbewoner met boodschappen of een ritje",
      description:
        "Wil jij iets betekenen voor een buur die dat zelf niet meer kan? Als Buuv-vrijwilliger " +
        "help je bewoners in jouw wijk met praktische klussen: een boodschapje doen, " +
        "naar de dokter rijden, iets ophangen of gewoon even langskomen voor een kop koffie.\n\n" +
        "Je bepaalt zelf hoeveel tijd je hebt. Sommige Buuv-vrijwilligers helpen wekelijks, " +
        "anderen een paar keer per maand — alles is welkom.\n\n" +
        "Hoe het werkt:\n" +
        "• Je meldt je aan via VVC-Buuv\n" +
        "• Wij koppelen je aan een buurtbewoner in de buurt van jouw postcode\n" +
        "• Je spreekt zelf af wanneer en hoe jullie samenwerken\n\n" +
        "Meer info: info@vvc-buuv.nl of bel 023 / 750 4444.",
      location: "Haarlem",
      city: "Haarlem",
      postcode: "2011",
      lat: 52.388,
      lon: 4.638,
      hours: 2,
      duration: "Doorlopend",
      categories: ["Buurt & Gemeenschap", "Ouderen"],
      skills: ["Communicatie", "Vervoer / Rijbewijs"],
    },
    {
      id: cuid("vac-buuv-coordinator"),
      orgSlug: "vvc-buuv-haarlem",
      title: "Wijkcoördinator Buuv-vrijwilligers Schalkwijk",
      description:
        "VVC-Buuv groeit snel in de wijk Schalkwijk en we zoeken een enthousiaste coördinator " +
        "die ons vrijwilligersteam in deze wijk aanstuurt.\n\n" +
        "Als wijkcoördinator:\n" +
        "• Ben je het eerste aanspreekpunt voor vrijwilligers en hulpvragers in Schalkwijk\n" +
        "• Koppel je hulpvragen aan de juiste vrijwilliger\n" +
        "• Organiseer je (online) overleggen met je vrijwilligersteam\n" +
        "• Signaleer je kansen en behoeften in de wijk en rapporteer je aan de Buuv-coördinator\n\n" +
        "Tijdsinvestering: circa 6–8 uur per maand. Reiskostenvergoeding aanwezig.",
      location: "Schalkwijk, Haarlem",
      city: "Haarlem",
      postcode: "2036",
      lat: 52.368,
      lon: 4.685,
      hours: 7,
      duration: "Doorlopend",
      categories: ["Buurt & Gemeenschap", "Zorg & Welzijn"],
      skills: ["Organisatie", "Communicatie", "Coaching / Begeleiding"],
    },

    // ── Welzijn Haarlem ───────────────────────────────────────────────────
    {
      id: cuid("vac-welzijn-activiteiten"),
      orgSlug: "welzijn-haarlem",
      title: "Activiteitenbegeleider voor ouderen — Haarlem-Noord",
      description:
        "Welzijn Haarlem organiseert iedere week gezellige bijeenkomsten voor ouderen in " +
        "buurtcentra door de hele stad. In Haarlem-Noord zoeken we een vrolijke begeleider " +
        "die samen met de groep koffie drinkt, spelletjes doet of creatieve activiteiten begeleidt.\n\n" +
        "Als activiteitenbegeleider:\n" +
        "• Begeleid je 1 dagdeel per week een groep van 8–12 ouderen\n" +
        "• Zorg je voor een gezellige sfeer en stimuleer je deelname\n" +
        "• Werk je samen met een vast team van vrijwilligers en een professionele coördinator\n\n" +
        "Wij bieden introductietraining, begeleiding en een onkostenvergoeding.",
      location: "Buurtcentrum Noord, Haarlem",
      city: "Haarlem",
      postcode: "2023",
      lat: 52.395,
      lon: 4.644,
      hours: 4,
      duration: "Doorlopend",
      categories: ["Ouderen", "Buurt & Gemeenschap"],
      skills: ["Communicatie", "Teamwork", "Coaching / Begeleiding"],
    },
    {
      id: cuid("vac-welzijn-mantelzorg"),
      orgSlug: "welzijn-haarlem",
      title: "Vrijwillig ondersteuner voor mantelzorgers",
      description:
        "Mantelzorgers zijn onmisbaar, maar ze kunnen wel eens een vrij uurtje gebruiken. " +
        "Als ondersteuner bij Welzijn Haarlem neem jij de zorg tijdelijk over, " +
        "zodat de mantelzorger even op adem kan komen.\n\n" +
        "Wat doe je?\n" +
        "• Je bezoekt regelmatig een zorgvrager thuis (een paar uur per week)\n" +
        "• Je onderneemt activiteiten samen: wandelen, spelletjes doen, of gewoon een goed gesprek\n" +
        "• Je rapporteert aan de coördinator als je iets opvalt\n\n" +
        "Geschikt voor mensen met empathie, geduld en betrouwbaarheid. " +
        "Ervaring in de zorg is geen vereiste.",
      location: "Haarlem",
      city: "Haarlem",
      postcode: "2012",
      lat: 52.383,
      lon: 4.641,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Zorg & Welzijn", "Ouderen"],
      skills: ["Coaching / Begeleiding", "Communicatie"],
    },

    // ── Voedselbank Haarlem ───────────────────────────────────────────────
    {
      id: cuid("vac-voedselbank-sorteren"),
      orgSlug: "voedselbank-haarlem",
      title: "Sorteer- en inpakmedewerker bij de Voedselbank Haarlem",
      description:
        "De Voedselbank Haarlem verstrekt wekelijks paketten aan ruim 400 gezinnen. " +
        "Daarvoor hebben we handen nodig! Als sorteermedewerker sorteer en pak je " +
        "voedselproducten in op onze locatie in Waarderpolder.\n\n" +
        "We werken met vaste ploegen op dinsdag- en donderdagochtend (9:00–12:00). " +
        "Je kunt kiezen welke dag(en) je beschikbaar bent.\n\n" +
        "Je hoeft geen ervaring te hebben — alleen enthousiasme en twee goede handen. " +
        "Koffie staat klaar!",
      location: "Waarderpolder, Haarlem",
      city: "Haarlem",
      postcode: "2031",
      lat: 52.392,
      lon: 4.667,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Buurt & Gemeenschap", "Zorg & Welzijn"],
      skills: ["Teamwork"],
    },

    // ── Taal aan Zee ─────────────────────────────────────────────────────
    {
      id: cuid("vac-taal-docent"),
      orgSlug: "taal-aan-zee-haarlem",
      title: "Vrijwillig taaldocent of gesprekspartner voor nieuwkomers",
      description:
        "Taal aan Zee zoekt vrijwilligers die inburgeraars en nieuwkomers helpen met hun Nederlands. " +
        "Dit kan als gesprekspartner (informeel oefengesprekken) of als taaldocent " +
        "(voor gevorderden die een les willen voorbereiden).\n\n" +
        "Als gesprekspartner:\n" +
        "• Spreek je 1× per week 1,5 uur af met jouw cursist\n" +
        "• Oefen je dagelijkse situaties: inkopen doen, naar de huisarts, brieven begrijpen\n" +
        "• Werk je met materiaal van Taal aan Zee\n\n" +
        "Je spreekt zelf vloeiend Nederlands (moedertaal of bijna). " +
        "Wij bieden een korte introductieworkshop aan.",
      location: "Haarlem",
      city: "Haarlem",
      postcode: "2023",
      lat: 52.376,
      lon: 4.648,
      remote: true,
      hours: 2,
      duration: "Doorlopend",
      categories: ["Onderwijs & Taal", "Buurt & Gemeenschap"],
      skills: ["Communicatie", "Taalvaardigheid", "Coaching / Begeleiding"],
    },

    // ── Schuldhulpmaatje ──────────────────────────────────────────────────
    {
      id: cuid("vac-schuldhulp-maatje"),
      orgSlug: "schuldhulpmaatje-haarlem",
      title: "Word Schuldhulpmaatje in Haarlem",
      description:
        "Schulden kunnen iemands leven volledig ontregelen. Als Schuldhulpmaatje bied jij " +
        "een luisterend oor en praktische ondersteuning aan mensen die vastlopen.\n\n" +
        "Na een training van 2 dagen begeleid je 1–2 cliënten tegelijk. " +
        "Je helpt ze post bijhouden, contact leggen met schuldeisers en overzicht te bewaren. " +
        "Je doet dit samen met een coördinator die altijd bereikbaar is.\n\n" +
        "Tijdsinvestering: 2–4 uur per week, flexibel in te plannen. " +
        "Reiskosten worden vergoed.",
      location: "Haarlem",
      city: "Haarlem",
      postcode: "2015",
      lat: 52.385,
      lon: 4.652,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Financieel / Schuldhulp", "Buurt & Gemeenschap"],
      skills: ["Administratie", "Communicatie", "Financieel advies"],
    },
  ]

  for (const vac of vacancies) {
    const orgId = orgIds[vac.orgSlug]
    if (!orgId) {
      console.warn(`⚠️  Org niet gevonden voor slug: ${vac.orgSlug}`)
      continue
    }

    const skillRecords = await Promise.all(
      vac.skills.map((n) =>
        prisma.skill.upsert({ where: { name: n }, update: {}, create: { name: n } }),
      ),
    )
    const categoryRecords = await Promise.all(
      vac.categories.map((n) =>
        prisma.category.upsert({ where: { name: n }, update: {}, create: { name: n } }),
      ),
    )

    await prisma.vacancy.deleteMany({ where: { id: vac.id } })

    await prisma.vacancy.create({
      data: {
        id: vac.id,
        title: vac.title,
        description: vac.description,
        location: vac.location ?? null,
        city: vac.city,
        postcode: vac.postcode,
        lat: vac.lat,
        lon: vac.lon,
        remote: (vac as { remote?: boolean }).remote ?? false,
        hours: vac.hours,
        duration: vac.duration,
        status: "ACTIVE",
        organisationId: orgId,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
        categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
      },
    })

    console.log(`✅  Vacature: ${vac.title.slice(0, 60)}...`)
  }

  console.log("\n🎉  Haarlem demo klaar!\n")
  console.log("Demo accounts (wachtwoord: demo1234):")
  console.log("  Vrijwilliger : vrijwilliger@haarlem-demo.nl")
  console.log("  VVC-Buuv     : beheerder.buuv@haarlem-demo.nl")
  console.log("  Welzijn H.   : beheerder.welzijn@haarlem-demo.nl")
  console.log("  Voedselbank  : beheerder.voedselbank@haarlem-demo.nl")
  console.log("  Taal aan Zee : beheerder.taal@haarlem-demo.nl")
  console.log("  Schuldhulp   : beheerder.schuldhulp@haarlem-demo.nl")
  console.log("\nPlatform bereikbaar via GEMEENTE_SLUG=haarlem of subdomain haarlem.*\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
