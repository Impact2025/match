/**
 * scripts/seed-heemstede.ts
 *
 * Seeds demo data for the WijHeemstede × Vrijwilligersmatch tenant.
 *
 * Run AFTER:
 *   pnpm db:push          (applies schema to DB)
 *   pnpm prisma generate  (regenerates Prisma client)
 *
 * Usage:
 *   pnpm tsx scripts/seed-heemstede.ts
 *
 * Safe to run multiple times — uses upsert / ON CONFLICT DO UPDATE.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ── Helpers ────────────────────────────────────────────────────────────────

function cuid(prefix: string) {
  // Deterministic IDs make the script idempotent
  return `${prefix}-heemstede-demo`
}

async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding WijHeemstede demo data...\n")

  // ── 1. Gemeente ──────────────────────────────────────────────────────────
  await prisma.gemeente.upsert({
    where: { slug: "heemstede" },
    update: {
      name: "WijHeemstede",
      displayName: "Heemstede",
      tagline: "Vrijwilligerswerk in Heemstede & omgeving",
    },
    create: {
      id: "gemeente-heemstede",
      slug: "heemstede",
      name: "WijHeemstede",
      displayName: "Heemstede",
      primaryColor: "#6d28d9",
      tagline: "Vrijwilligerswerk in Heemstede & omgeving",
      website: "https://www.wijheemstede.nl",
    },
  })
  console.log("✅  Gemeente Heemstede aangemaakt / bijgewerkt")

  // ── 2. Categories & Skills (upsert — might already exist from main seed) ─

  const categoryNames = [
    "Ouderen",
    "Zorg & Welzijn",
    "Sport & Recreatie",
    "Natuur & Milieu",
    "Buurt & Gemeenschap",
    "Financieel / Schuldhulp",
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
    where: { email: "vrijwilliger@heemstede-demo.nl" },
    update: {},
    create: {
      id: cuid("vol-user"),
      name: "Sam de Vrijwilliger",
      email: "vrijwilliger@heemstede-demo.nl",
      password: await hashPassword("demo1234"),
      role: "VOLUNTEER",
      status: "ACTIVE",
      onboarded: true,
      bio: "Ik woon in Heemstede en wil mij graag inzetten voor mijn buurt. Ik heb tijd op doordeweekse avonden en in het weekend.",
      location: "Heemstede",
      postcode: "2101",
      lat: 52.3589,
      lon: 4.6166,
      maxDistance: 10,
      availability: JSON.stringify(["monday", "wednesday", "saturday", "evening"]),
      motivationProfile: JSON.stringify({
        waarden: 4,
        begrip: 3,
        sociaal: 5,
        loopbaan: 2,
        bescherming: 3,
        verbetering: 4,
      }),
    },
  })

  // Link interests to volunteer
  const volunteerInterestCategories = ["Ouderen", "Buurt & Gemeenschap", "Zorg & Welzijn"]
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
      id: cuid("org-wij-eten"),
      slug: "wij-eten-samen-heemstede",
      name: "WIJ Eten Samen",
      description:
        "WIJ Eten Samen ontvangt iedere week gasten voor een warm en gezellig maaltijd in Heemstede. " +
        "We verbinden mensen die om welke reden dan ook moeite hebben om mee te doen in de maatschappij.",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      email: "info@wijhetensamen-heemstede.nl",
      website: "https://www.wijheemstede.nl",
      adminEmail: "beheerder.wij-eten@heemstede-demo.nl",
      adminName: "Beheerder WIJ Eten Samen",
      categories: ["Ouderen", "Buurt & Gemeenschap", "Zorg & Welzijn"],
    },
    {
      id: cuid("org-fietsmaatjes"),
      slug: "fietsmaatjes-zuid-kennemerland",
      name: "Fietsmaatjes Zuid-Kennemerland",
      description:
        "Fietsmaatjes koppelt mensen die graag willen fietsen maar dat niet alleen kunnen aan vrijwilligers " +
        "die samen met hen op pad gaan. Zo genieten ook mensen met een beperking van de buitenlucht en beweging.",
      city: "Heemstede",
      postcode: "2103",
      lat: 52.362,
      lon: 4.614,
      email: "info@fietsmaatjeszk.nl",
      website: "https://www.fietsmaatjes.nl",
      adminEmail: "beheerder.fietsmaatjes@heemstede-demo.nl",
      adminName: "Beheerder Fietsmaatjes ZK",
      categories: ["Ouderen", "Zorg & Welzijn", "Sport & Recreatie"],
    },
    {
      id: cuid("org-wij-heemstede"),
      slug: "wij-heemstede",
      name: "WIJ Heemstede",
      description:
        "WIJ Heemstede is hét sociale wijkteam van de gemeente Heemstede. We verbinden bewoners, " +
        "organisaties en vrijwilligers om samen een sterk en betrokken Heemstede te bouwen.",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.358,
      lon: 4.619,
      email: "info@wijheemstede.nl",
      website: "https://www.wijheemstede.nl",
      adminEmail: "beheerder.wij@heemstede-demo.nl",
      adminName: "Beheerder WIJ Heemstede",
      categories: ["Buurt & Gemeenschap", "Sport & Recreatie", "Natuur & Milieu"],
    },
    {
      id: cuid("org-schuldhulp"),
      slug: "schuldhulpmaatje-zk",
      name: "Schuldhulpmaatje Zuid-Kennemerland",
      description:
        "Schuldhulpmaatje koppelt vrijwilligers aan mensen met (dreigende) schulden. " +
        "Onze vrijwilligers bieden een luisterend oor, helpen de weg te vinden en ondersteunen bij " +
        "administratieve taken. Wij zijn actief in Heemstede en de omliggende gemeenten.",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.36,
      lon: 4.616,
      email: "zuidkennemerland@schuldhulpmaatje.nl",
      website: "https://www.schuldhulpmaatje.nl",
      adminEmail: "beheerder.schuldhulp@heemstede-demo.nl",
      adminName: "Beheerder Schuldhulpmaatje ZK",
      categories: ["Financieel / Schuldhulp", "Buurt & Gemeenschap", "Zorg & Welzijn"],
    },
  ]

  const orgIds: Record<string, string> = {}

  for (const org of orgs) {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: org.adminEmail },
      update: { onboarded: true, status: "ACTIVE" },
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

    // Create organisation
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

    // Link to Gemeente
    await prisma.organisation.update({
      where: { id: created.id },
      data: { gemeenteId: "gemeente-heemstede" },
    })

    // Link categories
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

  // ── 5. Vacancies ─────────────────────────────────────────────────────────

  const vacancies = [
    // ── WIJ Eten Samen ───────────────────────────────────────────────────
    {
      id: cuid("vac-gastheer"),
      orgSlug: "wij-eten-samen-heemstede",
      title: "Hartelijke gastheer of gastvrouw voor WIJ Eten Samen",
      description:
        "WIJ Eten Samen ontvangt iedere week gasten die een lekker en warm maal kunnen nuttigen " +
        "met lotgenoten in Heemstede. Dit kunnen mensen zijn die om welke reden dan ook moeite " +
        "hebben om mee te doen in de maatschappij.\n\n" +
        "Wij verwelkomen graag onze hartelijke gastheer of gastvrouw op de maandagavond " +
        "(start 17:00 tot 20:30 uur). Je ontvangt de gasten, helpt een oogje in het zeil te houden " +
        "en zorgt met een praatje dat iedereen zich welkom voelt.\n\n" +
        "Ben jij een warm en sociaal persoon die van gezelligheid houdt? Dan zoeken wij jou!",
      location: "Alle locaties",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Ouderen", "Buurt & Gemeenschap"],
      skills: ["Communicatie", "Teamwork"],
    },
    {
      id: cuid("vac-telefonisch"),
      orgSlug: "wij-eten-samen-heemstede",
      title: "Help je mee met de telefonische reserveringen voor WIJ Eten Samen?",
      description:
        "WIJ Eten Samen ontvangt iedere week gasten voor een warm maal. Om dit goed te organiseren " +
        "zoeken wij een vrijwilliger die de telefonische reserveringen beheert.\n\n" +
        "Wij zoeken 1 à 2 mensen die de reserveringen aan- en te kenmerken bij de deelnemers " +
        "gedurende de ochtend. Op doordeweekse ochtenden ben je telefonisch en via de besloten " +
        "WhatsApp-groep bereikbaar van 9:30 tot 11:30 uur.\n\n" +
        "Ben jij een vrijwillige mvo-pleger? Geef jij graag mensen een fijne avond? " +
        "Dan willen we graag met jou kennis maken!",
      location: "Gemeente Heemstede",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      remote: true,
      hours: 2,
      duration: "Doorlopend",
      categories: ["Ouderen", "Zorg & Welzijn"],
      skills: ["Communicatie", "Organisatie", "Administratie"],
    },

    // ── Fietsmaatjes Zuid-Kennemerland ───────────────────────────────────
    {
      id: cuid("vac-fiets-locatie"),
      imageUrl: "/Fietsmaatjes.png",
      orgSlug: "fietsmaatjes-zuid-kennemerland",
      title: "Fietsmaatjes ZK zoekt een Locatie-contactpersoon voor Plein 1",
      description:
        "Heb jij organisatietalent en zin om het leven van mensen met een beperking te verrijken?\n\n" +
        "Fietsmaatjes koppelt mensen die zelf niet meer alleen kunnen fietsen aan een fietsmaat. " +
        "Zo kunnen we samen genieten van de mooie omgeving van Zuid-Kennemerland.\n\n" +
        "Als locatiecontactpersoon ben jij verantwoordelijk voor de volgende taken:\n" +
        "• Het bijhouden van de koppels (deelnemers en hun fietsmaatjes)\n" +
        "• Het plannen van afspraken en ritten in de regio Plein 1\n" +
        "• Het onderhouden van duurzame contacten met deelnemers en fietsmaatjes\n\n" +
        "Fietsmaatjes Zuid-Kennemerland werkt enorm aan het groeien van onze mooie organisatie, " +
        "zodat zo veel mogelijk mensen kunnen genieten van een fietsritje. " +
        "Voor meer informatie: www.fietsmaatjeszuidkennemerland.nl",
      location: "Heemstede",
      city: "Heemstede",
      postcode: "2103",
      lat: 52.362,
      lon: 4.614,
      hours: 4,
      duration: "Doorlopend",
      categories: ["Ouderen", "Zorg & Welzijn", "Sport & Recreatie"],
      skills: ["Organisatie", "Communicatie", "Coaching / Begeleiding"],
    },

    // ── WIJ Heemstede ────────────────────────────────────────────────────
    {
      id: cuid("vac-wandelteam"),
      orgSlug: "wij-heemstede",
      title: "Samen bewegen, ontmoeten en natuur beleven — kom jij het WIJ wandelteam versterken?",
      description:
        "In samenwerking met Stichting Gezond Natuur Wandelen brengen we mensen samen " +
        "voor een wandeling door de natuur van Heemstede en omgeving. " +
        "Deze wandelingen worden begeleid door een team van vrijwilligers die lopen met de groepen en koffie en thee zetten.\n\n" +
        "Als wandelteamlid bij WIJ Heemstede:\n" +
        "• Begeleid je wekelijks een groep van 6–10 wandelaars door het Heemsteedse groen\n" +
        "• Help je deelnemers om sociale contacten op te doen en beweging te integreren in hun leven\n" +
        "• Werk je samen met andere enthousiaste vrijwilligers in een hecht team\n\n" +
        "De wandelingen vinden doordeweeks plaats. Je kunt je aanmelden voor 1 of meerdere " +
        "ochtenden per week — volledig naar je eigen mogelijkheden. Je hoeft geen wandelervaring " +
        "te hebben — enthousiasme en een open houding zijn wat telt!\n\n" +
        "Doe jij mee? Meld je aan via info@wijheemstede.nl of neem contact op met " +
        "Mirjam van Vrijwilligerspunt Heemstede, bereikbaar via 023 / 548 5814.",
      location: "Heemstede",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.358,
      lon: 4.619,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Sport & Recreatie", "Natuur & Milieu", "Ouderen"],
      skills: ["Communicatie", "Teamwork", "Coaching / Begeleiding"],
    },

    // ── Schuldhulpmaatje Zuid-Kennemerland ───────────────────────────────
    {
      id: cuid("vac-secretaris"),
      orgSlug: "schuldhulpmaatje-zk",
      title: "Secretaris bij Schuldhulpmaatje Zuid-Kennemerland",
      description:
        "Schuldhulpmaatje Zuid-Kennemerland zoekt een enthousiaste en betrokken secretaris " +
        "voor ons bestuur.\n\n" +
        "Als secretaris ben jij de spil van onze organisatie. Je werkzaamheden bestaan onder andere uit:\n" +
        "• Notuleren van bestuursvergaderingen (circa 6× per jaar)\n" +
        "• Beheren van de ledenadministratie en correspondentie\n" +
        "• Bewaken van actiepunten en besluiten\n" +
        "• Coördineren van communicatie tussen bestuur en coördinatoren\n" +
        "• Ondersteunen bij de organisatie van bijeenkomsten en trainingen\n\n" +
        "Wat wij vragen:\n" +
        "• Affiniteit met financiële problematiek en sociaal werk\n" +
        "• Goede schriftelijke en mondelinge communicatieve vaardigheden\n" +
        "• Gestructureerd, betrouwbaar en discreet\n" +
        "• Enige bestuurservaring is een pré\n\n" +
        "Wij bieden je een zinvolle bestuursfunctie binnen een landelijk actieve organisatie " +
        "met lokale impact. Onkosten worden vergoed.",
      location: "Heemstede",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.36,
      lon: 4.616,
      hours: 4,
      duration: "Doorlopend",
      categories: ["Financieel / Schuldhulp", "Buurt & Gemeenschap"],
      skills: ["Administratie", "Communicatie", "Organisatie", "Financieel advies"],
    },
  ]

  for (const vac of vacancies) {
    const orgId = orgIds[vac.orgSlug]
    if (!orgId) {
      console.warn(`⚠️  Org niet gevonden voor slug: ${vac.orgSlug}`)
      continue
    }

    // Upsert skills and categories for this vacancy
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

    // Delete existing vacancy with same id to allow full re-creation
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
        remote: vac.remote ?? false,
        hours: vac.hours,
        duration: vac.duration,
        imageUrl: (vac as { imageUrl?: string }).imageUrl ?? null,
        status: "ACTIVE",
        organisationId: orgId,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
        categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
      },
    })

    console.log(`✅  Vacature: ${vac.title.slice(0, 60)}...`)
  }

  // ── 6. Stichting Welzijn Heemstede — extra org met 5 vacatures ──────────

  const welzijnAdminUser = await prisma.user.upsert({
    where: { email: "beheerder.welzijn@heemstede-demo.nl" },
    update: {},
    create: {
      id: "org-welzijn-heemstede-demo-admin",
      name: "Beheerder Stichting Welzijn Heemstede",
      email: "beheerder.welzijn@heemstede-demo.nl",
      password: await hashPassword("demo1234"),
      role: "ORGANISATION",
      status: "ACTIVE",
      onboarded: true,
    },
  })

  const welzijnOrg = await prisma.organisation.upsert({
    where: { slug: "stichting-welzijn-heemstede" },
    update: { name: "Stichting Welzijn Heemstede" },
    create: {
      id: "org-welzijn-heemstede-demo",
      name: "Stichting Welzijn Heemstede",
      slug: "stichting-welzijn-heemstede",
      description:
        "Stichting Welzijn Heemstede werkt aan het welzijn en de leefbaarheid van alle " +
        "inwoners van Heemstede. Wij verbinden mensen, organisaties en gemeente om samen " +
        "een warme en betrokken samenleving te bouwen. Onze vrijwilligers vormen het hart " +
        "van onze organisatie.",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.3578,
      lon: 4.6182,
      email: "info@welzijnheemstede.nl",
      website: "https://www.welzijnheemstede.nl",
      status: "APPROVED",
      verifiedAt: new Date(),
      adminId: welzijnAdminUser.id,
      gemeenteId: "gemeente-heemstede",
    },
  })

  await prisma.organisation.update({
    where: { id: welzijnOrg.id },
    data: { gemeenteId: "gemeente-heemstede" },
  })

  for (const catName of ["Buurt & Gemeenschap", "Zorg & Welzijn", "Ouderen"]) {
    const catId = categories[catName]
    if (!catId) continue
    await prisma.orgCategory.upsert({
      where: { organisationId_categoryId: { organisationId: welzijnOrg.id, categoryId: catId } },
      update: {},
      create: { organisationId: welzijnOrg.id, categoryId: catId },
    })
  }

  console.log("✅  Organisatie: Stichting Welzijn Heemstede")

  const welzijnVacancies = [
    {
      id: "vac-welzijn-activiteiten-heemstede-demo",
      title: "Activiteitenbegeleider voor ouderen bij Welzijn Heemstede",
      description:
        "Stichting Welzijn Heemstede organiseert wekelijkse activiteiten voor ouderen in onze " +
        "buurtcentra. Denk aan spelletjesmiddagen, creatieve workshops en gezellige koffie-ochtenden.\n\n" +
        "Als activiteitenbegeleider:\n" +
        "• Begeleid je activiteiten voor groepen van 8–15 ouderen\n" +
        "• Help je deelnemers actief mee te doen en nieuwe mensen te ontmoeten\n" +
        "• Zorg je voor een warme en uitnodigende sfeer\n" +
        "• Werk je samen met andere vrijwilligers en onze professionele coördinatorenteam\n\n" +
        "Tijdsinvestering: 3 uur per week, doordeweeks overdag. " +
        "Wij bieden een introductietraining en begeleiding. Onkosten worden vergoed.",
      location: "Buurtcentrum De Hartekamp, Heemstede",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.3578,
      lon: 4.6182,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Ouderen", "Buurt & Gemeenschap"],
      skills: ["Communicatie", "Coaching / Begeleiding", "Teamwork"],
    },
    {
      id: "vac-welzijn-transport-heemstede-demo",
      title: "Vrijwillig taxichauffeur voor mensen met een beperking",
      description:
        "Heb jij een rijbewijs en een auto, en wil jij mensen met een beperking of ouderen " +
        "helpen om zich te verplaatsen? Dan zoeken wij jou!\n\n" +
        "Als vrijwillig taxichauffeur bij Welzijn Heemstede breng je deelnemers naar afspraken, " +
        "activiteiten of andere bestemmingen die ze anders niet kunnen bereiken. " +
        "Je rijdt met eigen auto; kilometervergoeding wordt uitbetaald.\n\n" +
        "Wat vragen wij:\n" +
        "• Geldig rijbewijs B en eigen auto\n" +
        "• Geduldig en vriendelijk karakter\n" +
        "• Flexibele beschikbaarheid (overdag, minimaal 1× per week)\n\n" +
        "Aanmelden of meer info: info@welzijnheemstede.nl",
      location: "Heemstede en omgeving",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.3578,
      lon: 4.6182,
      hours: 4,
      duration: "Doorlopend",
      categories: ["Ouderen", "Zorg & Welzijn"],
      skills: ["Vervoer / Rijbewijs", "Communicatie"],
    },
    {
      id: "vac-welzijn-leesmaatje-heemstede-demo",
      title: "Leesmaatje voor laaggeletterden in Heemstede",
      description:
        "In Nederland hebben meer dan 2,5 miljoen volwassenen moeite met lezen en schrijven. " +
        "Ook in Heemstede zijn er mensen die hier hulp bij kunnen gebruiken.\n\n" +
        "Als leesmaatje ga je 1-op-1 aan de slag met een volwassene die zijn of haar lees- en " +
        "schrijfvaardigheden wil verbeteren. Je werkt met materiaal dat wij je aanreiken en " +
        "krijgt een gratis training vooraf.\n\n" +
        "Tijdsinvestering: 1,5 uur per week op een zelf in te plannen moment.\n\n" +
        "Geen onderwijservaring nodig — enthousiasme en geduld zijn voldoende!",
      location: "Heemstede (locatie nader te bepalen)",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      hours: 2,
      duration: "Minimaal 6 maanden",
      categories: ["Buurt & Gemeenschap", "Zorg & Welzijn"],
      skills: ["Communicatie", "Coaching / Begeleiding"],
    },
    {
      id: "vac-welzijn-tuinteam-heemstede-demo",
      imageUrl: "/tuinman.png",
      title: "Vrijwilliger gezocht voor ons Tuinteam Heemstede",
      description:
        "Welzijn Heemstede beheert samen met bewoners een aantal gemeenschappelijke tuinen " +
        "in de wijk. Elke twee weken komen we bij elkaar om samen te tuinieren, te oogsten " +
        "en de tuin te onderhouden.\n\n" +
        "Als tuinteamlid:\n" +
        "• Help je mee met onderhoud van perken, moestuinbedden en paden\n" +
        "• Ontmoet je enthousiaste buurtbewoners\n" +
        "• Draag je bij aan een groenere en leefbaardere wijk\n\n" +
        "Tijdsinvestering: 2 uur per twee weken, zaterdagochtend. " +
        "Tuinervaring is welkom maar niet vereist.",
      location: "Gemeenschappelijke tuin Julianalaan, Heemstede",
      city: "Heemstede",
      postcode: "2103",
      lat: 52.362,
      lon: 4.614,
      hours: 1,
      duration: "Doorlopend",
      categories: ["Natuur & Milieu", "Buurt & Gemeenschap"],
      skills: ["Teamwork"],
    },
    {
      id: "vac-welzijn-admin-heemstede-demo",
      imageUrl: "/Administratief.png",
      title: "Administratief ondersteuner voor Welzijn Heemstede (thuiswerk mogelijk)",
      description:
        "Welzijn Heemstede zoekt een vrijwilliger die ons kleine kantoorteam ondersteunt " +
        "bij administratieve taken. Dit kan grotendeels vanuit huis.\n\n" +
        "Takenpakket:\n" +
        "• Verwerken van aanmeldingen voor activiteiten en vrijwilligers\n" +
        "• Bijhouden van contactenlijsten en deelnemersregistratie\n" +
        "• Versturen van uitnodigingen en herinneringen per e-mail\n" +
        "• Ondersteunen bij het opstellen van nieuwsbrieven\n\n" +
        "Wat wij vragen:\n" +
        "• Basiskennis van Word, Excel en e-mail\n" +
        "• Nauwkeurig en betrouwbaar\n" +
        "• Beschikbaar voor 2–3 uur per week\n\n" +
        "Je werkt zoveel mogelijk op eigen tijden. Eén keer per maand een kort overleg op kantoor.",
      location: "Thuiswerk + kantoor Heemstede",
      city: "Heemstede",
      postcode: "2102",
      lat: 52.3578,
      lon: 4.6182,
      remote: true,
      hours: 3,
      duration: "Doorlopend",
      categories: ["Buurt & Gemeenschap"],
      skills: ["Administratie", "Communicatie", "Organisatie"],
    },
  ]

  for (const vac of welzijnVacancies) {
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
        remote: vac.remote ?? false,
        hours: vac.hours,
        duration: vac.duration,
        imageUrl: (vac as { imageUrl?: string }).imageUrl ?? null,
        status: "ACTIVE",
        organisationId: welzijnOrg.id,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
        categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
      },
    })
    console.log(`✅  Vacature: ${vac.title.slice(0, 60)}...`)
  }

  // ── 7. Swipes van de demo vrijwilliger ───────────────────────────────────

  const swipeData = [
    { vacancyId: cuid("vac-gastheer"),      direction: "LIKE",    reason: "Goede zaak" },
    { vacancyId: cuid("vac-wandelteam"),    direction: "LIKE",    reason: "Dichtbij mij" },
    { vacancyId: "vac-welzijn-activiteiten-heemstede-demo", direction: "SUPER_LIKE", reason: "Past bij mijn skills" },
    { vacancyId: "vac-welzijn-transport-heemstede-demo",    direction: "LIKE",       reason: "Flexibele tijden" },
    { vacancyId: cuid("vac-telefonisch"),   direction: "DISLIKE", reason: null },
    { vacancyId: cuid("vac-secretaris"),    direction: "DISLIKE", reason: null },
    { vacancyId: "vac-welzijn-leesmaatje-heemstede-demo",  direction: "LIKE",       reason: "Goede zaak" },
  ]

  for (const s of swipeData) {
    await prisma.swipe.deleteMany({
      where: { fromId: volunteerUser.id, vacancyId: s.vacancyId },
    })
    await prisma.swipe.create({
      data: {
        fromId: volunteerUser.id,
        vacancyId: s.vacancyId,
        direction: s.direction as "LIKE" | "DISLIKE" | "SUPER_LIKE",
        matchReason: s.reason ?? undefined,
      },
    })
  }

  console.log("✅  Swipes aangemaakt")

  // ── 8. Matches ────────────────────────────────────────────────────────────

  // match-1: ACCEPTED — WIJ Eten Samen gastheer
  const match1Id = "match-gastheer-heemstede-demo"
  await prisma.match.deleteMany({ where: { id: match1Id } })
  const match1 = await prisma.match.create({
    data: {
      id: match1Id,
      volunteerId: volunteerUser.id,
      vacancyId: cuid("vac-gastheer"),
      status: "ACCEPTED",
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dagen geleden
    },
  })

  // match-2: ACCEPTED — WIJ Heemstede wandelteam
  const match2Id = "match-wandelteam-heemstede-demo"
  await prisma.match.deleteMany({ where: { id: match2Id } })
  const match2 = await prisma.match.create({
    data: {
      id: match2Id,
      volunteerId: volunteerUser.id,
      vacancyId: cuid("vac-wandelteam"),
      status: "ACCEPTED",
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dagen geleden
    },
  })

  // match-3: PENDING — Welzijn activiteiten
  const match3Id = "match-welzijn-activiteiten-heemstede-demo"
  await prisma.match.deleteMany({ where: { id: match3Id } })
  const match3 = await prisma.match.create({
    data: {
      id: match3Id,
      volunteerId: volunteerUser.id,
      vacancyId: "vac-welzijn-activiteiten-heemstede-demo",
      status: "PENDING",
    },
  })

  // match-4: PENDING — Welzijn transport
  const match4Id = "match-welzijn-transport-heemstede-demo"
  await prisma.match.deleteMany({ where: { id: match4Id } })
  await prisma.match.create({
    data: {
      id: match4Id,
      volunteerId: volunteerUser.id,
      vacancyId: "vac-welzijn-transport-heemstede-demo",
      status: "PENDING",
    },
  })

  console.log("✅  Matches aangemaakt (2× ACCEPTED, 2× PENDING)")

  // ── 9. Gesprekken & berichten ──────────────────────────────────────────────

  const orgWijEtenAdminId = "org-wij-eten-heemstede-demo-admin"
  const orgWijHeemstedeAdminId = "org-wij-heemstede-heemstede-demo-admin"

  // Gesprek 1 — WIJ Eten Samen gastheer (match1)
  const conv1Id = "conv-gastheer-heemstede-demo"
  await prisma.message.deleteMany({ where: { conversationId: conv1Id } })
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: conv1Id } })
  await prisma.conversation.deleteMany({ where: { id: conv1Id } })

  const conv1 = await prisma.conversation.create({
    data: {
      id: conv1Id,
      matchId: match1.id,
      participants: {
        create: [
          { userId: volunteerUser.id },
          { userId: orgWijEtenAdminId },
        ],
      },
    },
  })

  const conv1Messages = [
    {
      senderId: orgWijEtenAdminId,
      content: "Hallo Sam! Wat fijn dat je interesse hebt getoond in onze gastvrouw/gastheer functie bij WIJ Eten Samen. Ik ben Petra, de coördinator. Heb je nog vragen over de rol?",
      offsetDays: -6,
    },
    {
      senderId: volunteerUser.id,
      content: "Hoi Petra! Ja hoor, ik vind het een geweldig initiatief. Ik woon zelf ook in Heemstede en zou me er graag voor inzetten. Elke maandagavond lukt me goed. Is er ook een inwerkperiode?",
      offsetDays: -6,
      offsetHours: 2,
    },
    {
      senderId: orgWijEtenAdminId,
      content: "Top! We hebben altijd een korte introductiebijeenkomst van ongeveer een uur, en daarna loop je twee keer mee met een ervaren vrijwilliger. Kun je aanstaande maandag al langskomen om 17:00 uur?",
      offsetDays: -5,
    },
    {
      senderId: volunteerUser.id,
      content: "Dat klinkt perfect. Maandag om 17:00 uur is helemaal goed voor mij. Welk adres moet ik hebben?",
      offsetDays: -5,
      offsetHours: 1,
    },
    {
      senderId: orgWijEtenAdminId,
      content: "Geweldig! We zitten in het buurtcentrum aan de Raadhuisstraat 22 in Heemstede. Parkeren kan op het plein ervoor. We hebben er zin in! Tot maandag! 😊",
      offsetDays: -5,
      offsetHours: 3,
    },
    {
      senderId: volunteerUser.id,
      content: "Ik ook! Tot maandag.",
      offsetDays: -5,
      offsetHours: 4,
    },
  ]

  for (const msg of conv1Messages) {
    const createdAt = new Date(
      Date.now() + msg.offsetDays * 24 * 60 * 60 * 1000 + (msg.offsetHours ?? 0) * 60 * 60 * 1000,
    )
    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: msg.senderId,
        content: msg.content,
        createdAt,
        updatedAt: createdAt,
      },
    })
  }

  console.log("✅  Gesprek 1 aangemaakt (WIJ Eten Samen — 6 berichten)")

  // Gesprek 2 — WIJ Heemstede wandelteam (match2)
  const conv2Id = "conv-wandelteam-heemstede-demo"
  await prisma.message.deleteMany({ where: { conversationId: conv2Id } })
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: conv2Id } })
  await prisma.conversation.deleteMany({ where: { id: conv2Id } })

  const conv2 = await prisma.conversation.create({
    data: {
      id: conv2Id,
      matchId: match2.id,
      participants: {
        create: [
          { userId: volunteerUser.id },
          { userId: orgWijHeemstedeAdminId },
        ],
      },
    },
  })

  const conv2Messages = [
    {
      senderId: orgWijHeemstedeAdminId,
      content: "Dag Sam! Welkom bij het wandelteam van WIJ Heemstede. Ik ben Mirjam van het Vrijwilligerspunt. Fijn dat je mee wil helpen met de wandelingen!",
      offsetDays: -2,
    },
    {
      senderId: volunteerUser.id,
      content: "Hoi Mirjam! Bedankt voor het welkom. Ik woon vlakbij en wandel zelf graag. Op welke ochtenden zijn de wandelingen precies?",
      offsetDays: -2,
      offsetHours: 1,
    },
    {
      senderId: orgWijHeemstedeAdminId,
      content: "Wij lopen op dinsdag- en donderdagochtend, start om 10:00 bij het parkeerterrein aan de Blekersvaartweg. Gemiddeld 5–6 km, altijd terug voor de lunch. Welke dag past jou het beste?",
      offsetDays: -1,
    },
    {
      senderId: volunteerUser.id,
      content: "Donderdag werkt goed voor mij. Kan ik aanstaande donderdag al meedraaien als kennismaking?",
      offsetDays: -1,
      offsetHours: 2,
    },
    {
      senderId: orgWijHeemstedeAdminId,
      content: "Absoluut! We starten om 10:00 uur. Je hoeft niks mee te nemen, behalve comfortabel schoeisel en een goed humeur. We verheugen ons erop!",
      offsetDays: 0,
      offsetHours: -3,
    },
  ]

  for (const msg of conv2Messages) {
    const createdAt = new Date(
      Date.now() + msg.offsetDays * 24 * 60 * 60 * 1000 + (msg.offsetHours ?? 0) * 60 * 60 * 1000,
    )
    await prisma.message.create({
      data: {
        conversationId: conv2.id,
        senderId: msg.senderId,
        content: msg.content,
        createdAt,
        updatedAt: createdAt,
      },
    })
  }

  console.log("✅  Gesprek 2 aangemaakt (WIJ Heemstede wandelteam — 5 berichten)")

  // ── 10. Handprint data per organisatie ────────────────────────────────────

  const handprints = [
    {
      organisationId: "org-wij-eten-heemstede-demo",
      totaalUrenJaarlijks: 1248,   // 24 vrijwilligers × 52 weken × 1 uur
      maatschappelijkeWaarde: 19194,  // 1248 × €15,38
      sroiWaarde: 80615,             // 19194 × 4,2
      retentieScore: 78,
      aantalActieveMatches: 18,
      aantalAfgerondMatches: 6,
      gemLooptijdMaanden: 14.2,
      sdgScores: { "2": 0.9, "3": 0.7, "10": 0.8, "11": 0.6 },
      dominantMotivatie: "sociaal",
    },
    {
      organisationId: "org-fietsmaatjes-heemstede-demo",
      totaalUrenJaarlijks: 936,    // 18 vrijwilligers × 52 weken × 1 uur
      maatschappelijkeWaarde: 14396,
      sroiWaarde: 60462,
      retentieScore: 85,
      aantalActieveMatches: 15,
      aantalAfgerondMatches: 3,
      gemLooptijdMaanden: 19.5,
      sdgScores: { "3": 0.9, "10": 0.7, "11": 0.5 },
      dominantMotivatie: "sociaal",
    },
    {
      organisationId: "org-wij-heemstede-heemstede-demo",
      totaalUrenJaarlijks: 2080,   // 40 vrijwilligers × 52 weken × 1 uur
      maatschappelijkeWaarde: 31990,
      sroiWaarde: 134360,
      retentieScore: 62,
      aantalActieveMatches: 28,
      aantalAfgerondMatches: 12,
      gemLooptijdMaanden: 9.8,
      sdgScores: { "3": 0.6, "10": 0.8, "11": 0.9, "15": 0.5 },
      dominantMotivatie: "buurt",
    },
    {
      organisationId: "org-schuldhulp-heemstede-demo",
      totaalUrenJaarlijks: 520,    // 10 vrijwilligers × 52 weken × 1 uur
      maatschappelijkeWaarde: 7998,
      sroiWaarde: 33590,
      retentieScore: 44,
      aantalActieveMatches: 8,
      aantalAfgerondMatches: 6,
      gemLooptijdMaanden: 7.1,
      sdgScores: { "1": 0.9, "10": 0.9, "16": 0.6 },
      dominantMotivatie: "waarden",
    },
    {
      organisationId: "org-welzijn-heemstede-demo",
      totaalUrenJaarlijks: 3120,   // 60 vrijwilligers × 52 weken × 1 uur
      maatschappelijkeWaarde: 47986,
      sroiWaarde: 201541,
      retentieScore: 71,
      aantalActieveMatches: 45,
      aantalAfgerondMatches: 15,
      gemLooptijdMaanden: 12.3,
      sdgScores: { "3": 0.8, "4": 0.5, "10": 0.7, "11": 0.8 },
      dominantMotivatie: "sociaal",
    },
  ]

  for (const hp of handprints) {
    await prisma.orgHandprint.upsert({
      where: { organisationId: hp.organisationId },
      update: {
        totaalUrenJaarlijks: hp.totaalUrenJaarlijks,
        maatschappelijkeWaarde: hp.maatschappelijkeWaarde,
        sroiWaarde: hp.sroiWaarde,
        retentieScore: hp.retentieScore,
        aantalActieveMatches: hp.aantalActieveMatches,
        aantalAfgerondMatches: hp.aantalAfgerondMatches,
        gemLooptijdMaanden: hp.gemLooptijdMaanden,
        sdgScores: hp.sdgScores,
        dominantMotivatie: hp.dominantMotivatie,
        laasteBerekening: new Date(),
      },
      create: {
        organisationId: hp.organisationId,
        totaalUrenJaarlijks: hp.totaalUrenJaarlijks,
        maatschappelijkeWaarde: hp.maatschappelijkeWaarde,
        sroiWaarde: hp.sroiWaarde,
        retentieScore: hp.retentieScore,
        aantalActieveMatches: hp.aantalActieveMatches,
        aantalAfgerondMatches: hp.aantalAfgerondMatches,
        gemLooptijdMaanden: hp.gemLooptijdMaanden,
        sdgScores: hp.sdgScores,
        dominantMotivatie: hp.dominantMotivatie,
        isPubliek: true,
        laasteBerekening: new Date(),
      },
    })
  }

  console.log("✅  Handprint data aangemaakt voor 5 organisaties")

  // ── 11. WIJ Eten Samen — volledige demo voor beheerder ─────────────────────

  const wijEtenOrgId   = "org-wij-eten-heemstede-demo"
  const wijEtenAdminId = "org-wij-eten-heemstede-demo-admin"

  // ── 11a. Extra vacatures ──────────────────────────────────────────────────
  const wijEtenExtraVacancies = [
    {
      id: "vac-kok-wij-eten-heemstede-demo",
      title: "Keukenassistent voor onze wekelijkse maaltijd",
      description:
        "Hou jij van koken en mensen blij maken met lekker eten? WIJ Eten Samen zoekt een " +
        "enthousiaste keukenassistent die elke maandagmiddag helpt bij de voorbereiding en " +
        "uitgifte van onze warme maaltijd.\n\n" +
        "Wat ga jij doen:\n" +
        "• Groenten schillen, snijden en de maaltijd helpen bereiden\n" +
        "• Bordjes aanvullen en serveren aan circa 30 gasten\n" +
        "• Afwas en schoonmaak na afloop\n\n" +
        "Tijdsinvestering: elke maandag van 15:00 tot 20:00 uur (5 uur). " +
        "Kookervaring is een pre maar niet verplicht — enthousiasme en hygiëne wel!",
      location: "Buurtcentrum Raadhuisstraat 22, Heemstede",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      hours: 5,
      duration: "Doorlopend",
      categories: ["Ouderen", "Buurt & Gemeenschap"],
      skills: ["Teamwork", "Communicatie"],
    },
    {
      id: "vac-inkoop-wij-eten-heemstede-demo",
      title: "Vrijwilliger inkoop & boodschappen voor WIJ Eten Samen",
      description:
        "Elke week verzorgt WIJ Eten Samen een warme maaltijd voor tientallen gasten. " +
        "Daarvoor zijn we op zoek naar iemand die de wekelijkse boodschappen regelt.\n\n" +
        "Jouw taken:\n" +
        "• Inkopen doen bij lokale supermarkt op basis van ons weekmenu\n" +
        "• Rekeningen bijhouden en kassabonnen inleveren bij de penningmeester\n" +
        "• Incidenteel contact met leveranciers voor grotere bestellingen\n\n" +
        "Tijdsinvestering: circa 2 uur op maandagochtend. " +
        "Rijbewijs en auto zijn een must (kilometervergoeding beschikbaar).",
      location: "Heemstede",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      hours: 2,
      duration: "Doorlopend",
      categories: ["Ouderen", "Buurt & Gemeenschap"],
      skills: ["Organisatie", "Administratie", "Vervoer / Rijbewijs"],
    },
    {
      id: "vac-sociaal-wij-eten-heemstede-demo",
      title: "Maatje voor eenzame gasten bij WIJ Eten Samen",
      description:
        "Sommige gasten van WIJ Eten Samen hebben buiten de maaltijd weinig sociaal contact. " +
        "We zoeken vrijwilligers die af en toe een extra gesprek of een wandeling inplannen " +
        "met deze gasten — gewoon als vriend.\n\n" +
        "Wat dit inhoudt:\n" +
        "• 1 à 2 uur per week buiten de maaltijdavond om\n" +
        "• Koffie drinken, wandelen of een activiteit ondernemen\n" +
        "• Verslag doen aan coördinator (kort, via WhatsApp)\n\n" +
        "Geen speciale opleiding nodig — alleen een open hart en geduld.",
      location: "Heemstede",
      city: "Heemstede",
      postcode: "2101",
      lat: 52.359,
      lon: 4.617,
      hours: 2,
      duration: "Minimaal 6 maanden",
      categories: ["Ouderen", "Zorg & Welzijn", "Buurt & Gemeenschap"],
      skills: ["Communicatie", "Coaching / Begeleiding"],
    },
  ]

  for (const vac of wijEtenExtraVacancies) {
    const skillRecords = await Promise.all(
      vac.skills.map((n) => prisma.skill.upsert({ where: { name: n }, update: {}, create: { name: n } })),
    )
    const categoryRecords = await Promise.all(
      vac.categories.map((n) => prisma.category.upsert({ where: { name: n }, update: {}, create: { name: n } })),
    )
    await prisma.vacancy.deleteMany({ where: { id: vac.id } })
    await prisma.vacancy.create({
      data: {
        id: vac.id,
        title: vac.title,
        description: vac.description,
        location: vac.location,
        city: vac.city,
        postcode: vac.postcode,
        lat: vac.lat,
        lon: vac.lon,
        hours: vac.hours,
        duration: vac.duration,
        status: "ACTIVE",
        organisationId: wijEtenOrgId,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
        categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
      },
    })
    console.log(`✅  Vacature WIJ Eten Samen: ${vac.title.slice(0, 55)}...`)
  }

  // ── 11b. Demo vrijwilligers voor WIJ Eten Samen ───────────────────────────
  const wijEtenVolunteers = [
    {
      id: "vol-linda-wij-eten-demo",
      name: "Linda van den Berg",
      email: "linda.vandenberg@heemstede-demo.nl",
      birthYear: 1972,
      bio: "Ik werk parttime als verpleegkundige en wil in mijn vrije tijd iets betekenen voor de buurt. Eten is voor mij een manier om mensen samen te brengen.",
      availability: JSON.stringify(["monday", "wednesday", "evening"]),
    },
    {
      id: "vol-jaap-wij-eten-demo",
      name: "Jaap Martens",
      email: "jaap.martens@heemstede-demo.nl",
      birthYear: 1963,
      bio: "Gepensioneerd leraar, woon al 30 jaar in Heemstede. Ik hou van koken en gezelligheid en zoek zinvol vrijwilligerswerk in de buurt.",
      availability: JSON.stringify(["monday", "tuesday", "friday", "afternoon"]),
    },
    {
      id: "vol-maria-wij-eten-demo",
      name: "Maria Oosterbeek",
      email: "maria.oosterbeek@heemstede-demo.nl",
      birthYear: 1980,
      bio: "Ik ben moeder van twee kinderen en werk als administratief medewerker. Graag wil ik me inzetten voor mijn omgeving.",
      availability: JSON.stringify(["monday", "thursday", "morning"]),
    },
    {
      id: "vol-thomas-wij-eten-demo",
      name: "Thomas Blom",
      email: "thomas.blom@heemstede-demo.nl",
      birthYear: 1986,
      bio: "Ik woon in Heemstede en ben kok van beroep. Vrijwilligerswerk bij een maaltijdproject past perfect bij mijn passie voor eten en mensen.",
      availability: JSON.stringify(["monday", "weekend", "evening"]),
    },
  ]

  const pw = await hashPassword("demo1234")
  for (const vol of wijEtenVolunteers) {
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
        birthYear: vol.birthYear,
        location: "Heemstede",
        postcode: "2101",
        lat: 52.359,
        lon: 4.617,
        maxDistance: 10,
        availability: vol.availability,
      },
    })
  }
  console.log("✅  4 demo vrijwilligers aangemaakt voor WIJ Eten Samen")

  // ── 11c. Matches in alle statussen ────────────────────────────────────────
  // Linda → gastheer — PENDING (2 dagen geleden)
  const mLindaId = "match-linda-gastheer-wij-eten-demo"
  await prisma.match.deleteMany({ where: { id: mLindaId } })
  await prisma.swipe.deleteMany({ where: { fromId: "vol-linda-wij-eten-demo", vacancyId: cuid("vac-gastheer") } })
  await prisma.swipe.create({ data: { fromId: "vol-linda-wij-eten-demo", vacancyId: cuid("vac-gastheer"), direction: "LIKE", matchReason: "Goede zaak" } })
  await prisma.match.create({
    data: {
      id: mLindaId,
      volunteerId: "vol-linda-wij-eten-demo",
      vacancyId: cuid("vac-gastheer"),
      status: "PENDING",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  // Thomas → kok — PENDING (1 dag geleden)
  const mThomasId = "match-thomas-kok-wij-eten-demo"
  await prisma.match.deleteMany({ where: { id: mThomasId } })
  await prisma.swipe.deleteMany({ where: { fromId: "vol-thomas-wij-eten-demo", vacancyId: "vac-kok-wij-eten-heemstede-demo" } })
  await prisma.swipe.create({ data: { fromId: "vol-thomas-wij-eten-demo", vacancyId: "vac-kok-wij-eten-heemstede-demo", direction: "SUPER_LIKE", matchReason: "Past bij mijn skills" } })
  await prisma.match.create({
    data: {
      id: mThomasId,
      volunteerId: "vol-thomas-wij-eten-demo",
      vacancyId: "vac-kok-wij-eten-heemstede-demo",
      status: "PENDING",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  // Jaap → gastheer — ACCEPTED (14 dagen geleden) + gesprek
  const mJaapId = "match-jaap-gastheer-wij-eten-demo"
  await prisma.match.deleteMany({ where: { id: mJaapId } })
  await prisma.swipe.deleteMany({ where: { fromId: "vol-jaap-wij-eten-demo", vacancyId: cuid("vac-gastheer") } })
  await prisma.swipe.create({ data: { fromId: "vol-jaap-wij-eten-demo", vacancyId: cuid("vac-gastheer"), direction: "LIKE", matchReason: "Dichtbij mij" } })
  const matchJaap = await prisma.match.create({
    data: {
      id: mJaapId,
      volunteerId: "vol-jaap-wij-eten-demo",
      vacancyId: cuid("vac-gastheer"),
      status: "ACCEPTED",
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
  })

  // Maria → telefonisch — REJECTED (10 dagen geleden)
  const mMariaId = "match-maria-telefonisch-wij-eten-demo"
  await prisma.match.deleteMany({ where: { id: mMariaId } })
  await prisma.swipe.deleteMany({ where: { fromId: "vol-maria-wij-eten-demo", vacancyId: cuid("vac-telefonisch") } })
  await prisma.swipe.create({ data: { fromId: "vol-maria-wij-eten-demo", vacancyId: cuid("vac-telefonisch"), direction: "LIKE", matchReason: "Flexibele tijden" } })
  await prisma.match.create({
    data: {
      id: mMariaId,
      volunteerId: "vol-maria-wij-eten-demo",
      vacancyId: cuid("vac-telefonisch"),
      status: "REJECTED",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  })

  console.log("✅  4 matches aangemaakt (2× PENDING, 1× ACCEPTED, 1× REJECTED)")

  // ── 11d. Gesprek Jaap & WIJ Eten Samen ────────────────────────────────────
  const convJaapId = "conv-jaap-gastheer-wij-eten-demo"
  await prisma.message.deleteMany({ where: { conversationId: convJaapId } })
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: convJaapId } })
  await prisma.conversation.deleteMany({ where: { id: convJaapId } })

  await prisma.conversation.create({
    data: {
      id: convJaapId,
      matchId: matchJaap.id,
      participants: {
        create: [
          { userId: "vol-jaap-wij-eten-demo" },
          { userId: wijEtenAdminId },
        ],
      },
    },
  })

  const jaapMessages = [
    { sender: wijEtenAdminId, content: "Hallo Jaap! Wat leuk dat je interesse hebt in de gastheer functie bij WIJ Eten Samen. Ik ben Petra, de coördinator. Kun je me iets meer over jezelf vertellen?", daysAgo: 13 },
    { sender: "vol-jaap-wij-eten-demo", content: "Hoi Petra! Ik ben Jaap, 61 jaar en gepensioneerd leraar. Ik woon al 30 jaar in Heemstede en wil me graag inzetten voor mijn buurt. Maandagavond past me uitstekend.", daysAgo: 13, hoursOffset: 3 },
    { sender: wijEtenAdminId, content: "Wat geweldig! Een leraar die sociaal is — perfect voor onze avonden. Heb je al eerder vrijwilligerswerk gedaan?", daysAgo: 12 },
    { sender: "vol-jaap-wij-eten-demo", content: "Ja, ik heb een paar jaar geholpen bij de voedselbank in Haarlem. Maar nu wil ik iets dichter bij huis doen. Hoeveel gasten komen er gemiddeld per avond?", daysAgo: 12, hoursOffset: 2 },
    { sender: wijEtenAdminId, content: "Gemiddeld 28 à 35 gasten. Het is een hechte groep! We beginnen altijd met een korte briefing om 16:30. Kun jij maandag 3 maart langskomen voor een kennismaking?", daysAgo: 11 },
    { sender: "vol-jaap-wij-eten-demo", content: "Dat kan ik! Ik ben er om 16:30. Moet ik iets meebrengen of dragen?", daysAgo: 10 },
    { sender: wijEtenAdminId, content: "Nee hoor, gewoon comfortabele kleding. We hebben schorten voor iedereen. Fijn dat je erbij bent — we hebben er zin in! 😊", daysAgo: 10, hoursOffset: 1 },
    { sender: "vol-jaap-wij-eten-demo", content: "Top! Ik kijk er naar uit. Tot dan!", daysAgo: 10, hoursOffset: 2 },
    { sender: wijEtenAdminId, content: "Nog even een herinnering: morgen is onze kennismakingsavond! Parkeren kan gratis op het plein aan de Raadhuisstraat. Tot morgen!", daysAgo: 1 },
    { sender: "vol-jaap-wij-eten-demo", content: "Dank je! Ik ben er. Tot morgen 🙂", daysAgo: 1, hoursOffset: 1 },
  ]

  for (const msg of jaapMessages) {
    const createdAt = new Date(Date.now() - msg.daysAgo * 24 * 60 * 60 * 1000 + (msg.hoursOffset ?? 0) * 60 * 60 * 1000)
    await prisma.message.create({
      data: { conversationId: convJaapId, senderId: msg.sender, content: msg.content, createdAt, updatedAt: createdAt },
    })
  }
  console.log("✅  Gesprek Jaap & WIJ Eten Samen aangemaakt (10 berichten)")

  // ── 11e. WIJ Eten Samen SLA + handprint update ────────────────────────────
  await prisma.organisation.update({
    where: { id: wijEtenOrgId },
    data: { avgResponseHours: 18.4, slaScore: 95 },
  })

  await prisma.orgHandprint.upsert({
    where: { organisationId: wijEtenOrgId },
    update: {
      totaalUrenJaarlijks: 1820,
      maatschappelijkeWaarde: 27992,
      sroiWaarde: 117565,
      retentieScore: 82,
      aantalActieveMatches: 24,
      aantalAfgerondMatches: 9,
      gemLooptijdMaanden: 16.8,
      sdgScores: { "2": 0.9, "3": 0.75, "10": 0.85, "11": 0.7 },
      dominantMotivatie: "sociaal",
      laasteBerekening: new Date(),
    },
    create: {
      organisationId: wijEtenOrgId,
      totaalUrenJaarlijks: 1820,
      maatschappelijkeWaarde: 27992,
      sroiWaarde: 117565,
      retentieScore: 82,
      aantalActieveMatches: 24,
      aantalAfgerondMatches: 9,
      gemLooptijdMaanden: 16.8,
      sdgScores: { "2": 0.9, "3": 0.75, "10": 0.85, "11": 0.7 },
      dominantMotivatie: "sociaal",
      isPubliek: true,
      laasteBerekening: new Date(),
    },
  })
  console.log("✅  WIJ Eten Samen SLA & impact bijgewerkt")

  // ── 12. Vrijwilligerspunt beheerder (GEMEENTE_ADMIN) ─────────────────────
  await prisma.user.upsert({
    where: { email: "vrijwilligerspunt@heemstede-demo.nl" },
    update: {},
    create: {
      id: "gemeente-admin-heemstede-demo",
      name: "Vrijwilligerspunt WIJ Heemstede",
      email: "vrijwilligerspunt@heemstede-demo.nl",
      password: await hashPassword("demo1234"),
      role: "GEMEENTE_ADMIN",
      status: "ACTIVE",
      onboarded: true,
      gemeenteSlug: "heemstede",
    } as any,
  })
  console.log("✅  Gemeente admin: vrijwilligerspunt@heemstede-demo.nl  (wachtwoord: demo1234)")

  console.log(`
╔════════════════════════════════════════════════════════════╗
║         WijHeemstede × Vrijwilligersmatch — Klaar!         ║
╠════════════════════════════════════════════════════════════╣
║  Demo vrijwilliger:                                        ║
║    e-mail:    vrijwilliger@heemstede-demo.nl               ║
║    wachtwoord: demo1234                                     ║
╠════════════════════════════════════════════════════════════╣
║  Vrijwilligerspunt (gemeente beheer):                      ║
║    e-mail:    vrijwilligerspunt@heemstede-demo.nl          ║
║    wachtwoord: demo1234                                    ║
║    → /admin (uitstraling, organisaties, groepsbericht)     ║
╠════════════════════════════════════════════════════════════╣
║  Org beheerders (wachtwoord: demo1234):                    ║
║    beheerder.wij-eten@heemstede-demo.nl                    ║
║    beheerder.fietsmaatjes@heemstede-demo.nl                ║
║    beheerder.wij@heemstede-demo.nl                         ║
║    beheerder.schuldhulp@heemstede-demo.nl                  ║
║    beheerder.welzijn@heemstede-demo.nl                     ║
╠════════════════════════════════════════════════════════════╣
║  Subdomain:  heemstede.localhost:3000  (of GEMEENTE_SLUG)  ║
╚════════════════════════════════════════════════════════════╝
`)
}

main()
  .catch((e) => {
    console.error("❌  Seed mislukt:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
