import { getCurrentGemeente } from "@/lib/gemeente"
import { GemeenteBrandProvider, type BrandValue } from "@/components/gemeente-brand-provider"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const gemeente = await getCurrentGemeente()

  const value: BrandValue = {
    brand: gemeente?.primaryColor ?? "#f97316",
    brandAccent: gemeente?.accentColor ?? gemeente?.primaryColor ?? "#fb923c",
    name: gemeente?.displayName ?? "Vrijwilligersmatch",
    tagline: gemeente?.tagline ?? null,
  }

  return (
    <GemeenteBrandProvider value={value}>
      {children}
    </GemeenteBrandProvider>
  )
}
