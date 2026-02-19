export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VacancyDeleteButton } from "@/components/organisation/vacancy-delete-button"
import { VacancyStatusToggle } from "@/components/organisation/vacancy-status-toggle"

const STATUS_CONFIG = {
  ACTIVE: { label: "Actief", className: "bg-green-100 text-green-700" },
  DRAFT: { label: "Concept", className: "bg-gray-100 text-gray-600" },
  PAUSED: { label: "Gepauzeerd", className: "bg-amber-100 text-amber-700" },
  CLOSED: { label: "Gesloten", className: "bg-red-100 text-red-700" },
}

export default async function VacanciesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
  })

  if (!org) redirect("/onboarding")

  const vacancies = await prisma.vacancy.findMany({
    where: { organisationId: org.id },
    include: {
      _count: { select: { matches: true, swipes: true } },
      swipes: {
        where: { direction: { in: ["LIKE", "SUPER_LIKE"] } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacatures</h1>
          <p className="text-gray-500 text-sm mt-1">{vacancies.length} vacature(s)</p>
        </div>
        <Button
          asChild
          className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
        >
          <Link href="/organisation/vacancies/new">
            <PlusCircle className="w-4 h-4" />
            Nieuwe vacature
          </Link>
        </Button>
      </div>

      {vacancies.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <PlusCircle className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nog geen vacatures</h3>
          <p className="text-gray-500 text-sm">
            Maak je eerste vacature aan om vrijwilligers te vinden.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
            <Link href="/organisation/vacancies/new">Aanmaken</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vacature
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
                  Weergaves
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
                  Likes
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
                  Matches
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vacancies.map((vacancy) => {
                const statusConfig = STATUS_CONFIG[vacancy.status] ?? STATUS_CONFIG.DRAFT
                const totalSwipes = vacancy._count.swipes
                const likes = vacancy.swipes.length
                const matches = vacancy._count.matches
                const matchRate = likes > 0 ? Math.round((matches / likes) * 100) : null
                const matchRateColor =
                  matchRate == null ? "bg-gray-100 text-gray-400"
                  : matchRate >= 50 ? "bg-green-100 text-green-700"
                  : matchRate >= 20 ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
                return (
                  <tr key={vacancy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vacancy.title}</p>
                        {vacancy.city && (
                          <p className="text-xs text-gray-500 mt-0.5">{vacancy.city}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-center">
                      <span className="text-sm text-gray-600">{totalSwipes}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-center">
                      <span className="text-sm text-gray-600">{likes}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{matches}</span>
                        {matchRate != null && (
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${matchRateColor}`}>
                            {matchRate}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <VacancyStatusToggle vacancyId={vacancy.id} currentStatus={vacancy.status} />
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/organisation/vacancies/${vacancy.id}/edit`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <VacancyDeleteButton vacancyId={vacancy.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
