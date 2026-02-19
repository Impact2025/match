import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"
import { QueryProvider } from "@/components/providers/query-provider"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function DashboardLayout({
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

  return (
    <QueryProvider>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14">
        <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
          <Link href="/swipe" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Vrijwilligersmatch</span>
          </Link>
          <Link href="/profile">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? "Profiel"} />
              <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </QueryProvider>
  )
}
