import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Activity, GitMerge, MousePointerClick } from "lucide-react"
import { UserStatusBadge, VacancyStatusBadge } from "@/components/admin/status-badges"
import { UserActionButton } from "@/components/admin/user-action-button"
import { Breadcrumbs } from "@/components/admin/breadcrumbs"

export const dynamic = "force-dynamic"

const MATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: "In afwachting",
  ACCEPTED: "Geaccepteerd",
  REJECTED: "Afgewezen",
  COMPLETED: "Voltooid",
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { category: true } },
      swipesGiven: { select: { direction: true }, orderBy: { createdAt: "desc" }, take: 1000 },
      matchesAsVol: {
        include: {
          vacancy: { include: { organisation: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          swipesGiven: true,
          matchesAsVol: true,
          conversations: true,
        },
      },
    },
  })

  if (!user) notFound()

  const totalSwipes = user._count.swipesGiven
  const likeSwipes = user.swipesGiven.filter((s) => s.direction === "LIKE" || s.direction === "SUPER_LIKE").length
  const likeRate = totalSwipes > 0 ? Math.round((likeSwipes / totalSwipes) * 100) : 0

  const acceptedMatches = user.matchesAsVol.filter((m) => m.status === "ACCEPTED" || m.status === "COMPLETED").length

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Gebruikers", href: "/admin/users" },
            { label: user.name ?? user.email ?? id },
          ]}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {user.name ?? "Anoniem"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <UserStatusBadge status={user.status} />
            <UserActionButton userId={user.id} currentStatus={user.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Swipes", value: totalSwipes.toLocaleString("nl"), icon: MousePointerClick, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Matches", value: user._count.matchesAsVol.toLocaleString("nl"), icon: GitMerge, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Gesprekken", value: user._count.conversations.toLocaleString("nl"), icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Bio</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Skills & interests */}
          {(user.skills.length > 0 || user.interests.length > 0) && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
              {user.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vaardigheden</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(({ skill }) => (
                      <span key={skill.id} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs rounded-lg">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.interests.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Interesses</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map(({ category }) => (
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
          {user.matchesAsVol.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Recente matches (laatste 10)
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Vacature</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden md:table-cell">Organisatie</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {user.matchesAsVol.map((match, i) => (
                    <tr
                      key={match.id}
                      className={`${i < user.matchesAsVol.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/admin/vacancies/${match.vacancy.id}`}
                          className="text-gray-600 text-sm font-medium hover:text-orange-500 transition-colors"
                        >
                          {match.vacancy.title}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <Link
                          href={`/admin/organisations/${match.vacancy.organisation.id}`}
                          className="text-gray-400 text-sm hover:text-orange-500 transition-colors"
                        >
                          {match.vacancy.organisation.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <VacancyStatusBadge status={match.vacancy.status} />
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                        {match.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                        <p className="text-gray-300 text-[11px]">{MATCH_STATUS_LABELS[match.status]}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: account info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Lid sinds {user.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {user.lastActiveDate && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Actief op {user.lastActiveDate.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              )}
              {user.postcode && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{user.postcode}{user.maxDistance ? ` · max. ${user.maxDistance} km` : ""}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Rol</span>
                <span className="text-gray-600 font-medium">
                  {user.role === "VOLUNTEER" ? "Vrijwilliger" : "Organisatie"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Onboarding</span>
                <span className={user.onboarded ? "text-green-600 font-medium" : "text-gray-300"}>
                  {user.onboarded ? "Voltooid" : "Niet voltooid"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Like-ratio</span>
                <span className="text-gray-600 font-medium">{likeRate}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Actieve matches</span>
                <span className="text-gray-600 font-medium">{acceptedMatches}</span>
              </div>
              {user.streakDays > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Streak</span>
                  <span className="text-orange-500 font-medium">{user.streakDays} dagen 🔥</span>
                </div>
              )}
            </div>
          </div>

          {user.availability && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Beschikbaarheid</h3>
              <div className="flex flex-wrap gap-1.5">
                {(JSON.parse(user.availability) as string[]).map((a) => (
                  <span key={a} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
