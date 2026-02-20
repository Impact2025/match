import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pagina niet gevonden — Vrijwilligersmatch.nl",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-100">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </div>

      {/* 404 chip */}
      <span className="inline-block px-3 py-1 bg-orange-50 text-orange-500 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
        404
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-gray-900 mb-4">
        Deze pagina bestaat niet
      </h1>
      <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-10">
        De pagina die je zoekt is verplaatst, verwijderd of heeft nooit bestaan. Geen zorgen — je match wacht nog steeds op je.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
        Terug naar home
      </Link>

      <p className="mt-8 text-sm text-gray-400">
        Of ga naar{" "}
        <Link href="/swipe" className="text-orange-500 hover:underline">swipen</Link>
        {" "}·{" "}
        <Link href="/matches" className="text-orange-500 hover:underline">matches</Link>
        {" "}·{" "}
        <Link href="/login" className="text-orange-500 hover:underline">inloggen</Link>
      </p>
    </div>
  )
}
