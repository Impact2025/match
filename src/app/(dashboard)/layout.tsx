import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"
import { QueryProvider } from "@/components/providers/query-provider"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiAssistant } from "@/components/ai/ai-assistant"
import { getCurrentGemeente } from "@/lib/gemeente"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"

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

  const gemeente = await getCurrentGemeente()

  return (
    <QueryProvider>
      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b h-14"
        style={{
          borderBottomColor: gemeente
            ? `${gemeente.primaryColor}33`
            : "#f3f4f6",
        }}
      >
        <div className="flex items-center justify-between px-4 h-full max-w-lg mx-auto">
          {/* Logo / brand */}
          <Link href="/swipe" className="flex items-center gap-2.5">
            {gemeente ? (
              <>
                {/* Gemeente whitelabel badge */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm text-white font-bold text-sm select-none"
                  style={{
                    background: `linear-gradient(135deg, ${gemeente.primaryColor}, ${gemeente.accentColor})`,
                  }}
                >
                  {gemeente.displayName.charAt(0)}
                </div>
                <div className="flex flex-col leading-none">
                  <span
                    className="font-bold text-sm"
                    style={{ color: gemeente.primaryColor }}
                  >
                    {gemeente.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                    × Vrijwilligersmatch
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Global platform brand */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  Vrijwilligersmatch
                </span>
              </>
            )}
          </Link>

          {/* Avatar */}
          <Link href="/profile">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={session.user.image ?? ""}
                alt={session.user.name ?? "Profiel"}
              />
              <AvatarFallback
                className="text-xs font-bold"
                style={
                  gemeente
                    ? {
                        backgroundColor: `${gemeente.primaryColor}20`,
                        color: gemeente.primaryColor,
                      }
                    : { backgroundColor: "#ffedd5", color: "#c2410c" }
                }
              >
                {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <BottomNav gemeente={gemeente} />
      <AiAssistant mode="dashboard" />
      <TourLauncher tourId="volunteer" accentColor={gemeente?.primaryColor} />
    </QueryProvider>
  )
}
