"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "lucide-react"

interface Props {
  activityId: string
  qrToken: string
}

export function CheckInButton({ activityId, qrToken }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleCheckIn() {
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Fout bij check-in")
        return
      }
      setDone(true)
      toast.success(data.alreadyCheckedIn ? "Je stond al geregistreerd als aanwezig!" : "Check-in geslaagd! 🎉")
      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <p className="text-green-700 font-semibold text-sm">Check-in geslaagd!</p>
      </div>
    )
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3.5 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Bezig...</>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Bevestig aanwezigheid
        </>
      )}
    </button>
  )
}
