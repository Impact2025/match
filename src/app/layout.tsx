import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Vrijwilligersmatch.nl — Swipe je naar impact",
    template: "%s | Vrijwilligersmatch.nl",
  },
  description:
    "De slimste manier om vrijwilligers en organisaties te verbinden. Swipe, match en maak impact.",
  keywords: ["vrijwilligerswerk", "vrijwilliger", "vacatures", "match", "organisaties"],
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
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
