import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Clock, Briefcase } from "lucide-react"
import { VacancyStatusBadge, UserStatusBadge } from "@/components/admin/status-badges"
import { VacancyAdminActions } from "@/components/admin/vacancy-admin-actions"
import { Breadcrumbs } from "@/components/admin/breadcrumbs"

export const dynamic = "force-dynamic"

const MATCH_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "In afwachting", color: "text-amber-600" },
  ACCEPTED:  { label: "Geaccepteerd",  color: "text-green-600" },
  REJECTED:  { label: "Afgewezen",     color: "text-red-500" },
  COMPLETED: { label: "Voltooid",      color: "text-blue-600" },
}

export default async function AdminVacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const vacancy = await prisma.vacancy.findUnique({
    where: { id },
    include: {
      organisation: true,
      skills: { include: { skill: true } },
      categories: { include: { category: true } },
      swipes: { select: { direction: true } },
      matches: {
        include: { volunteer: { select: { id: true, name: true, email: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!vacancy) notFound()

  const totalSwipes = vacancy.swipes.length
  const likeSwipes = vacancy.swipes.filter((s) => s.direction === "LIKE" || s.direction === "SUPER_LIKE").length
  const likeRate = totalSwipes > 0 ? Math.round((likeSwipes / totalSwipes) * 100) : 0

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Vacatures", href: "/admin/vacancies" },
            { label: vacancy.title },
          ]}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{vacancy.title}</h1>
            <p className="text-gray-400 text-sm mt-1">
              <Link
                href={`/admin/organisations/${vacancy.organisation.id}`}
                className="hover:text-orange-500 transition-colors"
              >
                {vacancy.organisation.name}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <VacancyStatusBadge status={vacancy.status} />
            <VacancyAdminActions vacancyId={vacancy.id} currentStatus={vacancy.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: vacancy info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Swipes totaal", value: totalSwipes.toLocaleString("nl") },
              { label: "Like-ratio", value: `${likeRate}%` },
              { label: "Matches", value: vacancy.matches.length.toLocaleString("nl") },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Omschrijving</h3>
            <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{vacancy.description}</p>
          </div>

          {/* Skills & categories */}
          {(vacancy.skills.length > 0 || vacancy.categories.length > 0) && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
              {vacancy.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vereiste vaardigheden</h3>
                  <div className="flex flex-wrap gap-2">
                    {vacancy.skills.map(({ skill }) => (
                      <span key={skill.id} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs rounded-lg">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {vacancy.categories.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Categorieën</h3>
                  <div className="flex flex-wrap gap-2">
                    {vacancy.categories.map(({ category }) => (
                      <span key={category.id} className="px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs rounded-lg">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent matches */}
          {vacancy.matches.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Recente matches (laatste 10)
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Vrijwilliger</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Status</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancy.matches.map((match, i) => {
                    const statusConfig = MATCH_STATUS_LABELS[match.status]
                    return (
                      <tr
                        key={match.id}
                        className={`${i < vacancy.matches.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                      >
                        <td className="px-6 py-3.5">
                          <Link
                            href={`/admin/users/${match.volunteer.id}`}
                            className="text-gray-600 text-sm font-medium hover:text-orange-500 transition-colors"
                          >
                            {match.volunteer.name ?? "Anoniem"}
                          </Link>
                          <p className="text-gray-400 text-xs mt-0.5">{match.volunteer.email}</p>
                        </td>
                        <td className="px-6 py-3.5 hidden md:table-cell">
                          <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <div className="mt-0.5">
                            <UserStatusBadge status={match.volunteer.status} />
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                          {match.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: meta info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Details</h3>
            <div className="space-y-3 text-sm">
              {vacancy.city && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{vacancy.city}{vacancy.postcode ? ` ${vacancy.postcode}` : ""}</span>
                </div>
              )}
              {vacancy.remote && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Remote mogelijk</span>
                </div>
              )}
              {vacancy.hours && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{vacancy.hours} uur/week</span>
                </div>
              )}
              {vacancy.duration && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{vacancy.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Aangemaakt {vacancy.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              {vacancy.updatedAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Bijgewerkt {vacancy.updatedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <Link
                href={`/admin/organisations/${vacancy.organisation.id}`}
                className="text-orange-500 text-sm hover:underline font-medium"
              >
                {vacancy.organisation.name} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
