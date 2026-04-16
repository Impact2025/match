export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ActivityForm } from "@/components/activities/activity-form"

export default async function NewActivityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/organisation/activities"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nieuwe activiteit</h1>
          <p className="text-gray-500 text-sm">Bijeenkomst, workshop of evenement aanmaken</p>
        </div>
      </div>
      <ActivityForm mode="create" />
    </div>
  )
}
