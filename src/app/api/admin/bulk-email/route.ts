import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { z } from "zod"
import { buildBulkEmailHtml } from "@/lib/email"

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM ?? "Vrijwilligersmatch <noreply@vrijwilligersmatch.nl>"

const sendSchema = z.object({
  target: z.enum(["volunteers", "organisations", "all"]),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  gemeenteSlug: z.string().optional(),
})

async function getRecipients(
  target: "volunteers" | "organisations" | "all",
  gemeenteSlug?: string,
): Promise<{ email: string; name: string }[]> {
  const results: { email: string; name: string }[] = []

  if (target === "volunteers" || target === "all") {
    const users = await prisma.user.findMany({
      where: { role: "VOLUNTEER", status: "ACTIVE" },
      select: { email: true, name: true },
    })
    users.forEach((u) => {
      if (u.email) results.push({ email: u.email, name: u.name ?? "Vrijwilliger" })
    })
  }

  if (target === "organisations" || target === "all") {
    const where: Record<string, unknown> = { status: "APPROVED" }
    if (gemeenteSlug) where.gemeente = { slug: gemeenteSlug }
    const orgs = await prisma.organisation.findMany({
      where,
      select: { email: true, name: true },
    })
    orgs.forEach((o) => {
      if (o.email) results.push({ email: o.email, name: o.name })
    })
  }

  // Deduplicate by email address
  return Array.from(new Map(results.map((r) => [r.email, r])).values())
}

// GET — preview recipient count
export async function GET(req: NextRequest) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (!session || (user?.role !== "ADMIN" && user?.role !== "GEMEENTE_ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const target = (searchParams.get("target") ?? "volunteers") as "volunteers" | "organisations" | "all"
  const gemeenteSlug = searchParams.get("gemeente") ?? undefined

  const recipients = await getRecipients(target, gemeenteSlug)
  return NextResponse.json({ count: recipients.length })
}

// POST — send bulk email
export async function POST(req: NextRequest) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (!session || (user?.role !== "ADMIN" && user?.role !== "GEMEENTE_ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer", details: parsed.error.flatten() }, { status: 400 })
  }

  const { target, subject, message, gemeenteSlug } = parsed.data
  const recipients = await getRecipients(target, gemeenteSlug)

  if (recipients.length === 0) {
    return NextResponse.json({ error: "Geen ontvangers gevonden" }, { status: 400 })
  }

  const html = buildBulkEmailHtml(subject, message)
  const BATCH_SIZE = 100
  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    try {
      await getResend().batch.send(
        batch.map((r) => ({ from: FROM, to: r.email, subject, html }))
      )
      sent += batch.length
    } catch (err) {
      console.error(`Bulk email batch ${i}–${i + batch.length} failed:`, err)
      failed += batch.length
    }
  }

  return NextResponse.json({ sent, failed, total: recipients.length })
}
