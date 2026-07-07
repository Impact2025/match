import Link from "next/link"
import { getCurrentGemeente } from "@/lib/gemeente"

export async function SiteFooter() {
  const gemeente = await getCurrentGemeente()
  const platformName = gemeente?.name ?? "Vrijwilligersmatch"

  return (
    <footer className="bg-gray-950 border-t border-white/5 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">{platformName}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Vrijwilligerswerk toegankelijker maken door slimme matching en intuïtief design.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Voor vrijwilligers</Link></li>
              <li><Link href="/register?role=organisation" className="text-gray-400 hover:text-white transition-colors">Voor organisaties</Link></li>
              <li><Link href="/vrijwilligerswerk" className="text-gray-400 hover:text-white transition-colors">Vrijwilligerswerk</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/kennisbank" className="text-gray-400 hover:text-white transition-colors">Kennisbank</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Inloggen</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Bedrijf</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/over-ons" className="text-gray-400 hover:text-white transition-colors">Over ons</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">Veelgestelde vragen</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacybeleid</Link></li>
              <li><Link href="/voorwaarden" className="text-gray-400 hover:text-white transition-colors">Gebruiksvoorwaarden</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2026 {platformName} · een initiatief van WeAreImpact · Hoofddorp
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
