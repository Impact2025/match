export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { VacancyForm } from "@/components/organisation/vacancy-form"

export default async function NewVacancyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = session.user as { role?: string }
  if (user.role !== "ORGANISATION") redirect("/swipe")

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
    select: { status: true },
  })

  const isBlocked = !org || org.status === "PENDING_APPROVAL" || org.status === "REJECTED" || org.status === "SUSPENDED"

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/organisation/vacancies"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nieuwe vacature</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vind de perfecte vrijwilliger</p>
        </div>
      </div>

      {isBlocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              {org?.status === "PENDING_APPROVAL"
                ? "Verificatie in behandeling"
                : org?.status === "REJECTED"
                ? "Organisatie afgewezen"
                : org?.status === "SUSPENDED"
                ? "Account geschorst"
                : "Organisatie niet gevonden"}
            </p>
            <p className="text-sm text-amber-700 leading-relaxed">
              {org?.status === "PENDING_APPROVAL"
                ? "Je organisatie wacht nog op goedkeuring. Zodra ons team je account heeft geverifieerd (doorgaans 1–2 werkdagen) kun je vacatures plaatsen."
                : org?.status === "REJECTED"
                ? "Je organisatie is niet goedgekeurd. Neem contact op via support@vrijwilligersmatch.nl voor meer informatie."
                : org?.status === "SUSPENDED"
                ? "Je account is tijdelijk geschorst. Neem contact op via support@vrijwilligersmatch.nl."
                : "Er is geen organisatieprofiel gevonden. Vul eerst je organisatieprofiel in."}
            </p>
            <Link
              href="/organisation/dashboard"
              className="inline-block mt-3 text-sm font-medium text-amber-800 underline underline-offset-2"
            >
              Terug naar dashboard
            </Link>
          </div>
        </div>
      ) : (
        <VacancyForm mode="create" />
      )}
    </div>
  )
}
