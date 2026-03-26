"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MaintenancePage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin === "1977") {
      document.cookie = "maintenance_bypass=1977; path=/; max-age=86400"
      router.push("/")
    } else {
      setError(true)
      setPin("")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🔧</div>
        <h1 className="text-3xl font-bold text-gray-900">We zijn zo terug</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Vrijwilligersmatch is momenteel in onderhoud. We zijn hard bezig om de
          site te verbeteren. Kom snel terug!
        </p>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <input
            type="password"
            inputMode="numeric"
            placeholder="Pincode"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false) }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
            maxLength={10}
          />
          {error && (
            <p className="text-red-500 text-sm">Ongeldige pincode</p>
          )}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            Toegang
          </button>
        </form>
        <p className="text-sm text-gray-400">
          Vragen? Neem contact op via{" "}
          <a href="mailto:info@vrijwilligersmatch.nl" className="underline hover:text-gray-600">
            info@vrijwilligersmatch.nl
          </a>
        </p>
      </div>
    </div>
  )
}
