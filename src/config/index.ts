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
  { name: "Natuur & Milieu", icon: "🌿", color: "#22c55e" },
  { name: "Onderwijs", icon: "📚", color: "#3b82f6" },
  { name: "Zorg & Welzijn", icon: "❤️", color: "#ef4444" },
  { name: "Sport & Recreatie", icon: "⚽", color: "#f97316" },
  { name: "Cultuur & Kunst", icon: "🎨", color: "#a855f7" },
  { name: "Dieren", icon: "🐾", color: "#84cc16" },
  { name: "Vluchtelingen & Integratie", icon: "🤝", color: "#06b6d4" },
  { name: "Ouderen", icon: "👴", color: "#f59e0b" },
  { name: "Jongeren", icon: "🧒", color: "#ec4899" },
  { name: "Technologie", icon: "💻", color: "#6366f1" },
  { name: "Gezondheid", icon: "🏥", color: "#14b8a6" },
  { name: "Evenementen", icon: "🎉", color: "#f43f5e" },
]

export const SKILLS = [
  "Communicatie",
  "Organisatie",
  "Rijbewijs",
  "IT / Technologie",
  "Marketing",
  "Taalvaardigheid",
  "EHBO",
  "Koken",
  "Muziek",
  "Fotografie",
  "Tuinieren",
  "Coaching / Begeleiding",
  "Administratie",
  "Creatief denken",
  "Teamwork",
  "Lesgeven",
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
