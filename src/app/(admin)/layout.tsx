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
      className="flex h-screen overflow-hidden bg-[#0f0f0f]"
      style={{ fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif" }}
    >
      <AdminSidebar adminName={user?.name ?? "Admin"} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-white/[0.05] bg-[#0f0f0f]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              Admin
            </span>
          </div>
          <p className="text-white/20 text-xs uppercase tracking-widest">
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
