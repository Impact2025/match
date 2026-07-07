export interface FAQItem {
  id: string
  category: "vrijwilligers" | "organisaties" | "matching" | "privacy" | "technisch"
  question: string
  answer: string
}

export const FAQ_ITEMS: FAQItem[] = [
  // Voor vrijwilligers
  {
    id: "v1",
    category: "vrijwilligers",
    question: "Is het platform gratis voor vrijwilligers?",
    answer:
      "Ja, altijd. Vrijwilligers betalen nooit — onder geen enkele voorwaarde. Dat is een principiële keuze, geen marketingslogan. Vrijwilligerswerk is de samenleving die voor zichzelf zorgt. Daar hoort geen prijskaartje aan te hangen.",
  },
  {
    id: "v2",
    category: "vrijwilligers",
    question: "Hoe maak ik een profiel aan?",
    answer:
      "Ga naar 'Aanmelden', kies 'Ik wil vrijwilligerswerk doen' en doorloop de onboarding in vijf stappen. Je vult je beschikbaarheid, interesses en vaardigheden in — en het systeem stelt je een paar motivatievragen. Die nemen twee minuten en zijn de kern van hoe we jou matchen. Geen lange formulieren, geen CV uploaden.",
  },
  {
    id: "v3",
    category: "vrijwilligers",
    question: "Wat is een swipe en hoe gebruik ik het?",
    answer:
      "Swipe rechts als een vacature je aanspreekt, links als niet. Simpel als dat. Ons algoritme toont je de vacatures die het beste bij jouw profiel passen — niet willekeurig, maar op basis van wat jou drijft. Swipe je rechts én de organisatie ook? Dan is het een match en kunnen jullie direct met elkaar in gesprek.",
  },
  {
    id: "v4",
    category: "vrijwilligers",
    question: "Wat gebeurt er na een match?",
    answer:
      "Na een wederzijdse match opent er automatisch een chatvenster. Jullie kunnen direct contact maken, verwachtingen bespreken en afspreken voor een kennismakingsgesprek. Het platform faciliteert de verbinding — de rest doen jullie samen.",
  },
  {
    id: "v5",
    category: "vrijwilligers",
    question: "Kan ik meerdere organisaties tegelijk volgen?",
    answer:
      "Ja. Je kunt met meerdere organisaties matchen en gesprekken voeren. Uiteindelijk kies jij met wie je verdergaat. Er is geen limiet aan het aantal swipes of gesprekken.",
  },
  {
    id: "v6",
    category: "vrijwilligers",
    question: "Hoe pas ik mijn beschikbaarheid of interesses aan?",
    answer:
      "Via 'Mijn profiel' → 'Profiel bewerken'. Aanpassingen worden direct meegenomen in nieuwe matchsuggesties. Als je beschikbaarheid tijdelijk verandert — een vakantie, drukke periode — kun je je account even op pauze zetten zonder dat je alles opnieuw hoeft in te vullen.",
  },
  {
    id: "v7",
    category: "vrijwilligers",
    question: "Kunnen organisaties mijn profiel zien zonder dat ik heb geswiped?",
    answer:
      "Nee. Organisaties zien jouw profiel pas nadat er een wederzijdse match is — jij rechts op hun vacature, zij rechts op jou. Vóór dat moment is jouw profiel niet zichtbaar voor organisaties. Jij houdt de controle.",
  },
  {
    id: "v8",
    category: "vrijwilligers",
    question: "Hoe stop ik met vrijwilligerswerk via het platform?",
    answer:
      "Ga naar je profiel-instellingen en archiveer de betreffende match. Je kunt ook je volledige account deactiveren via 'Instellingen' → 'Account'. Al je data wordt dan conform onze privacyverklaring verwijderd.",
  },

  // Voor organisaties
  {
    id: "o1",
    category: "organisaties",
    question: "Wat zijn de kosten voor organisaties?",
    answer:
      "We werken momenteel met een pilotmodel in samenwerking met gemeenten. Neem contact op via v.munster@weareimpact.nl voor de actuele tarieven en mogelijkheden. Kleine buurtverenigingen en stichtingen krijgen altijd bijzondere aandacht — we geloven in eerlijke toegang voor alle organisaties, ongeacht hun budget.",
  },
  {
    id: "o2",
    category: "organisaties",
    question: "Hoe wordt mijn organisatie geverifieerd?",
    answer:
      "Alle organisaties worden handmatig beoordeeld voordat ze live gaan. We controleren de naam, het KvK-nummer en of de beschreven activiteiten aansluiten bij de missie van het platform. Dit is geen drempel — het is kwaliteitsborging. Gemiddeld duurt verificatie één werkdag.",
  },
  {
    id: "o3",
    category: "organisaties",
    question: "Hoeveel vacatures kan ik tegelijk publiceren?",
    answer:
      "Tijdens de pilot is er een redelijke limiet per organisatie afhankelijk van je abonnement. Contacteer ons als je meer vacatures nodig hebt — we kijken altijd naar wat werkt. Meer vacatures is overigens niet altijd beter: specifieke, goed beschreven rollen trekken betere matches aan.",
  },
  {
    id: "o4",
    category: "organisaties",
    question: "Hoe zie ik welke vrijwilligers geïnteresseerd zijn?",
    answer:
      "Via je organisatiedashboard zie je real-time wie er rechts heeft geswipet op jouw vacatures. Je kunt vervolgens zelf ook rechts swipen om een match te bevestigen. Na de match start het chatgesprek automatisch. Je ziet altijd de matchscore en een samenvatting van het vrijwilligersprofiel.",
  },
  {
    id: "o5",
    category: "organisaties",
    question: "Kan ik meerdere beheerders toevoegen aan mijn organisatieaccount?",
    answer:
      "Dit staat op de roadmap voor Q2 2026. Momenteel is er één beheerderaccount per organisatie. Als dit urgent is, neem dan contact op — we zoeken samen naar een oplossing.",
  },
  {
    id: "o6",
    category: "organisaties",
    question: "Werkt het platform ook voor gemeenten?",
    answer:
      "Absoluut — gemeenten zijn een kernpartner. We bieden een white-label oplossing waarbij het platform onder de gemeentenaam draait, met eigen huisstijlkleuren en branding. Vrijwilligers uit de gemeente zien alleen relevante organisaties en vacatures. Gemeenten krijgen ook toegang tot een uitgebreid impactdashboard met SDG-rapportage en SROI-berekeningen.",
  },
  {
    id: "o7",
    category: "organisaties",
    question: "Hoe exporteer ik onze vrijwilligersdata en matches?",
    answer:
      "Via het organisatiedashboard kun je matched vrijwilligers en gesprekshistorie inzien. Export-functionaliteit (CSV/PDF) is in ontwikkeling. Voor urgente data-exports kan je contact opnemen — we helpen handmatig.",
  },

  // Over matching
  {
    id: "m1",
    category: "matching",
    question: "Hoe werkt het matching-algoritme?",
    answer:
      "Ons algoritme combineert zes lagen: (1) motivatie op basis van het VFI-model en Schwartz-waardentheorie, (2) geografische afstand, (3) vaardigheidsmatch, (4) beschikbaarheid, (5) hoe recent een vacature is, en (6) een eerlijkheidsfactor die voorkomt dat grote organisaties altijd voorgaan op kleine. Motivatie weegt het zwaarst (40%), omdat onderzoek aantoont dat intrinsiek gemotiveerde vrijwilligers langer blijven en meer geven.",
  },
  {
    id: "m2",
    category: "matching",
    question: "Wat is het VFI-model?",
    answer:
      "VFI staat voor Volunteer Functions Inventory, ontwikkeld door onderzoekers Clary & Snyder. Het model beschrijft zes motivatiefuncties: waarden (bijdragen aan iets dat ertoe doet), begrip (leren en groeien), loopbaan (relevante ervaring opdoen), sociaal (contacten en verbinding), beschermend (omgaan met eigen gevoelens), en ego-versterkend (zelfvertrouwen en identiteit). Door te begrijpen waarom iemand vrijwilligerswerk wil doen, kunnen we veel betere matches maken dan alleen op basis van vaardigheden.",
  },
  {
    id: "m3",
    category: "matching",
    question: "Waarom zie ik sommige vacatures niet?",
    answer:
      "Het algoritme filtert proactief op relevantie: afstand, beschikbaarheid en motivatieprofiel bepalen wat je ziet. Vacatures die ver buiten je profiel vallen, worden niet getoond. Dat is bewust — een slimme feed is beter dan een oneindig scroll. Als je denkt dat je te weinig ziet, check dan of je profiel volledig is ingevuld.",
  },
  {
    id: "m4",
    category: "matching",
    question: "Kan ik zelf invloed uitoefenen op mijn matches?",
    answer:
      "Ja. Hoe meer je je profiel invult, hoe beter de suggesties. Je kunt ook direct zoeken naar organisaties of categorieën als je een specifieke voorkeur hebt. Swipe-gedrag wordt niet teruggekoppeld aan het algoritme — elke swipe is dus een schone lei.",
  },
  {
    id: "m5",
    category: "matching",
    question: "Hoe nauwkeurig is het algoritme?",
    answer:
      "We meten continu. In onze pilot-data blijven matches die via het motivatiemodel tot stand kwamen significant langer actief dan traditionele plaatsingen. Het systeem leert op populatieniveau — niet op individueel niveau, want persoonsgegevens worden nooit gebruikt om het algoritme persoonlijk bij te sturen.",
  },

  // Privacy & veiligheid
  {
    id: "p1",
    category: "privacy",
    question: "Wie kan mijn profiel zien?",
    answer:
      "Niemand, totdat er een wederzijdse match is. Vóór een match is je profiel niet zichtbaar voor organisaties. Na een match ziet de organisatie je naam, motivatieprofiel en beschikbaarheid — niet je adres of contactgegevens, tenzij jij die deelt in de chat.",
  },
  {
    id: "p2",
    category: "privacy",
    question: "Zijn jullie AVG-compliant?",
    answer:
      "Ja. We verwerken alleen de persoonsgegevens die nodig zijn voor de dienst, op basis van toestemming of gerechtvaardigd belang. Alle data staat op servers in de EU. We hebben een verwerkersovereenkomst met onze infrastructuurpartners en een volledige privacyverklaring beschikbaar op vrijwilligersmatch.nl/privacy.",
  },
  {
    id: "p3",
    category: "privacy",
    question: "Worden mijn gegevens gedeeld met derden?",
    answer:
      "Nee, nooit voor commerciële doeleinden. We delen geen profieldata met adverteerders, datamakelaars of andere externe partijen. Data wordt uitsluitend gedeeld met matched organisaties, en alleen de informatie die voor de match relevant is.",
  },
  {
    id: "p4",
    category: "privacy",
    question: "Kan ik mijn account en alle data laten verwijderen?",
    answer:
      "Ja. Stuur een verzoek naar v.munster@weareimpact.nl of gebruik de 'Account verwijderen'-optie in je instellingen. Binnen 30 dagen worden alle persoonsgegevens gewist, conform AVG artikel 17 (recht op vergetelheid). Geanonimiseerde statistieken voor impactrapportages blijven bewaard.",
  },
  {
    id: "p5",
    category: "privacy",
    question: "Hoe worden mijn wachtwoord en gegevens beveiligd?",
    answer:
      "Wachtwoorden worden nooit opgeslagen in leesbare vorm — we gebruiken bcrypt hashing met hoge kostfactor. Alle verbindingen zijn versleuteld via HTTPS/TLS. Sessietokens verlopen automatisch. We voeren periodieke beveiligingsreviews uit.",
  },

  // Technisch
  {
    id: "t1",
    category: "technisch",
    question: "Werkt het platform ook op mobiel?",
    answer:
      "Ja, volledig. De interface is mobile-first ontworpen en werkt op alle moderne smartphones en tablets. Er is geen aparte app nodig — de webapp gedraagt zich als een native app op je telefoon. Voeg hem toe aan je beginscherm via 'Voeg toe aan beginscherm' in je browser voor de snelste ervaring.",
  },
  {
    id: "t2",
    category: "technisch",
    question: "Welke browsers worden ondersteund?",
    answer:
      "Alle moderne browsers: Chrome, Firefox, Safari, Edge (laatste twee versies). Internet Explorer wordt niet ondersteund. Voor de beste swipe-ervaring raden we Chrome of Safari op mobiel aan.",
  },
  {
    id: "t3",
    category: "technisch",
    question: "Ik ben mijn wachtwoord vergeten, wat nu?",
    answer:
      "Ga naar de loginpagina en klik op 'Wachtwoord vergeten'. Je ontvangt een resetlink op je e-mailadres. Die link is 1 uur geldig. Check ook je spam-map als je de mail niet ziet. Lukt het nog niet? Stuur een bericht naar v.munster@weareimpact.nl.",
  },
  {
    id: "t4",
    category: "technisch",
    question: "Ik zie een foutmelding — wat moet ik doen?",
    answer:
      "Probeer eerst de pagina te vernieuwen en opnieuw in te loggen. Als het probleem aanhoudt, stuur dan een screenshot en beschrijving naar v.munster@weareimpact.nl. Vermeld je e-mailadres en welke actie je probeerde uit te voeren. We reageren binnen één werkdag.",
  },
  {
    id: "t5",
    category: "technisch",
    question: "Hoe werkt de real-time chat?",
    answer:
      "Chat-berichten worden via Pusher real-time afgeleverd — zonder dat je de pagina hoeft te vernieuwen. Je ziet ook een notificatiebadge in de navigatie als je nieuwe berichten hebt. Berichten worden versleuteld opgeslagen en zijn alleen zichtbaar voor de deelnemers aan het gesprek.",
  },
]
