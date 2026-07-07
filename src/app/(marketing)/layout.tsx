import Link from "next/link"
import type { ReactNode } from "react"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-orange-500">Vrijwilligers</span>match
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/blog" className="hover:text-orange-500">
              Blog
            </Link>
            <Link href="/kennisbank" className="hover:text-orange-500">
              Kennisbank
            </Link>
            <Link href="/steden" className="hover:text-orange-500">
              Steden
            </Link>
            <Link href="/faq" className="hover:text-orange-500">
              FAQ
            </Link>
          </nav>
          <Link
            href="/"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Swipe je match
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="max-w-sm">
              <p className="font-bold">
                <span className="text-orange-500">Vrijwilligers</span>match
              </p>
              <p className="mt-2 text-sm text-slate-600">
                De slimste manier om vrijwilligers en organisaties te verbinden.
                Swipe, match en maak impact.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-900">Content</span>
                <Link href="/blog" className="text-slate-600 hover:text-orange-500">
                  Blog
                </Link>
                <Link href="/kennisbank" className="text-slate-600 hover:text-orange-500">
                  Kennisbank
                </Link>
                <Link href="/steden" className="text-slate-600 hover:text-orange-500">
                  Steden
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-slate-900">Meer</span>
                <Link href="/faq" className="text-slate-600 hover:text-orange-500">
                  FAQ
                </Link>
                <a
                  href="https://www.weareimpact.nl"
                  target="_blank"
                  rel="noopener"
                  className="text-slate-600 hover:text-orange-500"
                >
                  WeAreImpact
                </a>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-slate-500">
            © {new Date().getFullYear()} Vrijwilligersmatch. Onderdeel van het
            WeAreImpact-ecosysteem.
          </p>
        </div>
      </footer>
    </div>
  )
}
