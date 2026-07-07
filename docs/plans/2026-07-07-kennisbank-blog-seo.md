# Kennisbank + Blog — Vrijwilligersmatch.nl (Wereldklasse SEO) Implementation Plan

> **For Hermes:** Bouw dit plan taak-voor-taak. De content (artikelen) wordt als HTML in een Prisma `Content` model gezaaid via een seed-script; frontend rendert via `dangerouslySetInnerHTML`. Alle datums liggen tussen 2025-12-12 en 2027-06-30 en zijn historisch. Schrijfstijl = Vincent van Munster ik-vorm (zie E-E-A-T gids), sentence case koppen, WeAreImpact genoemd in elke CTA.

**Goal:** Een productierijpe, geindexeerde Kennisbank (functioneel/hoe‑ik‑vragen) + Blog (thought leadership) op Vrijwilligersmatch.nl, gevoed door de onderzoeken in `Onderzoeken/` en geschreven in de Vincent-stem, met TechArticle/BlogPosting/FAQPage/SoftwareApplication schema, sitemap, robots, RSS en programmatische gemeente-landingspagina's.

**Architecture:** Nieuw Prisma model `Content` (type: BLOG | KB, status, slug, html body, meta fields, tags, related, publishedAt). Eén set generieke routes `(marketing)/blog`, `(marketing)/kennisbank` onder een gedeelde layout met header/footer. Content komt uit `prisma/seed-content.ts` (HTML), geüpseed via `prisma db seed`. Blog detail toont ToC, share, related, CTA, JSON‑LD. Gemeente-landers via `src/app/gemeente/[slug]/page.tsx` bestaan al (white‑label) — we voegen alleen een `/gemeente/[slug]` programmatische SEO‑pagina toe als die nog niet bestaat, anders een `/steden/[stad]` route.

**Tech Stack:** Next.js 16 App Router, Prisma 6 (PostgreSQL), Tailwind 4, bestaande `ui` componenten (card, badge, button), `lucide-react`, `next/font`. Geen nieuwe externe deps.

---

## DATUM-SPREAD (elk artikel uniek, historisch)
Blog (9): 2025-12-12, 2026-01-20, 2026-02-24, 2026-03-30, 2026-05-05, 2026-06-15, 2026-08-03, 2026-10-12, 2026-11-30
Kennisbank (6): 2026-01-15, 2026-03-10, 2026-04-20, 2026-06-02, 2026-09-14, 2026-12-01
Stedenlanders (10): 2026-02-01, 2026-02-15, 2026-03-01, 2026-03-15, 2026-04-01, 2026-04-15, 2026-05-01, 2026-05-15, 2026-06-01, 2026-06-15

---

## CONTENT-PIJP (onderwerpen, keywords, E-E-A-T data uit onderzoek)

### BLOG (Commercial / Inspirerend — Top/Mid funnel)
B1. Waarom traditionele vrijwilligersvacatures falen (en wat we leren van swipe-cultuur)
    KW: jongere vrijwilligers werven | Data: Gen Z episodisch/micro-volunteering, 50% NL doet vrijwillig werk maar versnipperd (CBS/Movisie); 44% wereldwijd gestopt sinds 2018.
B2. De harde euro's van zachte impact: SROI van vrijwilligerswerk berekenen
    KW: maatschappelijke waarde vrijwilligerswerk | Data: SROI 1,5–6x (NL studies), eenzaamheid kost ~2 mld/yr, ernstige eenzaamheid 40–50% hogere zorgkosten, factor 4,2x OrgHandprint.
B3. Lokale netwerken versterken: kracht van een multi-tenant burgerplatform
    KW: burgerparticipatie software gemeente | Data: Heemstede/Haarlem white-label, kruisbestuiving organisaties.
B4. Waarom vrijwilligers na 4 weken afhaken (en hoe geautomatiseerde retentietracking dat voorkomt)
    KW: vrijwilligers behouden tips | Data: 65% jaarlijkse retentie, JD-R model, check-ins 1/4/12 weken, buddy +52% retentie, 44% uitval sinds 2018.
B5. Psychometrie in de praktijk: match op Schwartz-waardenprofiel
    KW: motivatie vrijwilligers achterhalen | Data: VFI meta-analyse 61 studies N=38.327, motivatie ρ=0.42 vs skills ρ=0.10, geïntegreerd 85% vs 65% retentie.
B6. Van 180 vrijwilligers naar schaalbare impact: wat 25 jaar welzijn mij leerde
    KW: vrijwilligerswerk platform software | E-E-A-T: Stichting de Baan 700+ deelnemers, 180 vrijwilligers, 70.000+ geluksmomenten.
B7. AI-assistenten Vera & Sam: hoe gemeenten en organisaties tijd terugkrijgen
    KW: vrijwilligers vacature schrijven met AI | Data: 30–50% admin-reductie, AI match-scoring OpenAI.
B8. Social return door software: SROI 4,2x als sturingsinstrument voor gemeenten
    KW: SROI score vrijwilligerswerk berekenen | Data: OrgHandprint nachtelijke cron, SDG-scores, vervangingswaarde + SROI.
B9. De toekomst van burgerparticipatie: van statische vacaturebank naar ecosysteem
    KW: white-label vrijwilligersportaal voor gemeenten | Data: LEGO Serious Play, MeerWaarde, C-Beta.

### KENNISBANK (Functioneel / Navigational)
K1. White-label omgeving configureren voor je gemeente
    KW: white-label vrijwilligersplatform instellen | WijHeemstede framework: slug, logo, favicon, kleuren.
K2. AI-rapportages analyseren met assistent Sam
    KW: vrijwilligers trends analyseren gemeente | Sam dashboard trends/tekorten.
K3. Gemeentelijke handprint & SROI opbouwen
    KW: SROI score vrijwilligerswerk berekenen | OrgHandprint 4,2x + SDG.
K4. Vacatures optimaliseren met AI-assistent Vera
    KW: vrijwilligers vacature schrijven met AI | Vera verrijkt beschrijvingen.
K5. Groepsactiviteiten & QR-check-in beheren
    KW: aanwezigheidsregistratie vrijwilligers evenement | Workshops, wachtlijst, QR self-check-in.
K6. De match-lifecycle: van swipe tot bevestiging
    KW: status match vrijwilligerssoftware | PENDING/ACCEPTED/CONFIRMED/COMPLETED.

### PROGRAMMATISCHE STEDEN (Programmatic SEO)
Steden: Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen, Maastricht, Haarlem, Heemstede, Breda.
Elk: unieke titel/meta, lokaal keyword "vrijwilligerswerk [stad]", CTA naar gemeente-module, interne links.

---

## TAKEN

### Task 1: Prisma model `Content` + migrate
- Add model `Content` (id cuid, type enum, slug unique, title, html @db.Text, excerpt, metaTitle, metaDescription, keywords String?, tags String?, relatedSlugs String?, city String?, status enum, publishedAt DateTime?, readingTime Int?, updatedAt). Add enum `ContentType { BLOG KB CITY }`.
- Files: `prisma/schema.prisma` (append). Then `npx prisma migrate dev --name add_content` (or `db push` if no migrate history). Commit.

### Task 2: Seed-script met alle artikelen (HTML)
- Create `prisma/seed-content.ts` exporting `contentSeed: ContentSeed[]` (BLOG/KB/CITY arrays). HTML body met <h2> sentence case, interne links naar /blog/ en /kennisbank/, externe links naar onderzoek/Movisie/CBS, E-E-A-T, WeAreImpact CTA.
- Create `prisma/seed.ts` (of extend bestaande) die `prisma.content.upsert` per slug.
- Min 600w KB, 1200w blog. Validate: woorden, H2, interne link, externe link, meta-lengte via een `validate()` in het script (print FAIL).
- Commit.

### Task 3: Content library + query helper
- Create `src/lib/content.ts`: `getContent(slug)`, `listContent(type, opts)`, `getRelated(slug)`, `extractToc(html)`, `injectHeadingIds(html)`, `estReadingTime(html)`.
- Commit.

### Task 4: Marketing layout + nav
- Create `src/app/(marketing)/layout.tsx` (shared header met navigatie Blog/Kennisbank + footer met WeAreImpact). Reuse bestaande UI atoms.
- Commit.

### Task 5: Blog index + detail
- `src/app/(marketing)/blog/page.tsx` (grid, ISR 3600) + `src/app/(marketing)/blog/[slug]/page.tsx` (ToC, share, related, CTA, BlogPosting JSON-LD, generateMetadata).
- Commit.

### Task 6: Kennisbank index + detail
- `src/app/(marketing)/kennisbank/page.tsx` + `.../[slug]/page.tsx` (TechArticle + HowTo auto-detect + Breadcrumb JSON-LD).
- Commit.

### Task 7: Programmatische steden
- `src/app/(marketing)/steden/[stad]/page.tsx` (CollectionPage/WebPage schema, ISR). Data uit Content type=CITY.
- Commit.

### Task 8: Technical SEO
- `src/app/sitemap.ts` (static + dynamic blog/kb/city), `src/app/robots.ts` (allow marketing, block admin/api/dashboard), `src/app/blog/rss/route.ts` (RSS 2.0), `src/app/(marketing)/blog/rss` verwijst. SoftwareApplication JSON-LD op homepage (`src/app/page.tsx`), Organization op layout.
- Commit.

### Task 9: FAQPage schema uitbreiden
- Voeg FAQPage JSON-LD toe aan `src/app/faq/page.tsx` met de bestaande FAQ-content (haal vragen uit faq-content.tsx).
- Commit.

### Task 10: Build + validate + deploy
- `npx next build` (must pass). Run `validate()` output check. `git push`. Optioneel IndexNow ping.
- Commit.

---

## E-E-A-T / STEM-REGELS (verplicht)
- Altijd ik-vorm Vincent. Nooit over hem. Sentence case koppen. Geen streepjes in lopende tekst.
- Weef 4 profielen: Bestuurlijk (Stichting de Baan: 700+ deelnemers, 180 vrijwilligers, 70.000+ geluksmomenten), Tech (Vera/Sam, Next.js 16, Prisma 6, Pusher, OpenAI), Sociaal ondernemer (Philia, De Impact Box, BioExpress, Nyenrode), Interim (MeerWaarde, C-Beta, LEGO Serious Play). Wissel per artikel.
- Verleden tijd voor De Baan ("Toen ik directeur was…", "Tot 1 oktober 2025").
- Duale CTA: korte termijn product, lange termijn www.WeAreImpact.nl.
- Elke blog eindigt met WeAreImpact-verwijzing.

## PITFALLS
- Content is HTML, geen Markdown (dangerouslySetInnerHTML).
- Datums historisch + uniek (validate set == lengte).
- www→non-www: metadataBase al op vrijwilligersmatch.nl? check; voeg 301 toe in middleware indien nodig (geen middleware nu — skip of voeg toe).
- Robots: block /admin /api /(dashboard) /(organisation) /(auth).
- ISR revalidate 3600 op SEO-pagina's.
