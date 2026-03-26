import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { parseGemeenteSlug } from "@/config/gemeenten"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── Multi-tenant: detect gemeente from subdomain ──────────────────────────
  // "heemstede.vrijwilligersmatch.nl" → slug "heemstede"
  // Env var GEMEENTE_SLUG overrides for local demo / Vercel preview deployments
  const host = req.headers.get("host") ?? ""
  const gemeenteSlug =
    parseGemeenteSlug(host) ?? process.env.GEMEENTE_SLUG ?? null

  /**
   * Wraps NextResponse.next() to forward the gemeente slug as a request
   * header so that Server Components can read it via next/headers.
   */
  function next(): NextResponse {
    if (!gemeenteSlug) return NextResponse.next()
    const reqHeaders = new Headers(req.headers)
    reqHeaders.set("x-gemeente-slug", gemeenteSlug)
    return NextResponse.next({ request: { headers: reqHeaders } })
  }

  // ─────────────────────────────────────────────────────────────────────────

  const publicPaths = ["/", "/login", "/register", "/pitch", "/over-ons", "/faq", "/impact", "/kaart", "/privacy", "/voorwaarden", "/organisaties"]
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "?"),
  )
  const isOnboarding = pathname.startsWith("/onboarding")
  const isApi = pathname.startsWith("/api")
  const isAdmin = pathname.startsWith("/admin")

  // ── Onderhoudsmodus ───────────────────────────────────────────────────────
  const maintenanceMode = process.env.MAINTENANCE_MODE === "1"
  const isMaintenancePage = pathname === "/maintenance"
  if (maintenanceMode && !isMaintenancePage && !isApi && pathname !== "/login") {
    const userId = (session?.user as any)?.id as string | undefined
    const userRole = (session?.user as any)?.role as string | undefined
    const isBypassUser = userId === "1977" || userRole === "ADMIN"
    if (!isBypassUser) {
      return NextResponse.redirect(new URL("/maintenance", req.url))
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (isApi) return next()

  if (!session) {
    if (isPublic || isOnboarding) return next()
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const user = session.user as { role?: string; onboarded?: boolean }

  // Admin: bypass onboarding, enforce /admin access
  if (user.role === "ADMIN") {
    if (!isAdmin && !isPublic) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    return next()
  }

  // Non-admin trying to access admin routes
  if (isAdmin) {
    if (user.role === "ORGANISATION") {
      return NextResponse.redirect(new URL("/organisation/dashboard", req.url))
    }
    return NextResponse.redirect(new URL("/swipe", req.url))
  }

  if (!user.onboarded && !isOnboarding && !isPublic) {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  if (user.role === "ORGANISATION" && pathname.startsWith("/swipe")) {
    return NextResponse.redirect(new URL("/organisation/dashboard", req.url))
  }

  if (user.role === "VOLUNTEER" && pathname.startsWith("/organisation")) {
    return NextResponse.redirect(new URL("/swipe", req.url))
  }

  return next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|css|js)$).*)",
  ],
}
