// Kennisbank artikelen (Functioneel / How-to / Navigational)
import type { ContentSeed } from "./blog"

export const KB: ContentSeed[] = [
  {
    type: "KB",
    slug: "white-label-gemeente-configureren",
    title: "White-label omgeving configureren voor je gemeente",
    excerpt:
      "Stap voor stap de URL-slug, logo, favicon en het kleurenpalet van je gemeentelijke omgeving instellen op basis van het WijHeemstede-framework.",
    metaTitle: "White-label platform instellen gemeente | Kennisbank",
    metaDescription:
      "Hoe je de white-label omgeving voor je gemeente configureert: slug, logo, favicon, kleuren. WijHeemstede-framework. Vrijwilligersmatch kennisbank.",
    keywords: [
      "white-label vrijwilligersplatform instellen",
      "gemeente white-label configureren",
      "vrijwilligersplatform huisstijl",
    ],
    tags: ["gemeente", "configuratie", "how-to"],
    relatedSlugs: ["ai-rapportages-analyseren-sam", "gemeentelijke-handprint-sroi", "multi-tenant-burgerplatform"],
    publishedAt: "2026-01-15",
    readingTime: 6,
    html: `<p>Met de white-label module geef je je gemeentelijke omgeving een eigen identiteit binnen de gedeelde Vrijwilligersmatch-infrastructuur. Inwoners zien jouw merk, niet het onze. Dit artikel loopt stap voor stap door de configuratie, gebaseerd op het WijHeemstede-framework dat we voor de gelijknamige gemeente ontwikkelden.</p>

<h2>Stap 1: de URL-slug instellen</h2>
<p>Elke gemeente krijgt een eigen slug, bijvoorbeeld <code>heemstede</code> of <code>haarlem</code>. Deze verschijnt in de URL en bepaalt de routing naar jouw omgeving. Kies een korte, herkenbare naam zonder spaties. De slug is eenmalig en bepaalt hoe inwoners je platform vinden, dus neem even de tijd.</p>

<h2>Stap 2: logo en favicon uploaden</h2>
<p>Upload je gemeentelogo en favicon via de beheeromgeving. Het favicon wordt getoond in de browserbalk en bij het delen van pagina's. Zorg voor een transparante PNG met voldoende resolutie, bij voorkeur 512x512 pixels. Een scherp logo op de login-pagina verhoogt het vertrouwen van inwoners direct.</p>

<h2>Stap 3: het kleurenpalet kiezen</h2>
<p>Stel je <code>primaryColor</code> en <code>accentColor</code> in. De primary color bepaalt buttons en actieve staten, de accent color zorgt voor gradienten en hover-effecten. WijHeemstede werkt met een paars accent dat de rust en verbondenheid van de gemeente uitstraalt. Kies kleuren die aansluiten op je bestaande huisstijl, dan herkennen inwoners de omgeving meteen als die van hun gemeente.</p>

<h2>Stap 4: welkomstteksten en hero-image</h2>
<p>Vul de <code>welcomeTitle</code> en <code>welcomeMessage</code> in. Deze teksten verschijnen tijdens het onboarden van nieuwe vrijwilligers. Een warme hero-image op de homepage versterkt het lokale gevoel en verlaagt de drempel om te beginnen. Gebruik bij voorkeur een foto van echte lokale vrijwilligers in plaats van stockfotografie.</p>

<h2>Stap 5: contactgegevens en sociale links</h2>
<p>Voeg je contact-e-mail, telefoon en adres toe, plus de sociale links (Facebook, Instagram, LinkedIn). Deze worden gebruikt in e-mails en op de footer van je omgeving. Zo blijft de communicatie herkenbaar en bereikbaar voor wie vastloopt.</p>

<h2>Stap 6: publiceren en testen</h2>
<p>Na het opslaan is je omgeving live. Test de swipe-ervaring en de aanmeld-flow als een inwoner. Controleer of je huisstijl overal consistent wordt getoond, van de login tot de bevestigingsmail. Pas daarna de omgeving breed aan te kondigen.</p>

<p>Klaar met de basis? <a href="/kennisbank/ai-rapportages-analyseren-sam">Leer dan hoe Sam je dashboards analyseert</a> of <a href="/kennisbank/gemeentelijke-handprint-sroi">hoe de handprint je SROI berekent</a>. Meer over de strategie lees je op <a href="https://www.movisie.nl" target="_blank" rel="noopener">Movisie.nl</a>, het kennisinstituut voor sociale vraagstukken.</p>`,
  },
  {
    type: "KB",
    slug: "ai-rapportages-analyseren-sam",
    title: "AI-rapportages analyseren met assistent Sam",
    excerpt:
      "Hoe gemeente-coördinatoren de AI-assistent Sam gebruiken om via dashboards trends, tekorten en rapportages te genereren.",
    metaTitle: "Trends analyseren gemeente Sam | Kennisbank",
    metaDescription:
      "AI-assistent Sam analyseert je gemeente-dashboards: trends, tekorten en kant-en-klare rapportages. Handleiding Vrijwilligersmatch kennisbank.",
    keywords: [
      "vrijwilligers trends analyseren gemeente",
      "AI rapportage gemeente",
      "dashboard vrijwilligerswerk",
    ],
    tags: ["gemeente", "AI", "analytics"],
    relatedSlugs: ["white-label-gemeente-configureren", "gemeentelijke-handprint-sroi", "ai-assistenten-vera-sam"],
    publishedAt: "2026-03-10",
    readingTime: 6,
    html: `<p>Sam is de AI-assistent voor gemeente-coördinatoren. Waar Vera schrijft voor organisaties, analyseert Sam de gegevens van jouw hele gemeente. Dit artikel laat zien hoe je Sam gebruikt voor trends, tekorten en rapportages, zonder dat je zelf door exports hoeft te worstelen.</p>

<h2>Toegang tot het dashboard</h2>
<p>Log in als gemeente-admin en open het dashboard. Sam leest automatisch de datalaag van alle aangesloten organisaties: aantallen vrijwilligers, matches, retentie en SROI per wijk. Omdat de data centraal staat, hoef je niet langer losse Excelbestanden van organisaties te verzamelen.</p>

<h2>Trends herkennen</h2>
<p>Vraag Sam naar ontwikkelingen: "Welke wijk loopt achter op retentie?" of "Hoe ontwikkelt het aantal matches zich dit kwartaal?" Sam geeft een heldere samenvatting met de belangrijkste uitschieters, gebaseerd op de werkelijke data uit je omgeving. Zo zie je in seconden wat een handmatige analyse dagen zou kosten.</p>

<h2>Tekorten signaleren</h2>
<p>Sam signaleert waar de vraag naar vrijwilligers de aanwas overstijgt. Die signalen kun je direct vertalen naar een wervingsactie in de betreffende wijk. Zo word je proactief in plaats van reactief, en voorkom je dat een tekort ongemerkt uitgroeit tot een wachtlijst voor kwetsbare inwoners.</p>

<h2>Rapportages genereren</h2>
<p>Met één opdracht genereert Sam een rapportage die je kunt delen met de wethouder of het college. Geen nachten Excel meer. De rapportage bevat retentie, SROI en SDG-scores, gekoppeld aan de OrgHandprint van je gemeente. Het taalgebruik is afgestemd op bestuurders: helder, onderbouwd en actiegericht.</p>

<h2>Best practices</h2>
<p>Stel Sam scherpe, concrete vragen. Hoe specifieker de vraag, hoe bruikbaarder het antwoord. En controleer altijd de onderliggende cijfers in het dashboard, Sam is een assistent, geen vervanging van jouw oordeel. Gebruik Sam om de cijfers te duiden, niet om ze blind te volgen.</p>

<p>Meer over de onderliggende berekening? <a href="/kennisbank/gemeentelijke-handprint-sroi">Lees over de handprint en SROI</a>. Achtergrond over lokale cijfers vind je bij het <a href="https://www.cbs.nl" target="_blank" rel="noopener">Centraal Bureau voor de Statistiek</a>.</p>`,
  },
  {
    type: "KB",
    slug: "gemeentelijke-handprint-sroi",
    title: "De opbouw van de gemeentelijke handprint en SROI",
    excerpt:
      "Technische en functionele uitleg over hoe de OrgHandprint-module nachtelijk de maatschappelijke waarde herberekent met de SROI-factor van 4,2x en SDG-scores.",
    metaTitle: "SROI score berekenen kennisbank | Vrijwilligersmatch",
    metaDescription:
      "Hoe de OrgHandprint nachtelijk SROI met factor 4,2x en SDG-scores berekent. Technische uitleg Vrijwilligersmatch kennisbank.",
    keywords: [
      "SROI score vrijwilligerswerk berekenen",
      "maatschappelijke waarde berekenen",
      "OrgHandprint uitleg",
    ],
    tags: ["impact", "SROI", "gemeente"],
    relatedSlugs: ["white-label-gemeente-configureren", "ai-rapportages-analyseren-sam", "sroi-4-2x-sturingsinstrument"],
    publishedAt: "2026-04-20",
    readingTime: 7,
    html: `<p>De OrgHandprint is de motor achter de maatschappelijke verantwoording in Vrijwilligersmatch. Dit artikel legt technisch en functioneel uit hoe de module werkt, zodat gemeente-coördinatoren precies weten wat er achter hun dashboard zit.</p>

<h2>Wat de handprint meet</h2>
<p>Per organisatie berekent de handprint: totaal uren per jaar, maatschappelijke waarde (vervangingswaarde in euro's), SROI-waarde, retentiescore, aantal actieve en afgeronde matches, gemiddelde looptijd en SDG-scores. Deze gegevens vormen samen de "handprint" van een organisatie: de positieve voetafdruk die zij achterlaat in de samenleving.</p>

<h2>De SROI-factor van 4,2x</h2>
<p>De SROI-waarde vermenigvuldigt de vervangingswaarde met een factor van 4,2x. Die factor volgt de MKBA-systematiek van het Rijk en VWS: vermeden zorgkosten plus hogere kwaliteit van leven plus minder belasting van mantelzorgers. Hij is bewust conservatief gekozen, zodat je nooit te rooskleurig rapporteert aan de raad. Nederlandse SROI-studies op buurtniveau zitten doorgaans tussen de 1,5 en 6 euro per geïnvesteerde euro.</p>

<h2>SDG-scores</h2>
<p>Bovenop de euro's berekent de handprint SDG-scores: een JSON-map van bijdragen aan de duurzame ontwikkelingsdoelen. Zo koppel je lokale inzet aan mondiale agenda's en kun je laten zien hoe jouw gemeente bijdraagt aan doelen als goede gezondheid en ongelijkheid verminderen.</p>

<h2>Nachtelijke herberekening</h2>
<p>Een cron-job draait elke nacht om 02:00 uur (zie vercel.json) en herberekent alle handprints. Daardoor zie je altijd de meest actuele stand, zonder handmatige exports. De GemeenteDashboard-cache wordt eveneens bijgewerkt met totaal vrijwilligers, uren, waarde en gemiddelde retentie. Die cache voorkomt dat het dashboard traag wordt bij veel organisaties.</p>

<h2>Waarom dit belangrijk is</h2>
<p>Gemeenten kunnen hiermee sturen in plaats van alleen verantwoorden. Een dip in retentie of SROI is direct zichtbaar en vraagt om actie. Zo wordt impact een stuurinstrument in plaats van een jaarlijks verhaal. De systematiek volgt de <a href="https://www.rijksoverheid.nl" target="_blank" rel="noopener">Werkwijzer kosten-batenanalyse sociaal domein</a> van Rijk en VWS.</p>

<p>Zie ook het blog <a href="/blog/sroi-4-2x-sturingsinstrument">over SROI 4,2x als sturingsinstrument</a> en <a href="/blog/sroi-vrijwilligerswerk-berekenen">de basis van SROI berekenen</a>.</p>`,
  },
  {
    type: "KB",
    slug: "vacatures-optimaliseren-vera",
    title: "Vacatures optimaliseren met AI-assistent Vera",
    excerpt:
      "Handleiding voor organisaties om Vera te gebruiken voor het automatisch verrijken van organisatiebeschrijvingen en het aantrekkelijk maken van vacatures.",
    metaTitle: "Vacature schrijven met AI Vera | Kennisbank",
    metaDescription:
      "Hoe organisaties Vera gebruiken om vacatures en beschrijvingen te verrijken. Stap-voor-stap handleiding Vrijwilligersmatch kennisbank.",
    keywords: [
      "vrijwilligers vacature schrijven met AI",
      "vacature optimaliseren vrijwilligers",
      "Vera AI assistent",
    ],
    tags: ["organisatie", "AI", "how-to"],
    relatedSlugs: ["ai-rapportages-analyseren-sam", "match-lifecycle-swipe-bevestiging", "groepsactiviteiten-qr-checkin"],
    publishedAt: "2026-06-02",
    readingTime: 6,
    html: `<p>Vera is de AI-assistent voor organisaties binnen Vrijwilligersmatch. Vera helpt je om vacatures en organisatiebeschrijvingen aantrekkelijker en beter matchbaar te maken. Zo werkt het, van ruwe input tot gepubliceerde vacature.</p>

<h2>Stap 1: open Vera in je organisatie-omgeving</h2>
<p>Als organisatie-admin vind je Vera in het dashboard. Kies "Vacature verrijken" of "Beschrijving verbeteren". Vera werkt binnen de beveiligde omgeving van je organisatie, dus gegevens verlaten het platform niet ongecontroleerd.</p>

<h2>Stap 2: de kerninformatie invoeren</h2>
<p>Geef Vera de ruwe informatie: wat vraag je, waar, hoe vaak, en welke motivatie past erbij. Vera trekt de motivatie-profielen erbij om de toon te bepalen. Hoe meer context je geeft, hoe beter het resultaat.</p>

<h2>Stap 3: Vera genereert en verrijkt</h2>
<p>Vera levert een leesbare, wervende vacature die aansluit op wat vrijwilligers beweegt. Ze gebruikt de juiste balans tussen informatie en uitnodiging, en vermijdt de muur van tekst die jonge vrijwilligers afschrikt. Ook je organisatiebeschrijving wordt helderder, zodat vrijwilligers direct begrijpen wie je bent.</p>

<h2>Stap 4: controleren en publiceren</h2>
<p>Lees de tekst na, pas waar nodig aan, en publiceer. De vacature verschijnt direct in de swipe-ervaring van vrijwilligers die daarop matchen. Je behoudt altijd de eindredactie, Vera schrijft niet namens je organisatie zonder dat jij het ziet.</p>

<h2>Waarom dit werkt</h2>
<p>Onderzoek toont dat AI-gestuurde content de administratieve taak voor coördinatoren met 30 tot 50 procent verlaagt. Meer tijd voor contact, minder tijd voor formulieren. Tegelijk stijgt de kwaliteit van de vacature, wat de match verbetert. Meer over motivatiematching lees je bij het <a href="https://www.movisie.nl" target="_blank" rel="noopener">kennisinstituut Movisie</a>.</p>

<h2>Tips voor een scherpe vacature</h2>
<p>Vraag in de vacature expliciet naar motivatie, niet alleen naar beschikbaarheid. Noem concreet wat de vrijwilliger terugkrijgt: nieuwe vaardigheden, contact, of bijdrage aan de buurt. En houd de tekst kort: wie de muur van tekst niet leest, swipet door naar de volgende. Vera helpt je die balans te vinden, maar de eindredactie blijft van de organisatie.</p>

<p>Daarnaast helpt een scherpe vacature bij de match: <a href="/kennisbank/match-lifecycle-swipe-bevestiging">lees over de match-lifecycle</a> en <a href="/blog/psychometrie-schwartz-waardenprofiel">waarom motivatiematching retentie verhoogt</a>.</p>`,
  },
  {
    type: "KB",
    slug: "groepsactiviteiten-qr-checkin",
    title: "Groepsactiviteiten en QR-code check-in beheren",
    excerpt:
      "Hoe je een workshop of inloopspreekuur opzet, hoe het automatische wachtlijstbeheer werkt, en hoe je de QR-codes scant voor fysieke self-check-in.",
    metaTitle: "Aanwezigheid QR-check-in kennisbank | Vrijwilligersmatch",
    metaDescription:
      "Groepsactiviteiten opzetten, wachtlijstbeheer en QR-check-in in Vrijwilligersmatch. Stap-voor-stap handleiding kennisbank.",
    keywords: [
      "aanwezigheidsregistratie vrijwilligers evenement",
      "QR check-in vrijwilligers",
      "groepsactiviteiten beheren",
    ],
    tags: ["organisatie", "activiteiten", "how-to"],
    relatedSlugs: ["vacatures-optimaliseren-vera", "match-lifecycle-swipe-bevestiging", "vrijwilligers-behouden-retentietracking"],
    publishedAt: "2026-09-14",
    readingTime: 7,
    html: `<p>Met groepsactiviteiten breng je vrijwilligers samen in workshops, cursussen, bijeenkomsten, evenementen of inloopspreekuren. Dit artikel behandelt het opzetten, het wachtlijstbeheer en de QR-check-in, zodat je geen papieren lijsten meer hoeft af te vinken.</p>

<h2>Stap 1: een activiteit aanmaken</h2>
<p>Kies het type (bijeenkomst, workshop, cursus, evenement of inloopspreekuur), vul tijd, locatie en capaciteit in. Een uniek QR-token wordt automatisch gegenereerd. Bij een inloopspreekuur zet je de capaciteit ruimer, bij een workshop strakker om de kwaliteit te bewaken.</p>

<h2>Stap 2: wachtlijstbeheer</h2>
<p>Zodra de maximale capaciteit is bereikt, schakelt het systeem automatisch de wachtlijst in. Vrijwilligers die zich daarna aanmelden, komen op de wachtlijst. Valt iemand uit, dan schuift de eerstvolgende automatisch door. Geen handmatig bellen meer, en geen teleurgestelde deelnemers die niet weten waar ze aan toe zijn. Het systeem stuurt hen een bericht zodra er plek is.</p>

<h2>Stap 3: QR self-check-in</h2>
<p>Op de dag zelf toon je de QR-code aan de deur. Vrijwilligers scannen met hun telefoon en checken zichzelf in. De aanwezigheid wordt geregistreerd in <code>checkedInAt</code>. Handmatig afvinken op papier behoort tot het verleden. De organisator ziet live wie er aanwezig is, handig voor verzekering en verantwoording.</p>

<h2>Stap 4: feedback en rapportage</h2>
<p>Na afloop kunnen deelnemers feedback geven en rating geven (1-5 sterren). Die data voedt de retentie- en impactcijfers van je organisatie. Een hoge rating is een signaal om de activiteit te herhalen, een lage rating een aanleiding om bij te sturen.</p>

<h2>Waarom dit telt</h2>
<p>Aanwezigheid is de eerste stap in retentie. Wie eenmaal fysiek is geweest, blijft vaker hangen. De QR-check-in maakt die eerste stap moeiteloos. Onderzoek naar vrijwilligersbehoud benadrukt dat laagdrempelige deelname de belangrijkste beschermende factor is tegen uitval. Meer inzicht vind je bij <a href="https://www.cbs.nl" target="_blank" rel="noopener">CBS</a> over vrijwilligerswerk in Nederland.</p>

<h2>Veelgemaakte fouten</h2>
<p>De meest voorkomende fout is een te ruime capaciteit instellen en vervolgens teleurgestelde deelnemers op de wachtlijst zetten zonder hen te informeren. Houd capaciteit bewust strak en laat het systeem proactief berichten sturen zodra er plek vrijkomt. Zo houd je de betrokkenheid hoog, ook bij een volle activiteit.</p>

<p>Koppel dit aan <a href="/kennisbank/match-lifecycle-swipe-bevestiging">de match-lifecycle</a> en <a href="/blog/vrijwilligers-behouden-retentietracking">geautomatiseerde retentietracking</a>.</p>`,
  },
  {
    type: "KB",
    slug: "match-lifecycle-swipe-bevestiging",
    title: "De match-lifecycle: van swipe tot bevestiging",
    excerpt:
      "Uitleg over de statussen PENDING, ACCEPTED (chat openen), CONFIRMED (formele plaatsing) en COMPLETED in Vrijwilligersmatch.",
    metaTitle: "Match-statussen uitgelegd | Kennisbank",
    metaDescription:
      "De match-statussen in Vrijwilligersmatch uitgelegd: PENDING, ACCEPTED, CONFIRMED, COMPLETED. Wat telt als plaatsing? Kennisbank.",
    keywords: [
      "status match vrijwilligerssoftware",
      "match lifecycle vrijwilligers",
      "CONFIRMED plaatsing vrijwilligers",
    ],
    tags: ["organisatie", "matching", "how-to"],
    relatedSlugs: ["vacatures-optimaliseren-vera", "groepsactiviteiten-qr-checkin", "vrijwilligers-behouden-retentietracking"],
    publishedAt: "2026-12-01",
    readingTime: 6,
    html: `<p>Een match in Vrijwilligersmatch loopt door vier statussen. Het onderscheid tussen ACCEPTED en CONFIRMED is cruciaal voor je impactcijfers. Dit artikel legt het uit, zodat je rapportages kloppen.</p>

<h2>PENDING: de swipe</h2>
<p>Zodra een vrijwilliger een vacature liket, ontstaat een match met status PENDING. Er gebeurt nog niets, behalve dat beide kanten de match zien. De vrijwilliger staat klaar, de organisatie kan reageren wanneer zij tijd heeft.</p>

<h2>ACCEPTED: chat geopend</h2>
<p>De organisatie opent de chat. Dit telt nadrukkelijk niet als plaatsing. Het is een kennismaking. De <code>startedAt</code> wordt gezet voor SLA-meting, zodat je later kunt zien hoe snel organisaties reageren op belangstellenden. Snelle reactie verhoogt de kans op een succesvolle match aanzienlijk.</p>

<h2>CONFIRMED: de formele plaatsing</h2>
<p>Zodra de organisatie bevestigt dat de vrijwilliger actief is, wordt de match CONFIRMED. Dit is de status die telt als plaatsing in je impactrapportage. Vanaf hier starten de check-ins (na 1, 4 en 12 weken). Pas op: bevestig alleen als de vrijwilliger daadwerkelijk is gestart, anders vervorm je je retentiecijfers.</p>

<h2>COMPLETED: afgerond</h2>
<p>Na afloop van de inzet of bij een geslaagde match wordt de status COMPLETED. Deze tellen mee in de afgeronde matches van je handprint. Een COMPLETED match voedt ook de aanbevelingen voor toekomstige matches van die vrijwilliger.</p>

<h2>SLA en herinneringen</h2>
<p>Het systeem stuurt herinneringen als een match 14 of 28 dagen ACCEPTED blijft zonder CONFIRMED. Zo voorkom je dat matches in het luchtledige blijven hangen. Voor organisaties met een lage bevestigingssnelheid is dit een heldere verbeteraanwijzing.</p>

<h2>Praktijkvoorbeeld</h2>
<p>Stel: een vrijwilliger liket een vacature bij de buurtvereniging. De organisatie opent de chat (ACCEPTED) en spreekt een eerste dag af. Na de kennismaking bevestigt de organisatie de plaatsing (CONFIRMED). De vrijwilliger krijgt na een week een check-in, blijkt enthousiast, en na drie maanden staat de match op COMPLETED met een hoge rating. Die hele cyclus is zichtbaar in het dashboard en telt mee in de handprint.</p>

<p>Koppel dit aan <a href="/blog/vrijwilligers-behouden-retentietracking">retentietracking</a> en <a href="/kennisbank/groepsactiviteiten-qr-checkin">groepsactiviteiten</a> voor de volledige cyclus. Meer over landelijke cijfers rond vrijwilligerswerk lees je bij het <a href="https://www.cbs.nl" target="_blank" rel="noopener">CBS</a>.</p>`,
  },
]
