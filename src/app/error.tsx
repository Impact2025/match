"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-100">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Error chip */}
      <span className="inline-block px-3 py-1 bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
        Er is iets misgegaan
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-gray-900 mb-4">
        Oeps, dat ging fout
      </h1>
      <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-10">
        Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar de startpagina.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Opnieuw proberen
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Terug naar home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-gray-400 font-mono">
          Foutcode: {error.digest}
        </p>
      )}
    </div>
  )
}
