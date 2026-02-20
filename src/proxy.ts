import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const publicPaths = ["/", "/login", "/register"]
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))
  const isOnboarding = pathname.startsWith("/onboarding")
  const isApi = pathname.startsWith("/api")
  const isAdmin = pathname.startsWith("/admin")

  if (isApi) return NextResponse.next()

  if (!session) {
    if (isPublic || isOnboarding) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const user = session.user as { role?: string; onboarded?: boolean }

  // Admin: bypass onboarding, enforce /admin access
  if (user.role === "ADMIN") {
    if (!isAdmin && !isPublic) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    return NextResponse.next()
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

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|css|js)$).*)"],
}
