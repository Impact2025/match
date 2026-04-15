import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/sidebar"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"
import { getCurrentGemeente } from "@/lib/gemeente"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as { role?: string; name?: string; gemeenteSlug?: string | null } | undefined

  if (!session || (user?.role !== "ADMIN" && user?.role !== "GEMEENTE_ADMIN")) {
    redirect("/login")
  }

  const isGemeenteAdmin = user?.role === "GEMEENTE_ADMIN"
  const gemeenteSlug = user?.gemeenteSlug ?? null

  const [pendingCount, gemeente] = await Promise.all([
    isGemeenteAdmin
      ? Promise.resolve(0)
      : prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } }),
    isGemeenteAdmin ? getCurrentGemeente() : Promise.resolve(null),
  ])

  // Badge colors: use gemeente primaryColor for gemeente admins, orange for platform admins
  const badgeColor = isGemeenteAdmin ? (gemeente?.primaryColor ?? "#7c3aed") : "#f97316"
  const badgeBg = `${badgeColor}14`
  const badgeBorder = `${badgeColor}33`

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif" }}
    >
      <AdminSidebar
        adminName={user?.name ?? "Beheerder"}
        pendingCount={pendingCount}
        role={user?.role ?? "ADMIN"}
        gemeenteSlug={gemeenteSlug}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: badgeBg, borderColor: badgeBorder, color: badgeColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: badgeColor }}
              />
              {isGemeenteAdmin ? "Gemeente beheer" : "Admin"}
            </span>
          </div>
          <p className="text-gray-300 text-xs uppercase tracking-widest">
            {isGemeenteAdmin ? `${gemeente?.displayName ?? gemeenteSlug ?? "Gemeente"} Beheer` : "Vrijwilligersmatch Platform"}
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      {!isGemeenteAdmin && <TourLauncher tourId="admin" />}
    </div>
  )
}
