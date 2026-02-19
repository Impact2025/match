import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrgBottomNav } from "@/components/layout/org-bottom-nav"
import { QueryProvider } from "@/components/providers/query-provider"
import Link from "next/link"
import { Heart, Bell } from "lucide-react"

export default async function OrganisationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user as { role?: string; onboarded?: boolean }

  if (!user.onboarded) {
    redirect("/onboarding")
  }

  if (user.role === "VOLUNTEER") {
    redirect("/swipe")
  }

  return (
    <QueryProvider>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14">
        <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
          <Link href="/organisation/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Vrijwilligersmatch</span>
          </Link>
          <button className="relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <OrgBottomNav />
    </QueryProvider>
  )
}
