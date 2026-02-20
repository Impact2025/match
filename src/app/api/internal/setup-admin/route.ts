import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// One-time admin setup endpoint — DELETE after use
export async function POST(req: Request) {
  const secret = req.headers.get("x-setup-secret")
  if (secret !== process.env.SETUP_SECRET && secret !== "vrijwilligersmatch-admin-setup-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const email = "admin@vrijwilligersmatch.nl"
  const password = "ZjmN8!6?a!77"
  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", password: hash, onboarded: true, name: "Admin" },
    create: { email, name: "Admin", role: "ADMIN", password: hash, onboarded: true },
    select: { id: true, email: true, role: true },
  })

  // verify
  const found = await prisma.user.findUnique({ where: { email }, select: { password: true } })
  const valid = found ? await bcrypt.compare(password, found.password!) : false

  return NextResponse.json({ user, passwordValid: valid })
}
