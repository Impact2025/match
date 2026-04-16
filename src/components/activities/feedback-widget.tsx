"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface FeedbackWidgetProps {
  activityId: string
  registrationId: string
  onDone?: () => void
}

const RATING_LABELS = ["", "Teleurstellend", "Matig", "Goed", "Heel goed", "Uitstekend!"]

export function FeedbackWidget({ activityId, registrationId, onDone }: FeedbackWidgetProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!rating) return
    setLoading(true)
    try {
      const r = await fetch(`/api/activities/${activityId}/registrations/${registrationId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: text.trim() || null }),
      })
      if (!r.ok) throw new Error()
      setDone(true)
      toast.success("Bedankt voor je feedback!")
      onDone?.()
    } catch {
      toast.error("Er ging iets mis. Probeer opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className="text-xs text-green-600 font-semibold text-center py-1">
        ✓ Feedback ontvangen, bedankt!
      </p>
    )
  }

  const active = hover || rating

  return (
    <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
      <p className="text-[11px] text-gray-500 font-medium text-center">Hoe was deze activiteit?</p>

      {/* Sterren */}
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-125"
          >
            <Star
              className="w-5 h-5"
              fill={star <= active ? "#f97316" : "none"}
              stroke={star <= active ? "#f97316" : "#d1d5db"}
            />
          </button>
        ))}
      </div>

      {active > 0 && (
        <p className="text-[11px] text-orange-500 font-semibold text-center h-4">
          {RATING_LABELS[active]}
        </p>
      )}

      {rating > 0 && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Vertel wat je ervan vond (optioneel)..."
            className="w-full text-xs rounded-xl border border-gray-200 p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-gray-300"
            rows={2}
          />
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-2 text-xs font-bold rounded-xl text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#f97316" }}
          >
            {loading ? "Versturen..." : "Verstuur feedback →"}
          </button>
        </>
      )}
    </div>
  )
}
