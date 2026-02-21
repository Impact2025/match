"use client"

import { useState, useTransition } from "react"
import { updateOrgStatus } from "./actions"
import { OrgStatus } from "@prisma/client"
import { CheckCircle, XCircle, PauseCircle, PlayCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

interface OrgActionFormProps {
  orgId: string
  currentStatus: OrgStatus
}

type OrgAction = "APPROVE_ORG" | "REJECT_ORG" | "SUSPEND_ORG" | "UNSUSPEND_ORG"

const ACTION_LABELS: Record<OrgAction, string> = {
  APPROVE_ORG: "Goedkeuren",
  REJECT_ORG: "Afwijzen",
  SUSPEND_ORG: "Schorsen",
  UNSUSPEND_ORG: "Heractiveren",
}

const ACTION_DESCRIPTIONS: Record<OrgAction, string> = {
  APPROVE_ORG: "De organisatie wordt goedgekeurd en kan vacatures plaatsen.",
  REJECT_ORG: "De organisatie wordt afgewezen. De reden wordt opgeslagen.",
  SUSPEND_ORG: "De organisatie wordt tijdelijk geschorst. De reden wordt opgeslagen.",
  UNSUSPEND_ORG: "De organisatie wordt heractiveerd en krijgt weer volledige toegang.",
}

export function OrgActionForm({ orgId, currentStatus }: OrgActionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [reason, setReason] = useState("")
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<OrgAction | null>(null)

  const openConfirm = (action: OrgAction) => {
    if (["REJECT_ORG", "SUSPEND_ORG"].includes(action) && !reason.trim()) {
      toast.error("Vul een reden in voor afwijzen of schorsen.")
      return
    }
    setPendingAction(action)
  }

  const handleConfirm = () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    setActiveAction(action)
    startTransition(async () => {
      try {
        await updateOrgStatus(orgId, action, reason || undefined)
        setReason("")
        toast.success(`${ACTION_LABELS[action]} geslaagd`)
      } catch {
        toast.error("Er ging iets mis. Probeer opnieuw.")
      } finally {
        setActiveAction(null)
      }
    })
  }

  const isPending_ = (action: string) => isPending && activeAction === action

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Actie</h3>

        {/* Reason field */}
        <div className="space-y-2">
          <label className="text-gray-400 text-xs font-medium">
            Reden <span className="text-gray-300">(verplicht bij afwijzen of schorsen)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Voeg een toelichting toe voor de organisatie..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300 resize-none transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentStatus !== "APPROVED" && (
            <button
              onClick={() => openConfirm("APPROVE_ORG")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-500/25 text-green-600 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => openConfirm("REJECT_ORG")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => openConfirm("SUSPEND_ORG")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-500/25 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => openConfirm("UNSUSPEND_ORG")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/25 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {pendingAction && (
        <ConfirmDialog
          open={!!pendingAction}
          onOpenChange={(o) => { if (!o) setPendingAction(null) }}
          title={ACTION_LABELS[pendingAction]}
          description={ACTION_DESCRIPTIONS[pendingAction]}
          confirmLabel={ACTION_LABELS[pendingAction]}
          confirmVariant={["REJECT_ORG", "SUSPEND_ORG"].includes(pendingAction) ? "destructive" : "default"}
          onConfirm={handleConfirm}
          loading={isPending}
        />
      )}
    </>
  )
}
