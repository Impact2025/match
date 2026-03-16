export const dynamic = "force-dynamic"

import { Mail } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { BulkEmailForm } from "@/components/admin/bulk-email-form"

export default async function BulkEmailPage() {
  const gemeenten = await prisma.gemeente.findMany({
    select: { slug: true, displayName: true },
    orderBy: { displayName: "asc" },
  })

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Groepsbericht</h1>
        </div>
        <p className="text-gray-400 text-sm">Stuur een e-mail naar alle vrijwilligers, organisaties of iedereen tegelijk.</p>
      </div>

      <BulkEmailForm gemeenten={gemeenten} />
    </div>
  )
}
