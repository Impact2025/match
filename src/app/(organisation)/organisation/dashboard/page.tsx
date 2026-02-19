export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Users,
  MessageCircle,
  Eye,
  TrendingUp,
  Plus,
  MoreVertical,
  Briefcase,
  Calendar,
  Landmark,
  Bell,
  Clock,
  Award,
} from "lucide-react"

export default async function OrgDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
    include: {
      vacancies: {
        where: { status: "ACTIVE" },
        include: {
          _count: { select: { swipes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    // select avgResponseHours and slaScore via top-level include
  })

  // Fetch SLA fields separately as a plain select
  const orgSla = await prisma.organisation.findUnique({
    where: { adminId: session.user.id },
    select: { avgResponseHours: true, slaScore: true },
  })

  if (!org) redirect("/onboarding")

  const allMatches = await prisma.match.findMany({
    where: { vacancy: { organisationId: org.id } },
  })

  const newMatches = allMatches.filter((m) => m.status === "PENDING").length
  const acceptedMatches = allMatches.filter((m) => m.status === "ACCEPTED").length
  const matchRate =
    allMatches.length > 0
      ? Math.round((acceptedMatches / allMatches.length) * 100)
      : 0

  // Count active conversations (approx via accepted matches)
  const activeChats = acceptedMatches

  // Profile views approximation (total swipes on all vacancies)
  const totalSwipes = org.vacancies.reduce((sum, v) => sum + v._count.swipes, 0)

  const avgResponseDisplay = orgSla?.avgResponseHours != null
    ? `${Math.round(orgSla.avgResponseHours)}u`
    : "—"
  const responseIsSlow = orgSla?.avgResponseHours != null && orgSla.avgResponseHours > 48
  const slaScoreValue = orgSla?.slaScore ?? 100
  const slaIsLow = slaScoreValue < 70

  const stats = [
    {
      label: "Nieuwe matches",
      sublabel: "NIEUW",
      value: newMatches,
      icon: Users,
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
      textColor: "text-orange-600",
      warning: null,
    },
    {
      label: "Actieve chats",
      sublabel: "LIVE",
      value: activeChats,
      icon: MessageCircle,
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-blue-600",
      warning: null,
    },
    {
      label: "Profielweergaven",
      sublabel: "BEREIK",
      value: totalSwipes,
      icon: Eye,
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
      textColor: "text-purple-600",
      warning: null,
    },
    {
      label: "Match rate",
      sublabel: "SUCCES",
      value: `${matchRate}%`,
      icon: TrendingUp,
      bg: "bg-green-50",
      iconColor: "text-green-500",
      textColor: "text-green-600",
      warning: null,
    },
    {
      label: "Gem. responstijd",
      sublabel: "SLA",
      value: avgResponseDisplay,
      icon: Clock,
      bg: responseIsSlow ? "bg-red-50" : "bg-teal-50",
      iconColor: responseIsSlow ? "text-red-500" : "text-teal-500",
      textColor: responseIsSlow ? "text-red-600" : "text-teal-600",
      warning: responseIsSlow ? "Reageer sneller dan 48u" : null,
    },
    {
      label: "Onboarding Score",
      sublabel: "SCORE",
      value: `${slaScoreValue}`,
      icon: Award,
      bg: slaIsLow ? "bg-amber-50" : "bg-emerald-50",
      iconColor: slaIsLow ? "text-amber-500" : "text-emerald-500",
      textColor: slaIsLow ? "text-amber-600" : "text-emerald-600",
      warning: slaIsLow ? "Verbeter je responstijd" : null,
    },
  ]

  const VACANCY_ICONS = [Briefcase, Calendar, Landmark]

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Actief",
    PAUSED: "Pauze",
    CLOSED: "Gesloten",
    DRAFT: "Concept",
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

      {/* Pending approval notice */}
      {org.status === "PENDING_APPROVAL" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Verificatie in behandeling</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Je organisatie wacht op goedkeuring van ons team. Je vacatures worden zichtbaar voor vrijwilligers zodra de verificatie is afgerond — dit duurt doorgaans 1–2 werkdagen.
            </p>
          </div>
        </div>
      )}

      {/* Suspended notice */}
      {org.status === "SUSPENDED" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">Account geschorst</p>
            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
              Je account is tijdelijk geschorst. Neem contact op via{" "}
              <a href="mailto:support@vrijwilligersmatch.nl" className="underline">
                support@vrijwilligersmatch.nl
              </a>{" "}
              voor meer informatie.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisatie Portal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vrijwilligersmatch.nl</p>
        </div>
        {newMatches > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            {newMatches} nieuwe matches
          </div>
        )}
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl p-4 space-y-2`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                <span className={`text-[10px] font-bold tracking-widest ${stat.textColor}`}>
                  {stat.sublabel}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className={`text-xs font-medium ${stat.textColor}`}>{stat.label}</div>
              {stat.warning && (
                <p className="text-[10px] text-red-500 leading-tight">{stat.warning}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Vacancies section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Mijn Vacatures</h2>
          <Link
            href="/organisation/vacancies"
            className="text-sm text-orange-500 font-medium hover:text-orange-600 flex items-center gap-0.5"
          >
            Alles bekijken
            <span className="text-base leading-none ml-0.5">›</span>
          </Link>
        </div>

        <div className="space-y-2">
          {org.vacancies.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">
                Nog geen actieve vacatures. Maak er een aan!
              </p>
            </div>
          ) : (
            org.vacancies.slice(0, 5).map((vacancy, i) => {
              const Icon = VACANCY_ICONS[i % VACANCY_ICONS.length]
              const statusLabel = STATUS_LABELS[vacancy.status] ?? vacancy.status
              return (
                <div
                  key={vacancy.id}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-gray-100 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {vacancy.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Status:{" "}
                      <span
                        className={
                          vacancy.status === "ACTIVE" ? "text-green-600" : "text-gray-500"
                        }
                      >
                        {statusLabel}
                      </span>
                      {" "}•{" "}
                      {vacancy._count.swipes} aanmeldingen
                    </p>
                  </div>
                  <Link
                    href={`/organisation/vacancies/${vacancy.id}/edit`}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CTA button */}
      <Link
        href="/organisation/vacancies/new"
        className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl transition-colors shadow-md"
      >
        <Plus className="w-5 h-5" />
        Nieuwe vacature plaatsen
      </Link>
    </div>
  )
}
