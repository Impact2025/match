"use client"

import { useState, useTransition } from "react"
import { updateOrgStatus } from "./actions"
import { OrgStatus } from "@prisma/client"
import { CheckCircle, XCircle, PauseCircle, PlayCircle, Loader2 } from "lucide-react"

interface OrgActionFormProps {
  orgId: string
  currentStatus: OrgStatus
}

export function OrgActionForm({ orgId, currentStatus }: OrgActionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [reason, setReason] = useState("")
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handleAction = (action: "APPROVE_ORG" | "REJECT_ORG" | "SUSPEND_ORG" | "UNSUSPEND_ORG") => {
    if (["REJECT_ORG", "SUSPEND_ORG"].includes(action) && !reason.trim()) {
      alert("Vul een reden in voor afwijzen of schorsen.")
      return
    }
    setActiveAction(action)
    startTransition(async () => {
      await updateOrgStatus(orgId, action, reason || undefined)
      setReason("")
      setActiveAction(null)
    })
  }

  const isPending_ = (action: string) => isPending && activeAction === action

  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Actie</h3>

      {/* Reason field */}
      <div className="space-y-2">
        <label className="text-white/50 text-xs font-medium">
          Reden <span className="text-white/25">(verplicht bij afwijzen of schorsen)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Voeg een toelichting toe voor de organisatie..."
          rows={3}
          className="w-full bg-[#0f0f0f] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#FF6B35]/40 resize-none transition-colors"
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentStatus !== "APPROVED" && (
          <button
            onClick={() => handleAction("APPROVE_ORG")}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/25 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending_("APPROVE_ORG") ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Goedkeuren
          </button>
        )}

        {currentStatus !== "REJECTED" && currentStatus !== "SUSPENDED" && (
          <button
            onClick={() => handleAction("REJECT_ORG")}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending_("REJECT_ORG") ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Afwijzen
          </button>
        )}

        {currentStatus === "APPROVED" && (
          <button
            onClick={() => handleAction("SUSPEND_ORG")}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending_("SUSPEND_ORG") ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PauseCircle className="w-4 h-4" />
            )}
            Schorsen
          </button>
        )}

        {(currentStatus === "SUSPENDED" || currentStatus === "REJECTED") && (
          <button
            onClick={() => handleAction("UNSUSPEND_ORG")}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending_("UNSUSPEND_ORG") ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            Heractiveren
          </button>
        )}
      </div>
    </div>
  )
}
