import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OrgBottomNav } from "@/components/layout/org-bottom-nav"
import { OrgHeader } from "@/components/layout/org-header"
import { OrgSidebar } from "@/components/organisation/org-sidebar"
import { QueryProvider } from "@/components/providers/query-provider"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"
import { getCurrentGemeente } from "@/lib/gemeente"
import { AiAssistant } from "@/components/ai/ai-assistant"

export const dynamic = "force-dynamic"

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

  const [gemeente, org] = await Promise.all([
    getCurrentGemeente(),
    prisma.organisation.findUnique({
      where: { adminId: session.user.id },
      select: { name: true, logo: true },
    }),
  ])

  const gemeenteProp = gemeente
    ? {
        primaryColor: gemeente.primaryColor,
        accentColor: gemeente.accentColor ?? gemeente.primaryColor,
        name: gemeente.name,
        logoUrl: gemeente.logoUrl ?? null,
      }
    : null

  return (
    <QueryProvider>
      <div className="lg:flex lg:h-screen lg:overflow-hidden bg-gray-50">

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block lg:flex-shrink-0">
          <OrgSidebar
            orgName={org?.name ?? "Organisatie"}
            orgLogo={org?.logo}
            gemeente={gemeenteProp}
          />
        </div>

        {/* Main column */}
        <div className="flex-1 lg:flex lg:flex-col lg:overflow-hidden">

          {/* Mobile header — hidden on desktop */}
          <OrgHeader userId={session.user.id!} gemeente={gemeenteProp} />

          {/* Page content */}
          <main className="flex-1 lg:overflow-y-auto pt-14 lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </main>

          {/* Mobile bottom nav — hidden on desktop */}
          <OrgBottomNav primaryColor={gemeente?.primaryColor} />

        </div>
      </div>
      <TourLauncher tourId="organisation" />
      <AiAssistant mode="org-dashboard" color={gemeente?.primaryColor} />
    </QueryProvider>
  )
}
