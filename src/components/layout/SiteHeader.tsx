import Link from "next/link"
import { getCurrentGemeente } from "@/lib/gemeente"

export async function SiteHeader() {
  const gemeente = await getCurrentGemeente()
  const brand = gemeente?.primaryColor ?? "#f97316"
  const platformName = gemeente?.name ?? "Vrijwilligersmatch"

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: brand }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 truncate">
            {platformName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="/#hoe-het-werkt" className="hover:text-gray-900 transition-colors">Hoe het werkt</a>
          <a href="/#organisaties" className="hover:text-gray-900 transition-colors">Organisaties</a>
          <a href="/#impact" className="hover:text-gray-900 transition-colors">Impact</a>
          <Link href="/vrijwilligerswerk" className="hover:text-gray-900 transition-colors">Vrijwilligerswerk</Link>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
          <Link href="/kennisbank" className="hover:text-gray-900 transition-colors">Kennisbank</Link>
          <Link href="/over-ons" className="hover:text-gray-900 transition-colors">Over ons</Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/login"
            className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/register"
            className="px-3 sm:px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={{ backgroundColor: brand }}
          >
            Aanmelden
          </Link>
        </div>
      </nav>
    </header>
  )
}
