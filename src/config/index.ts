export const siteConfig = {
  name: "Vrijwilligersmatch.nl",
  description: "De slimste manier om vrijwilligers en organisaties te verbinden",
  url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  ogImage: "/images/og.png",
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/voor-organisaties", label: "Voor organisaties" },
  { href: "/blog", label: "Blog" },
]

export const SWIPE_DIRECTIONS = {
  LIKE: "LIKE",
  DISLIKE: "DISLIKE",
  SUPER_LIKE: "SUPER_LIKE",
} as const

export const MAX_SUPER_LIKES_PER_DAY = 3
export const DEFAULT_MAX_DISTANCE = 25

export const CATEGORIES = [
  // Doelgroepen — mensen
  { name: "Kinderen (0–12 jaar)",         color: "#ec4899" },
  { name: "Jongeren (12–18 jaar)",         color: "#f43f5e" },
  { name: "Ouderen",                       color: "#f59e0b" },
  { name: "Mensen met een beperking",      color: "#6366f1" },
  { name: "Gezinnen & Ouderschap",         color: "#8b5cf6" },
  { name: "Daklozen & Armoede",            color: "#64748b" },
  { name: "Vluchtelingen & Integratie",    color: "#06b6d4" },
  { name: "Verslaving & Herstel",          color: "#0ea5e9" },
  { name: "Justitie & Re-integratie",      color: "#475569" },
  // Sectoren & thema's
  { name: "Onderwijs",                     color: "#3b82f6" },
  { name: "Zorg & Welzijn",                color: "#ef4444" },
  { name: "Gezondheid",                    color: "#14b8a6" },
  { name: "Sport & Recreatie",             color: "#f97316" },
  { name: "Cultuur & Kunst",               color: "#a855f7" },
  { name: "Natuur & Milieu",               color: "#22c55e" },
  { name: "Dieren",                        color: "#84cc16" },
  { name: "Levensbeschouwing & Religie",   color: "#a16207" },
  { name: "Internationale samenwerking",   color: "#0d9488" },
  { name: "Buurt & Gemeenschap",           color: "#78716c" },
  { name: "Technologie",                   color: "#6366f1" },
  { name: "Evenementen",                   color: "#db2777" },
  // Vangnet
  { name: "Anders / Overig",               color: "#94a3b8" },
]

export const SKILLS = [
  // Persoonlijk & communicatie
  "Communicatie",
  "Luistervaardigheden",
  "Taalvaardigheid",
  "Coaching / Begeleiding",
  "Lesgeven",
  // Organisatie & administratie
  "Organisatie",
  "Administratie",
  "Financieel advies",
  "Juridisch advies",
  // Zorg & welzijn
  "EHBO / BHV",
  "Zorgverlening",
  "Vervoer / Rijbewijs",
  // Creatief & technisch
  "IT / Technologie",
  "Marketing",
  "Fotografie / Video",
  "Muziek",
  "Handvaardigheid",
  "Koken",
  "Tuinieren",
  // Overig
  "Teamwork",
  "Creatief denken",
]

export const AVAILABILITY_OPTIONS = [
  { value: "monday", label: "Maandag" },
  { value: "tuesday", label: "Dinsdag" },
  { value: "wednesday", label: "Woensdag" },
  { value: "thursday", label: "Donderdag" },
  { value: "friday", label: "Vrijdag" },
  { value: "saturday", label: "Zaterdag" },
  { value: "sunday", label: "Zondag" },
  { value: "morning", label: "Ochtend" },
  { value: "afternoon", label: "Middag" },
  { value: "evening", label: "Avond" },
]
