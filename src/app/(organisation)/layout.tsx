import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrgBottomNav } from "@/components/layout/org-bottom-nav"
import { OrgHeader } from "@/components/layout/org-header"
import { QueryProvider } from "@/components/providers/query-provider"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"
import { getCurrentGemeente } from "@/lib/gemeente"

export const dynamic = "force-dynamic"

export default async function OrganisationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, gemeente] = await Promise.all([auth(), getCurrentGemeente()])

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

  const gemeenteProp = gemeente
    ? {
        primaryColor: gemeente.primaryColor,
        accentColor: gemeente.accentColor ?? gemeente.primaryColor,
        name: gemeente.name,
        logoUrl: gemeente.logoUrl,
      }
    : null

  return (
    <QueryProvider>
      <OrgHeader userId={session.user.id!} gemeente={gemeenteProp} />
      <main className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <OrgBottomNav primaryColor={gemeente?.primaryColor} />
      <TourLauncher tourId="organisation" />
    </QueryProvider>
  )
}
