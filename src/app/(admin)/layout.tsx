import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/sidebar"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as { role?: string; name?: string; gemeenteSlug?: string | null } | undefined

  if (!session || (user?.role !== "ADMIN" && user?.role !== "GEMEENTE_ADMIN")) {
    redirect("/login")
  }

  const isGemeenteAdmin = user?.role === "GEMEENTE_ADMIN"
  const gemeenteSlug = user?.gemeenteSlug ?? null

  const pendingCount = isGemeenteAdmin
    ? 0
    : await prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } })

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
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-widest ${
              isGemeenteAdmin
                ? "bg-purple-50 border-purple-200 text-purple-600"
                : "bg-orange-50 border-orange-200 text-orange-500"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGemeenteAdmin ? "bg-purple-500" : "bg-orange-500"}`} />
              {isGemeenteAdmin ? "Gemeente beheer" : "Admin"}
            </span>
          </div>
          <p className="text-gray-300 text-xs uppercase tracking-widest">
            {isGemeenteAdmin ? `${gemeenteSlug ?? "Gemeente"} Beheer` : "Vrijwilligersmatch Platform"}
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
