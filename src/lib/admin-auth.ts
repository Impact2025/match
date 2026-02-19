import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

type AdminAuthResult =
  | { ok: true; adminId: string }
  | { ok: false; response: NextResponse }

export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 }),
    }
  }
  const user = session.user as { role?: string; id: string }
  if (user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Geen toegang" }, { status: 403 }),
    }
  }
  return { ok: true, adminId: user.id }
}
