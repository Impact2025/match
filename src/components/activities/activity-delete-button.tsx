"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  activityId: string
}

export function ActivityDeleteButton({ activityId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze activiteit wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Activiteit verwijderd")
      router.refresh()
    } catch {
      toast.error("Fout bij verwijderen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
      title="Verwijderen"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
