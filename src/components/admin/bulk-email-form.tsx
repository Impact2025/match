"use client"

import { useState, useEffect, useCallback } from "react"
import { Send, Users, Building2, UsersRound, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

type Target = "volunteers" | "organisations" | "all"

interface GemeenteOption {
  slug: string
  displayName: string
}

interface Props {
  gemeenten: GemeenteOption[]
}

export function BulkEmailForm({ gemeenten }: Props) {
  const [target, setTarget] = useState<Target>("volunteers")
  const [gemeenteSlug, setGemeenteSlug] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const fetchCount = useCallback(async () => {
    setLoadingCount(true)
    setRecipientCount(null)
    try {
      const params = new URLSearchParams({ target })
      if (gemeenteSlug) params.set("gemeente", gemeenteSlug)
      const res = await fetch(`/api/admin/bulk-email?${params}`)
      const data = await res.json()
      setRecipientCount(data.count ?? 0)
    } catch {
      setRecipientCount(null)
    } finally {
      setLoadingCount(false)
    }
  }, [target, gemeenteSlug])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError("Vul een onderwerp en bericht in.")
      return
    }
    setError("")
    setSending(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, subject, message, gemeenteSlug: gemeenteSlug || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Versturen mislukt")
      } else {
        setResult(data)
        setConfirmed(false)
      }
    } catch {
      setError("Versturen mislukt. Controleer de verbinding.")
    } finally {
      setSending(false)
    }
  }

  const targetOptions: { value: Target; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "volunteers", label: "Alle vrijwilligers", icon: Users },
    { value: "organisations", label: "Alle organisaties", icon: Building2 },
    { value: "all", label: "Iedereen", icon: UsersRound },
  ]

  return (
    <div className="space-y-6">

      {/* Target */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Aan wie stuur je dit bericht?</p>
        <div className="grid grid-cols-3 gap-3">
          {targetOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => { setTarget(value); setConfirmed(false); setResult(null) }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                target === value
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gemeente filter */}
      {(target === "organisations" || target === "all") && gemeenten.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Gemeente filteren</label>
          <select
            value={gemeenteSlug}
            onChange={(e) => { setGemeenteSlug(e.target.value); setConfirmed(false); setResult(null) }}
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Alle gemeenten</option>
            {gemeenten.map((g) => (
              <option key={g.slug} value={g.slug}>{g.displayName}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1.5">Filter geldt alleen voor organisaties, niet voor vrijwilligers.</p>
        </div>
      )}

      {/* Recipient count preview */}
      <div className="flex items-center gap-2 text-sm">
        {loadingCount ? (
          <span className="text-gray-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Ontvangers tellen…</span>
        ) : recipientCount !== null ? (
          <span className={`font-semibold ${recipientCount === 0 ? "text-red-500" : "text-gray-700"}`}>
            {recipientCount === 0 ? "Geen ontvangers gevonden" : `${recipientCount} ontvangers`}
          </span>
        ) : null}
      </div>

      {/* Message */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Onderwerp</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setConfirmed(false) }}
            placeholder="Bijv: Nieuws van het Vrijwilligerspunt"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Bericht</label>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); setConfirmed(false) }}
            placeholder="Typ je bericht hier. Lege regel = nieuwe alinea."
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">{message.length}/5000 tekens</p>
        </div>
      </div>

      {/* Confirm + Send */}
      {!result && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              disabled={!subject.trim() || !message.trim() || recipientCount === 0 || loadingCount}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Verstuur naar {recipientCount ?? "…"} personen
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Weet je zeker dat je dit bericht wilt sturen naar <strong>{recipientCount} personen</strong>? Dit kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? "Versturen…" : "Ja, verstuur nu"}
                </button>
                <button
                  onClick={() => setConfirmed(false)}
                  disabled={sending}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Bericht verstuurd
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{result.sent}</p>
              <p className="text-green-700 text-xs mt-0.5">Verstuurd</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${result.failed > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-2xl font-bold ${result.failed > 0 ? "text-red-600" : "text-gray-400"}`}>{result.failed}</p>
              <p className={`text-xs mt-0.5 ${result.failed > 0 ? "text-red-600" : "text-gray-400"}`}>Mislukt</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{result.total}</p>
              <p className="text-gray-500 text-xs mt-0.5">Totaal</p>
            </div>
          </div>
          <button
            onClick={() => { setResult(null); setSubject(""); setMessage(""); setConfirmed(false) }}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            Nieuw bericht opstellen
          </button>
        </div>
      )}
    </div>
  )
}
