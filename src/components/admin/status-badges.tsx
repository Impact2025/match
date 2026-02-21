import type { OrgStatus, UserStatus, VacancyStatus } from "@prisma/client"

const ORG_STATUS_CONFIG: Record<OrgStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: "In behandeling",
    className: "bg-amber-50 border-amber-500/25 text-amber-600",
  },
  APPROVED: {
    label: "Goedgekeurd",
    className: "bg-green-50 border-green-500/25 text-green-600",
  },
  REJECTED: {
    label: "Afgewezen",
    className: "bg-red-500/10 border-red-500/25 text-red-600",
  },
  SUSPENDED: {
    label: "Geschorst",
    className: "bg-gray-500/10 border-gray-500/25 text-gray-400",
  },
}

const USER_STATUS_CONFIG: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Actief",
    className: "bg-green-50 border-green-500/25 text-green-600",
  },
  SUSPENDED: {
    label: "Geschorst",
    className: "bg-amber-50 border-amber-500/25 text-amber-600",
  },
  BANNED: {
    label: "Verbannen",
    className: "bg-red-500/10 border-red-500/25 text-red-600",
  },
}

const VACANCY_STATUS_CONFIG: Record<VacancyStatus, { label: string; className: string }> = {
  ACTIVE:  { label: "Actief",      className: "bg-green-50 border-green-500/25 text-green-600" },
  DRAFT:   { label: "Concept",     className: "bg-gray-100 border-gray-200 text-gray-400" },
  PAUSED:  { label: "Gepauzeerd",  className: "bg-amber-50 border-amber-500/25 text-amber-600" },
  CLOSED:  { label: "Gesloten",    className: "bg-gray-500/10 border-gray-500/25 text-gray-400" },
}

export function VacancyStatusBadge({ status }: { status: VacancyStatus }) {
  const config = VACANCY_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  )
}

export function OrgStatusBadge({ status }: { status: OrgStatus }) {
  const config = ORG_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const config = USER_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  )
}
