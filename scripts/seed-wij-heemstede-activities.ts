import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organisation.findUnique({
    where: { id: "org-wij-heemstede-heemstede-demo" },
    select: { id: true, name: true, gemeenteId: true },
  })
  if (!org) { console.error("Organisatie niet gevonden"); return }
  console.log(`Org: ${org.name} (${org.id})`)

  // Categorieën & skills upserten
  const [catBuurt, catWelzijn, catOuderen, catSport] = await Promise.all([
    prisma.category.upsert({ where: { name: "Buurt & Gemeenschap" }, update: {}, create: { name: "Buurt & Gemeenschap" } }),
    prisma.category.upsert({ where: { name: "Zorg & Welzijn" }, update: {}, create: { name: "Zorg & Welzijn" } }),
    prisma.category.upsert({ where: { name: "Ouderen" }, update: {}, create: { name: "Ouderen" } }),
    prisma.category.upsert({ where: { name: "Sport & Recreatie" }, update: {}, create: { name: "Sport & Recreatie" } }),
  ])

  const [skillCommunicatie, skillCoaching, skillSociaal, skillOrg] = await Promise.all([
    prisma.skill.upsert({ where: { name: "Communicatie" }, update: {}, create: { name: "Communicatie" } }),
    prisma.skill.upsert({ where: { name: "Coaching / Begeleiding" }, update: {}, create: { name: "Coaching / Begeleiding" } }),
    prisma.skill.upsert({ where: { name: "Sociale vaardigheden" }, update: {}, create: { name: "Sociale vaardigheden" } }),
    prisma.skill.upsert({ where: { name: "Organiseren" }, update: {}, create: { name: "Organiseren" } }),
  ])

  const now = new Date()
  const d = (daysFromNow: number, h: number, m = 0) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + daysFromNow)
    dt.setHours(h, m, 0, 0)
    return dt
  }

  const dag2datum = d(20, 10).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })

  const activities = [
    {
      title: "Basiscursus Vrijwilligerswerk — dag 1: Jouw rol als vrijwilliger",
      description: `Ben je nieuw als vrijwilliger of wil je je rol beter begrijpen? Deze basiscursus geeft je een stevige basis voor zinvol vrijwilligerswerk in Heemstede.

In dag 1 behandelen we:
• Wat vrijwilligerswerk betekent voor jezelf en voor de samenleving
• Rechten en plichten als vrijwilliger
• Hoe omgaan met verwachtingen — van jou én van de organisatie
• Praktijkvoorbeelden van vrijwilligers in Heemstede

De cursus wordt gegeven door Mirjam van het Vrijwilligerspunt WIJ Heemstede. Deelname is gratis. Er is koffie en thee aanwezig. Je ontvangt na afronding van alle drie de dagen een certificaat.

Dag 2 (communicatie & grenzen stellen) volgt op ${dag2datum}.`,
      type: "CURSUS" as const,
      startDateTime: d(14, 10, 0),
      endDateTime: d(14, 12, 30),
      online: false,
      location: "Wijkcentrum De Hartekamp",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: 18,
      waitlistEnabled: true,
      status: "PUBLISHED" as const,
      categories: [catBuurt.id, catWelzijn.id],
      skills: [skillSociaal.id, skillCommunicatie.id],
    },
    {
      title: "Cursus: Omgaan met eenzaamheid en dementie bij ouderen",
      description: `Veel vrijwilligers werken met ouderen die eenzaam zijn of beginnende dementie hebben. Dit vraagt om specifieke kennis en vaardigheden — en die kun je in deze praktijkcursus opdoen.

Wat je leert:
• Herkennen van signalen van eenzaamheid en dementie
• Hoe je een goed gesprek voert met iemand met dementie
• Omgaan met moeilijke situaties en emoties (ook je eigen)
• Wanneer professionele hulp inschakelen

De cursus wordt gegeven door een gespecialiseerde trainer van Zorgbelang Noord-Holland. Inclusief casusoefeningen en ruimte voor vragen vanuit je eigen praktijk.

Geschikt voor vrijwilligers bij thuiszorg, maaltijdprojecten, bezoekdiensten of buurtteams.`,
      type: "CURSUS" as const,
      startDateTime: d(21, 9, 30),
      endDateTime: d(21, 13, 0),
      online: false,
      location: "Wijkcentrum De Hartekamp",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: 20,
      waitlistEnabled: true,
      status: "PUBLISHED" as const,
      categories: [catOuderen.id, catWelzijn.id],
      skills: [skillCoaching.id, skillCommunicatie.id, skillSociaal.id],
    },
    {
      title: "Online cursus: Grenzen stellen als vrijwilliger",
      description: `Vrijwilligerswerk geeft voldoening — maar het is ook belangrijk dat je goed voor jezelf blijft zorgen. In deze online cursus leer je hoe je gezonde grenzen stelt zonder je schuldig te voelen.

Onderwerpen:
• Waarom grenzen stellen soms zo moeilijk is
• Signalen dat je over je eigen grenzen gaat
• Praktische technieken om nee te zeggen
• Gesprekken voeren met coördinatoren of deelnemers over je grenzen

De cursus duurt 90 minuten via Zoom. Je ontvangt van tevoren een link. Deelnemers kunnen vooraf vragen insturen — die worden geanonimiseerd beantwoord.`,
      type: "CURSUS" as const,
      startDateTime: d(28, 19, 30),
      endDateTime: d(28, 21, 0),
      online: true,
      meetUrl: "https://zoom.us/j/heemstede-vrijwilligers",
      maxCapacity: 40,
      waitlistEnabled: false,
      status: "PUBLISHED" as const,
      categories: [catWelzijn.id, catBuurt.id],
      skills: [skillCommunicatie.id, skillSociaal.id],
    },
    {
      title: "Netwerkbijeenkomst Vrijwilligers Heemstede — Voorjaarseditie",
      description: `Twee keer per jaar brengt WIJ Heemstede alle vrijwilligers in de gemeente samen voor een gezellige en inspirerende bijeenkomst. Dit is de voorjaarseditie!

Programma:
17:00 — Inloop met borrel en hapjes
17:30 — Welkomstwoord wethouder Sociaal Domein
17:45 — Korte presentaties door 3 vrijwilligers ("Waarom doe ik het")
18:30 — Ronde tafels per thema (ouderen / armoede / buurt / sport)
19:30 — Informeel netwerken en afsluiting

Voor wie:
Alle vrijwilligers in Heemstede zijn van harte welkom, ongeacht bij welke organisatie je actief bent. Breng gerust een collega-vrijwilliger mee!

Aanmelden is verplicht i.v.m. catering. Er zijn beperkte plaatsen.`,
      type: "BIJEENKOMST" as const,
      startDateTime: d(10, 17, 0),
      endDateTime: d(10, 19, 30),
      online: false,
      location: "Gemeentehuis Heemstede",
      address: "Raadhuisplein 1",
      city: "Heemstede",
      postcode: "2101 GH",
      maxCapacity: 80,
      waitlistEnabled: true,
      status: "PUBLISHED" as const,
      categories: [catBuurt.id, catWelzijn.id, catSport.id],
      skills: [skillSociaal.id, skillOrg.id],
    },
    {
      title: "Inloopspreekuur: word vrijwilliger in Heemstede",
      description: `Wil je vrijwilliger worden maar weet je nog niet waar beginnen? Kom langs bij ons wekelijkse inloopspreekuur!

Elke dinsdagochtend zijn medewerkers van het Vrijwilligerspunt WIJ Heemstede aanwezig om je:
• Meer te vertellen over vrijwilligerswerk in Heemstede
• Te helpen bij het vinden van een geschikte plek
• Voor te stellen aan organisaties die zoeken naar jouw talenten
• Vragen te beantwoorden over rechten, onkostenvergoeding, etc.

Geen afspraak nodig — gewoon binnenlopen! Koffie staat klaar.`,
      type: "INLOOPSPREEKUUR" as const,
      startDateTime: d(7, 10, 0),
      endDateTime: d(7, 12, 0),
      online: false,
      location: "Vrijwilligerspunt WIJ Heemstede",
      address: "Hartekampweg 30",
      city: "Heemstede",
      postcode: "2106 AZ",
      maxCapacity: undefined,
      waitlistEnabled: false,
      status: "PUBLISHED" as const,
      categories: [catBuurt.id],
      skills: [skillSociaal.id],
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
        categories: { create: categories.map((id) => ({ categoryId: id })) },
        skills: { create: skills.map((id) => ({ skillId: id })) },
      },
    })
    created++
    console.log(`✓ ${act.title.slice(0, 70)}`)
  }

  console.log(`\n${created} activiteiten aangemaakt voor ${org.name}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
