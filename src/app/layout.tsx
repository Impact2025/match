import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"
import { getCurrentGemeente } from "@/lib/gemeente"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export async function generateMetadata(): Promise<Metadata> {
  const gemeente = await getCurrentGemeente()

  if (gemeente) {
    return {
      title: {
        default: `${gemeente.name} × Vrijwilligersmatch — ${gemeente.tagline}`,
        template: `%s | ${gemeente.name}`,
      },
      description: `${gemeente.tagline}. De slimste manier om vrijwilligers en organisaties in ${gemeente.displayName} te verbinden.`,
      keywords: [
        "vrijwilligerswerk",
        "vrijwilliger",
        "vacatures",
        gemeente.displayName,
        gemeente.name,
      ],
      authors: [{ name: gemeente.name }],
      openGraph: {
        type: "website",
        locale: "nl_NL",
        siteName: `${gemeente.name} × Vrijwilligersmatch`,
        title: `${gemeente.name} × Vrijwilligersmatch`,
        description: gemeente.tagline,
      },
      robots: { index: false, follow: false }, // gemeente subdomains not indexed
    }
  }

  return {
    title: {
      default: "Vrijwilligersmatch.nl — Swipe je naar impact",
      template: "%s | Vrijwilligersmatch.nl",
    },
    description:
      "De slimste manier om vrijwilligers en organisaties te verbinden. Swipe, match en maak impact.",
    keywords: [
      "vrijwilligerswerk",
      "vrijwilliger",
      "vacatures",
      "match",
      "organisaties",
    ],
    authors: [{ name: "Vrijwilligersmatch.nl" }],
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName: "Vrijwilligersmatch.nl",
      title: "Vrijwilligersmatch.nl — Swipe je naar impact",
      description:
        "De slimste manier om vrijwilligers en organisaties te verbinden.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Vrijwilligersmatch.nl",
      description: "Swipe je naar impact",
    },
    robots: { index: true, follow: true },
    manifest: "/manifest.json",
  }
}

export async function generateViewport(): Promise<Viewport> {
  const gemeente = await getCurrentGemeente()
  return {
    themeColor: gemeente?.primaryColor ?? "#f97316",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
