import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { MapPin, Wifi, Clock } from "lucide-react"

const CAT_EMOJI: Record<string, string> = {
  "Kinderen (0–12 jaar)": "🧒",
  "Jongeren (12–18 jaar)": "🧑‍🎓",
  "Ouderen": "👴",
  "Mensen met een beperking": "♿",
  "Gezinnen & Ouderschap": "👨‍👩‍👧",
  "Daklozen & Armoede": "🤝",
  "Vluchtelingen & Integratie": "🌍",
  "Verslaving & Herstel": "💪",
  "Justitie & Re-integratie": "⚖️",
  "Onderwijs": "📚",
  "Zorg & Welzijn": "❤️",
  "Gezondheid": "🏥",
  "Sport & Recreatie": "⚽",
  "Cultuur & Kunst": "🎨",
  "Natuur & Milieu": "🌱",
  "Dieren": "🐾",
  "Levensbeschouwing & Religie": "🕊️",
  "Internationale samenwerking": "🌐",
  "Buurt & Gemeenschap": "🏘️",
  "Technologie": "💻",
  "Evenementen": "🎉",
  "Financieel / Schuldhulp": "💰",
  "Anders / Overig": "✨",
}

function orgInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

interface Props {
  brand: string
  gemeenteSlug?: string | null
}

export async function FeaturedVacancies({ brand, gemeenteSlug }: Props) {
  const vacancies = await prisma.vacancy.findMany({
    where: {
      status: "ACTIVE",
      organisation: {
        status: "APPROVED",
        ...(gemeenteSlug ? { gemeente: { slug: gemeenteSlug } } : {}),
      },
    },
    include: {
      organisation: { select: { name: true, logo: true } },
      categories: { include: { category: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  if (vacancies.length === 0) return null

  const chipBg = `${brand}15`
  const chipBorder = `${brand}30`

  return (
    <section className="py-16 sm:py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: brand }}>
              Vrijwilligersplekken
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-gray-900">
              Recent toegevoegd
            </h2>
          </div>
          <Link
            href="/register"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: brand }}
          >
            Alle plekken bekijken
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vacancies.map((vacancy) => {
            const cat = vacancy.categories[0]?.category
            const catName = cat?.name ?? null
            const catEmoji = catName ? (CAT_EMOJI[catName] ?? "🌟") : "🌟"

            // Gradient background for cards without image
            const charCode = vacancy.organisation.name.charCodeAt(0) % 2
            const [gradFrom, gradTo] =
              charCode === 0 ? [brand, brand + "cc"] : [brand + "cc", brand]

            return (
              <Link
                key={vacancy.id}
                href="/register"
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Image / gradient header */}
                <div className="relative h-36 overflow-hidden flex-shrink-0">
                  {vacancy.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vacancy.imageUrl}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                    >
                      {/* Subtle texture */}
                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                          backgroundSize: "12px 12px",
                        }}
                      />
                      <span className="text-4xl relative z-10">{catEmoji}</span>
                    </div>
                  )}

                  {/* Org avatar */}
                  <div className="absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full border-2 border-white/90 shadow overflow-hidden flex items-center justify-center text-white text-[10px] font-black"
                    style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                  >
                    {vacancy.organisation.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vacancy.organisation.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      orgInitials(vacancy.organisation.name)
                    )}
                  </div>

                  {/* Category chip */}
                  {catName && (
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: `${brand}cc` }}
                      >
                        <span>{catEmoji}</span>
                        <span className="truncate max-w-[100px]">{catName}</span>
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay for readability */}
                  {vacancy.imageUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {vacancy.title}
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                      {vacancy.organisation.name}
                    </p>
                  </div>

                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {vacancy.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 pt-1">
                    {vacancy.remote ? (
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: brand }}
                      >
                        <Wifi className="w-3 h-3" />
                        Op afstand
                      </span>
                    ) : (vacancy.city || vacancy.location) ? (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: brand }} />
                        {vacancy.city ?? vacancy.location}
                      </span>
                    ) : null}
                    {vacancy.hours && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3 flex-shrink-0 text-gray-300" />
                        {vacancy.hours}u/week
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: brand }}
          >
            Alle plekken bekijken na aanmelding
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Link>
        </div>

        {/* Lock hint */}
        <p className="mt-6 text-center text-[12px] text-gray-400 hidden sm:block">
          Maak een gratis account aan om alle vacatures te zien en persoonlijk gematcht te worden
        </p>
      </div>
    </section>
  )
}
