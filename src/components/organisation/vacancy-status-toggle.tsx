"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Pause, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VacancyStatusToggleProps {
  vacancyId: string
  currentStatus: "ACTIVE" | "PAUSED" | "DRAFT" | "CLOSED"
}

export function VacancyStatusToggle({ vacancyId, currentStatus }: VacancyStatusToggleProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)

  const mutation = useMutation({
    mutationFn: async (newStatus: "ACTIVE" | "PAUSED") => {
      const res = await fetch(`/api/vacancies/${vacancyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Status update mislukt")
      return res.json()
    },
    onSuccess: (_, newStatus) => {
      setStatus(newStatus)
      router.refresh()
    },
  })

  if (status !== "ACTIVE" && status !== "PAUSED") return null

  const isPaused = status === "PAUSED"

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 gap-1.5 text-xs font-medium ${
        isPaused
          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
          : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
      }`}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(isPaused ? "ACTIVE" : "PAUSED")}
      title={isPaused ? "Vacature activeren" : "Vacature pauzeren"}
    >
      {mutation.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPaused ? (
        <Play className="w-3.5 h-3.5" />
      ) : (
        <Pause className="w-3.5 h-3.5" />
      )}
      {isPaused ? "Activeer" : "Pauzeer"}
    </Button>
  )
}
