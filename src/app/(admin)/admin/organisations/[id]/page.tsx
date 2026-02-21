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
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Terug naar organisaties
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{org.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
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
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Omschrijving</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{org.description}</p>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Contactgegevens</h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: org.email ?? "—" },
                { icon: Phone, label: org.phone ?? "—" },
                { icon: MapPin, label: [org.address, org.city, org.postcode].filter(Boolean).join(", ") || "—" },
                { icon: Globe, label: org.website ?? "—", href: org.website ?? undefined },
              ].map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 hover:underline">
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          {org.categories.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Categorieën</h3>
              <div className="flex flex-wrap gap-2">
                {org.categories.map(({ category }) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-100 rounded-lg text-xs text-gray-500"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vacancies */}
          {org.vacancies.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Vacatures ({org._count.vacancies})
                </h3>
              </div>
              <table className="w-full">
                <tbody>
                  {org.vacancies.map((vacancy, i) => (
                    <tr
                      key={vacancy.id}
                      className={`${i < org.vacancies.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <td className="px-6 py-3.5">
                        <p className="text-gray-600 text-sm font-medium">{vacancy.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" />
                          {vacancy.hours ? `${vacancy.hours}u/week` : "Flexibel"}
                          {vacancy.city && ` · ${vacancy.city}`}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-gray-400 text-xs">
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
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Beheerder</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-500 text-xs font-bold">
                    {org.admin.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">{org.admin.name ?? "Onbekend"}</p>
                  <p className="text-gray-400 text-xs">{org.admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Lid sinds {org.admin.createdAt.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Rejection reason if present */}
          {org.rejectionReason && (
            <div className="bg-red-500/[0.07] border border-red-500/20 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-red-600/70 uppercase tracking-widest mb-2">Reden afwijzing</h3>
              <p className="text-gray-400 text-sm">{org.rejectionReason}</p>
            </div>
          )}

          {/* Verified at */}
          {org.verifiedAt && (
            <div className="bg-green-500/[0.07] border border-green-500/20 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-green-600/70 uppercase tracking-widest mb-2">Geverifieerd</h3>
              <p className="text-gray-400 text-sm">
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
