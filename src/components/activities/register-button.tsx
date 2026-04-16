"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Clock, Loader2, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  activityId: string
  myRegistration: { id: string; status: string } | null
  isFull: boolean
  hasWaitlist: boolean
  icalHref: string
  activityTitle: string
}

export function RegisterButton({ activityId, myRegistration, isFull, hasWaitlist }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isRegistered = myRegistration?.status === "REGISTERED"
  const isWaitlisted = myRegistration?.status === "WAITLISTED"
  const isAttended = myRegistration?.status === "ATTENDED"
  const isCancelled = !myRegistration || myRegistration?.status === "CANCELLED"

  async function handleRegister() {
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Fout bij aanmelden")
        return
      }
      if (data.status === "WAITLISTED") {
        toast.success("Je staat op de wachtlijst!")
      } else {
        toast.success("Aangemeld! 🎉")
      }
      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!myRegistration) return
    if (!confirm("Wil je je afmelden voor deze activiteit?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/registrations/${myRegistration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Afgemeld")
      router.refresh()
    } catch {
      toast.error("Fout bij afmelden")
    } finally {
      setLoading(false)
    }
  }

  if (isAttended) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm font-medium text-green-800">Je hebt deze activiteit bijgewoond. Dank je wel!</p>
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">Je bent aangemeld!</p>
          <p className="text-xs text-green-600 mt-0.5">Je ontvangt een herinnering voor de activiteit</p>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
          Afmelden
        </button>
      </div>
    )
  }

  if (isWaitlisted) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Je staat op de wachtlijst</p>
          <p className="text-xs text-amber-600 mt-0.5">Je wordt automatisch overgeplaatst als er een plek vrijkomt</p>
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />}
          Afmelden
        </button>
      </div>
    )
  }

  if (isFull && !hasWaitlist) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-500 font-medium">Deze activiteit is vol</p>
      </div>
    )
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={loading}
      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2 py-5 text-base font-semibold rounded-2xl"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Bezig...</>
      ) : isFull && hasWaitlist ? (
        "Op wachtlijst zetten"
      ) : (
        "Aanmelden voor deze activiteit"
      )}
    </Button>
  )
}
