import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Globe, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react"
import { OrgStatusBadge } from "@/components/admin/status-badges"
import { OrgActionForm } from "./org-action-form"

export const dynamic = "force-dynamic"

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const org = await prisma.organisation.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, name: true, email: true, createdAt: true } },
      categories: { include: { category: true } },
      vacancies: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { matches: true, swipes: true } } },
      },
      _count: { select: { vacancies: true } },
    },
  })

  if (!org) notFound()

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/organisations"
          className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Terug naar organisaties
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{org.name}</h1>
            <p className="text-white/35 text-sm mt-1">
              Aangemeld op {org.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <OrgStatusBadge status={org.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: org info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {org.description && (
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Omschrijving</h3>
              <p className="text-white/65 text-sm leading-relaxed">{org.description}</p>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Contactgegevens</h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: org.email ?? "—" },
                { icon: Phone, label: org.phone ?? "—" },
                { icon: MapPin, label: [org.address, org.city, org.postcode].filter(Boolean).join(", ") || "—" },
                { icon: Globe, label: org.website ?? "—", href: org.website ?? undefined },
              ].map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#FF6B35] hover:underline">
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm text-white/55">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          {org.categories.length > 0 && (
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Categorieën</h3>
              <div className="flex flex-wrap gap-2">
                {org.categories.map(({ category }) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/60"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vacancies */}
          {org.vacancies.length > 0 && (
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05]">
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                  Vacatures ({org._count.vacancies})
                </h3>
              </div>
              <table className="w-full">
                <tbody>
                  {org.vacancies.map((vacancy, i) => (
                    <tr
                      key={vacancy.id}
                      className={`${i < org.vacancies.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                    >
                      <td className="px-6 py-3.5">
                        <p className="text-white/75 text-sm font-medium">{vacancy.title}</p>
                        <p className="text-white/30 text-xs mt-0.5 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" />
                          {vacancy.hours ? `${vacancy.hours}u/week` : "Flexibel"}
                          {vacancy.city && ` · ${vacancy.city}`}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-white/30 text-xs">
                          {vacancy._count.matches} matches · {vacancy._count.swipes} swipes
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right col: account info + action form */}
        <div className="space-y-6">
          {/* Account info */}
          <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Beheerder</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6B35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#FF6B35] text-xs font-bold">
                    {org.admin.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                </div>
                <div>
                  <p className="text-white/75 text-sm font-medium">{org.admin.name ?? "Onbekend"}</p>
                  <p className="text-white/35 text-xs">{org.admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Lid sinds {org.admin.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Rejection reason if present */}
          {org.rejectionReason && (
            <div className="bg-red-500/[0.07] border border-red-500/20 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-2">Reden afwijzing</h3>
              <p className="text-white/50 text-sm">{org.rejectionReason}</p>
            </div>
          )}

          {/* Verified at */}
          {org.verifiedAt && (
            <div className="bg-green-500/[0.07] border border-green-500/20 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-green-400/70 uppercase tracking-widest mb-2">Geverifieerd</h3>
              <p className="text-white/50 text-sm">
                {org.verifiedAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}

          {/* Action form */}
          <OrgActionForm orgId={org.id} currentStatus={org.status} />
        </div>
      </div>
    </div>
  )
}
