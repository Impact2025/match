import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Zoek de gebruiker + organisatie
  const user = await prisma.user.findUnique({
    where: { email: "beheerder.wij-eten@heemstede-demo.nl" },
    select: { id: true, name: true }
  })
  if (!user) { console.error("Gebruiker niet gevonden"); return }

  const org = await prisma.organisation.findUnique({
    where: { adminId: user.id },
    select: { id: true, name: true, gemeenteId: true }
  })
  if (!org) { console.error("Organisatie niet gevonden"); return }

  console.log(`Org: ${org.name} (${org.id}), gemeente: ${org.gemeenteId}`)

  // Haal/maak categorieën & skills
  const [catSamen, catWelzijn, catKoken, catNatuur] = await Promise.all([
    prisma.category.upsert({ where: { name: "Samen & Verbinding" }, update: {}, create: { name: "Samen & Verbinding" } }),
    prisma.category.upsert({ where: { name: "Welzijn & Zorg" }, update: {}, create: { name: "Welzijn & Zorg" } }),
    prisma.category.upsert({ where: { name: "Koken & Voedsel" }, update: {}, create: { name: "Koken & Voedsel" } }),
    prisma.category.upsert({ where: { name: "Natuur & Buiten" }, update: {}, create: { name: "Natuur & Buiten" } }),
  ])

  const [skillKoken, skillOrg, skillSociaal] = await Promise.all([
    prisma.skill.upsert({ where: { name: "Koken" }, update: {}, create: { name: "Koken" } }),
    prisma.skill.upsert({ where: { name: "Organiseren" }, update: {}, create: { name: "Organiseren" } }),
    prisma.skill.upsert({ where: { name: "Sociale vaardigheden" }, update: {}, create: { name: "Sociale vaardigheden" } }),
  ])

  const now = new Date()
  const d = (daysFromNow: number, h: number, m = 0) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + daysFromNow)
    dt.setHours(h, m, 0, 0)
    return dt
  }

  const activities = [
    {
      title: "Buurtmaaltijd Heemstede",
      description: "Kom gezellig mee-eten bij onze maandelijkse buurtmaaltijd! We koken samen een heerlijk driegangenmenu en leren nieuwe mensen kennen uit de buurt. Iedereen is welkom — of je nu alleen woont of gewoon zin hebt in gezelligheid.",
      type: "EVENEMENT",
      startDateTime: d(5, 17, 30),
      endDateTime: d(5, 20, 30),
      online: false,
      location: "Wijkcentrum De Hartekamp",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: 30,
      waitlistEnabled: true,
      status: "PUBLISHED",
      categories: [catSamen.id, catKoken.id],
      skills: [skillKoken.id, skillSociaal.id],
    },
    {
      title: "Workshop: Gezond koken op budget",
      description: "In deze praktische workshop leer je voedzame en lekkere maaltijden koken voor weinig geld. Onze ervaren kok deelt recepten, tips voor slim boodschappen doen en we koken samen. Aan het einde eet je wat je hebt gemaakt!",
      type: "WORKSHOP",
      startDateTime: d(12, 10, 0),
      endDateTime: d(12, 13, 0),
      online: false,
      location: "Wijkcentrum De Hartekamp",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: 16,
      waitlistEnabled: true,
      status: "PUBLISHED",
      categories: [catKoken.id, catWelzijn.id],
      skills: [skillKoken.id],
    },
    {
      title: "Online informatiebijeenkomst: vrijwilligerswerk bij WIJ Eten",
      description: "Wil je vrijwilliger worden bij WIJ Eten maar weet je nog niet precies hoe? In deze korte online sessie vertellen we over de mogelijkheden, jouw rol als vrijwilliger en hoe je je kunt aanmelden. Stel al je vragen!",
      type: "BIJEENKOMST",
      startDateTime: d(8, 19, 30),
      endDateTime: d(8, 20, 30),
      online: true,
      meetUrl: "https://meet.google.com/heemstede-demo",
      maxCapacity: 50,
      waitlistEnabled: false,
      status: "PUBLISHED",
      categories: [catSamen.id],
      skills: [skillSociaal.id, skillOrg.id],
    },
    {
      title: "Moestuin dag — samen planten en oogsten",
      description: "We werken samen in de moestuin van het wijkcentrum. Leer alles over groenten kweken, composteren en duurzaam tuinieren. Ideaal voor gezinnen, kinderen zijn ook van harte welkom! Neem je eigen handschoenen mee.",
      type: "EVENEMENT",
      startDateTime: d(19, 9, 30),
      endDateTime: d(19, 14, 0),
      online: false,
      location: "Moestuin Wijkcentrum",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: 20,
      waitlistEnabled: true,
      status: "PUBLISHED",
      categories: [catNatuur.id, catSamen.id],
      skills: [skillOrg.id, skillSociaal.id],
    },
  ]

  let created = 0
  for (const act of activities) {
    const { categories, skills, ...data } = act
    await prisma.groupActivity.create({
      data: {
        ...data,
        organisationId: org.id,
        gemeenteId: org.gemeenteId ?? null,
        categories: { create: categories.map(id => ({ categoryId: id })) },
        skills: { create: skills.map(id => ({ skillId: id })) },
      }
    })
    created++
    console.log(`✓ ${act.title}`)
  }

  console.log(`\n${created} activiteiten aangemaakt voor ${org.name}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
