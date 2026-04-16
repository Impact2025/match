"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X, Clock, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type RegStatus = "REGISTERED" | "WAITLISTED" | "ATTENDED" | "ABSENT" | "CANCELLED"

interface Registration {
  id: string
  status: RegStatus
  registeredAt: string
  checkedInAt: string | null
  volunteer: { id: string; name: string; image: string | null; email: string }
}

const STATUS_CONFIG: Record<RegStatus, { label: string; badge: string }> = {
  REGISTERED: { label: "Aangemeld",   badge: "bg-blue-100 text-blue-700" },
  WAITLISTED: { label: "Wachtlijst",  badge: "bg-amber-100 text-amber-700" },
  ATTENDED:   { label: "Aanwezig",    badge: "bg-green-100 text-green-700" },
  ABSENT:     { label: "Afwezig",     badge: "bg-gray-100 text-gray-500" },
  CANCELLED:  { label: "Geannuleerd", badge: "bg-red-100 text-red-400" },
}

const TABS: { key: RegStatus | "ALL"; label: string }[] = [
  { key: "ALL",        label: "Alle" },
  { key: "REGISTERED", label: "Aangemeld" },
  { key: "WAITLISTED", label: "Wachtlijst" },
  { key: "ATTENDED",   label: "Aanwezig" },
  { key: "ABSENT",     label: "Afwezig" },
]

interface AttendanceTableProps {
  activityId: string
  registrations: Registration[]
}

export function AttendanceTable({ activityId, registrations }: AttendanceTableProps) {
  const router = useRouter()
  const [tab, setTab] = useState<RegStatus | "ALL">("ALL")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const filtered = tab === "ALL" ? registrations : registrations.filter((r) => r.status === tab)

  async function updateStatus(regId: string, status: RegStatus) {
    setLoadingId(regId)
    try {
      const res = await fetch(`/api/activities/${activityId}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast.error("Fout bij bijwerken status")
    } finally {
      setLoadingId(null)
    }
  }

  async function markAllPresent() {
    if (!confirm("Alle aangemelde deelnemers als aanwezig markeren?")) return
    setBulkLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllPresent: true }),
      })
      if (!res.ok) throw new Error()
      toast.success("Alle deelnemers gemarkeerd als aanwezig")
      router.refresh()
    } catch {
      toast.error("Fout bij bulk-update")
    } finally {
      setBulkLoading(false)
    }
  }

  const registeredCount = registrations.filter((r) => r.status === "REGISTERED").length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-100 overflow-x-auto">
        {TABS.map(({ key, label }) => {
          const count = key === "ALL" ? registrations.length : registrations.filter((r) => r.status === key).length
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === key
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          )
        })}

        {registeredCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            disabled={bulkLoading}
            className="ml-auto flex-shrink-0 gap-1.5 text-xs h-7"
          >
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
            Alle aanwezig
          </Button>
        )}
      </div>

      {/* Lijst */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">Geen deelnemers in deze categorie</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map((reg) => {
            const cfg = STATUS_CONFIG[reg.status]
            const isLoading = loadingId === reg.id
            return (
              <div key={reg.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {reg.volunteer.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reg.volunteer.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                      {reg.volunteer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{reg.volunteer.name}</p>
                  <p className="text-xs text-gray-400 truncate">{reg.volunteer.email}</p>
                  {reg.checkedInAt && (
                    <p className="text-[10px] text-green-600 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      Check-in: {new Date(reg.checkedInAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>

                {/* Acties */}
                {(reg.status === "REGISTERED" || reg.status === "WAITLISTED") && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(reg.id, "ATTENDED")}
                      disabled={isLoading}
                      title="Aanwezig"
                      className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 text-green-600 animate-spin" /> : <Check className="w-3.5 h-3.5 text-green-600" />}
                    </button>
                    <button
                      onClick={() => updateStatus(reg.id, "ABSENT")}
                      disabled={isLoading}
                      title="Afwezig"
                      className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                )}

                {reg.status === "ATTENDED" && (
                  <button
                    onClick={() => updateStatus(reg.id, "REGISTERED")}
                    disabled={isLoading}
                    title="Terugzetten"
                    className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
