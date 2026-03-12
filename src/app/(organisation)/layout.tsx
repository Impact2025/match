import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrgBottomNav } from "@/components/layout/org-bottom-nav"
import { OrgHeader } from "@/components/layout/org-header"
import { QueryProvider } from "@/components/providers/query-provider"
import { TourLauncher } from "@/components/onboarding/tour/TourLauncher"

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
      <OrgHeader userId={session.user.id!} />
      <main className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <OrgBottomNav />
      <TourLauncher tourId="organisation" />
    </QueryProvider>
  )
}
