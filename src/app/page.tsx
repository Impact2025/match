import Link from "next/link"
import { Heart, Users, Building2, Star, ArrowRight, CheckCircle2, Zap, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const STATS = [
  { value: "10.000+", label: "Vrijwilligers" },
  { value: "500+", label: "Organisaties" },
  { value: "2.500+", label: "Matches" },
  { value: "4.8/5", label: "Beoordeling" },
]

const FEATURES = [
  {
    icon: Heart,
    title: "Swipe & Match",
    description:
      "Net als dating — maar voor vrijwilligerswerk. Swipe op vacatures die bij je passen en krijg alleen meldingen van echte matches.",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    icon: Zap,
    title: "AI-powered matches",
    description:
      "Onze AI analyseert jouw profiel, vaardigheden en interesses voor de perfecte match. Geen eindeloos zoeken meer.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: MessageCircle,
    title: "Direct chatten",
    description:
      "Chat direct met organisaties zodra je matcht. Geen formulieren, geen wachten — gewoon contact.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
]

const CATEGORIES = [
  { name: "Natuur & Milieu", emoji: "🌿", count: 89 },
  { name: "Onderwijs", emoji: "📚", count: 134 },
  { name: "Zorg & Welzijn", emoji: "❤️", count: 201 },
  { name: "Sport", emoji: "⚽", count: 67 },
  { name: "Cultuur", emoji: "🎨", count: 48 },
  { name: "Dieren", emoji: "🐾", count: 73 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Vrijwilligersmatch</span>
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-0">
              Beta
            </Badge>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Inloggen
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm"
              >
                Gratis starten
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            #1 vrijwilligersplatform van Nederland
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight">
            Swipe je naar{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              impact
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Vrijwilligersmatch.nl verbindt vrijwilligers en organisaties via een swipe-interface.
            Vind vacatures die écht bij jou passen — op basis van jouw vaardigheden en interesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 px-8 py-6 text-base"
              >
                <Users className="w-5 h-5 mr-2" />
                Ik zoek vrijwilligerswerk
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register?role=organisation">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-6 text-base"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Ik zoek vrijwilligers
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400">
            Gratis • Geen creditcard • Direct beginnen
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Vrijwilligerswerk, opnieuw uitgevonden
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We hebben het beste van moderne apps gecombineerd met de warmte van vrijwilligerswerk.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Alle categorieën</h2>
            <p className="text-gray-500">Van natuur tot technologie — er is altijd een match voor jou.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href="/register"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-400">{cat.count} vacatures</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Hoe werkt het?</h2>
            <p className="text-gray-500 text-lg">In 3 stappen naar jouw vrijwilligersmatch.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Maak een profiel",
                desc: "Vertel wat je kunt, waar je gepassioneerd over bent en wanneer je beschikbaar bent.",
                emoji: "👤",
              },
              {
                step: "02",
                title: "Swipe op vacatures",
                desc: "Bekijk vacatures die bij je passen. Like wat je aanspreekt, pas als het niet past.",
                emoji: "❤️",
              },
              {
                step: "03",
                title: "Chat & Begin!",
                desc: "Bij een match kun je direct chatten met de organisatie. Zo simpel is het.",
                emoji: "💬",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl">
                  {item.emoji}
                </div>
                <div className="text-xs font-bold text-orange-500 tracking-wider">{item.step}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-amber-500">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Klaar om impact te maken?
          </h2>
          <p className="text-orange-100 text-lg">
            Meer dan 10.000 vrijwilligers zijn je al voorgegaan. Jij ook?
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl px-10 py-6 text-base font-semibold"
            >
              Gratis registreren
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <div className="flex justify-center gap-6 text-sm text-orange-100">
            {["Gratis account", "Geen creditcard", "Direct beginnen"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Vrijwilligersmatch.nl</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Vrijwilligersmatch.nl · Gebouwd met ❤️ in Nederland
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Voorwaarden
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
