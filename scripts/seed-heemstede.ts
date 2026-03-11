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
        status: "ACTIVE",
        organisationId: orgId,
        skills: { create: skillRecords.map((s) => ({ skillId: s.id })) },
        categories: { create: categoryRecords.map((c) => ({ categoryId: c.id })) },
      },
    })

    console.log(`✅  Vacature: ${vac.title.slice(0, 60)}...`)
  }

  // ── 6. Summary ───────────────────────────────────────────────────────────

  console.log(`
╔════════════════════════════════════════════════════════════╗
║         WijHeemstede × Vrijwilligersmatch — Klaar!         ║
╠════════════════════════════════════════════════════════════╣
║  Demo vrijwilliger:                                        ║
║    e-mail:    vrijwilliger@heemstede-demo.nl               ║
║    wachtwoord: demo1234                                    ║
╠════════════════════════════════════════════════════════════╣
║  Org beheerders (wachtwoord: demo1234):                    ║
║    beheerder.wij-eten@heemstede-demo.nl                    ║
║    beheerder.fietsmaatjes@heemstede-demo.nl                ║
║    beheerder.wij@heemstede-demo.nl                         ║
║    beheerder.schuldhulp@heemstede-demo.nl                  ║
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
