"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityStatus } from "@prisma/client"

interface Props {
  activityId: string
  currentStatus: ActivityStatus
}

export function ActivityStatusToggle({ activityId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isDraft = currentStatus === "DRAFT"
  const isPublished = currentStatus === "PUBLISHED"
  // Alleen DRAFT↔PUBLISHED togglebaar; afgerond/geannuleerd niet
  if (currentStatus === "CANCELLED" || currentStatus === "COMPLETED") return null

  async function toggle() {
    setLoading(true)
    try {
      const newStatus = isPublished ? "DRAFT" : "PUBLISHED"
      const res = await fetch(`/api/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(newStatus === "PUBLISHED" ? "Activiteit gepubliceerd" : "Teruggezet naar concept")
      router.refresh()
    } catch {
      toast.error("Fout bij wijzigen status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={toggle}
      disabled={loading}
      title={isDraft ? "Publiceren" : "Terugzetten naar concept"}
    >
      {isDraft ? (
        <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-green-600" />
      ) : (
        <EyeOff className="w-3.5 h-3.5 text-gray-400 hover:text-amber-600" />
      )}
    </Button>
  )
}
