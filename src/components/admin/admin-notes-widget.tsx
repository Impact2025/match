"use client"

import { useState } from "react"
import { StickyNote, Save, Check } from "lucide-react"

interface Props {
  entityId: string
  entityType: "user" | "organisation"
  initialNotes: string | null
}

export function AdminNotesWidget({ entityId, entityType, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const apiPath =
    entityType === "user"
      ? `/api/admin/users/${entityId}`
      : `/api/admin/organisations/${entityId}`

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(apiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_NOTES", notes: notes.trim() || null }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-widest">
          Interne notities
        </h3>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Voeg interne notities toe, bijv. 'past niet bij ouderenzorg'…"
        rows={4}
        className="w-full text-sm text-gray-700 placeholder-gray-400 bg-white border border-amber-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent leading-relaxed"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
          bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {saved ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Opgeslagen
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            {saving ? "Opslaan…" : "Opslaan"}
          </>
        )}
      </button>
    </div>
  )
}
