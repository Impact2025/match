import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as { role?: string; name?: string } | undefined

  if (!session || user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif" }}
    >
      <AdminSidebar adminName={user?.name ?? "Admin"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-500 text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Admin
            </span>
          </div>
          <p className="text-gray-300 text-xs uppercase tracking-widest">
            Vrijwilligersmatch Platform
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
