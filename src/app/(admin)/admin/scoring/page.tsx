export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ScoringWeightsPanel } from "@/components/admin/scoring-weights-panel"
import { DEFAULT_WEIGHTS } from "@/lib/matching/scoring-engine"
import { prisma } from "@/lib/prisma"
import type { ScoringWeights } from "@/lib/matching/scoring-engine"

async function getCurrentWeights(): Promise<ScoringWeights> {
  try {
    const rows = await prisma.$queryRaw<{ data: string }[]>`
      SELECT data FROM app_settings WHERE id = 'default' LIMIT 1
    `
    if (rows[0]?.data) {
      return { ...DEFAULT_WEIGHTS, ...JSON.parse(rows[0].data) }
    }
  } catch { /* first run */ }
  return DEFAULT_WEIGHTS
}

export default async function AdminScoringPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const u = session.user as { role?: string }
  if (u.role !== "ADMIN") redirect("/")

  const weights = await getCurrentWeights()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scoring Gewichten</h1>
        <p className="text-gray-400 text-sm mt-1">
          Pas de gewichten van het matching-algoritme aan. Wijzigingen zijn direct actief.
        </p>
      </div>
      <ScoringWeightsPanel initialWeights={weights} defaults={DEFAULT_WEIGHTS} />
    </div>
  )
}
