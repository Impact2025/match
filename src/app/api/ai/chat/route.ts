import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import {
  buildPresaleSystemPrompt,
  buildDashboardSystemPrompt,
  buildOrgDashboardSystemPrompt,
  buildGemeenteDashboardSystemPrompt,
  type DashboardUserContext,
  type OrgDashboardContext,
  type GemeenteDashboardContext,
} from "@/lib/ai-prompts"
import { CATEGORY_SDG_MAP, SDG_DEFINITIONS, IMPACT_CONSTANTS } from "@/config/sdg"

const MODEL = "google/gemini-2.0-flash-001"

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai)
    _openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  return _openai
}

// Rate limiting: 20 messages per 5 minutes per key
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 5 * 60 * 1000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

export async function POST(req: Request) {
  const session = await auth()

  // Rate limit key: userId for logged-in, "anon:IP" for anonymous
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  const rateLimitKey = session?.user?.id ?? `anon:${ip}`

  if (!checkRateLimit(rateLimitKey)) {
    return new Response(
      JSON.stringify({ error: "Te veel berichten. Probeer het over 5 minuten opnieuw." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    )
  }

  let body: { messages: Array<{ role: string; content: string }>; mode: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Ongeldig verzoek" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages, mode } = body
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages is verplicht" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Build system prompt
  let systemPrompt: string

  if (mode === "dashboard" && session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { category: true } },
      },
    })

    if (user) {
      const ctx: DashboardUserContext = {
        name: user.name ?? "Vrijwilliger",
        bio: user.bio,
        location: user.location,
        postcode: user.postcode,
        maxDistance: user.maxDistance ?? 25,
        skills: user.skills.map((s) => s.skill.name),
        interests: user.interests.map((i) => i.category.name),
        motivationProfile: user.motivationProfile,
        schwartzProfile: user.schwartzProfile ?? null,
        availability: (() => {
          if (!user.availability) return []
          try { return JSON.parse(user.availability) as string[] } catch { return [] }
        })(),
        openToInvitations: user.openToInvitations ?? true,
      }
      systemPrompt = buildDashboardSystemPrompt(ctx)
    } else {
      systemPrompt = buildPresaleSystemPrompt()
    }
  } else if (mode === "org-dashboard" && session?.user?.id) {
    const org = await prisma.organisation.findUnique({
      where: { adminId: session.user.id },
      include: {
        vacancies: {
          where: { status: "ACTIVE" },
          include: { _count: { select: { swipes: true } } },
        },
      },
    })

    if (org) {
      const allMatches = await prisma.match.findMany({
        where: { vacancy: { organisationId: org.id } },
        select: { status: true },
      })
      const pendingMatches = allMatches.filter((m) => m.status === "PENDING").length
      const acceptedMatches = allMatches.filter((m) => m.status === "ACCEPTED").length
      const matchRate =
        allMatches.length > 0
          ? Math.round((acceptedMatches / allMatches.length) * 100)
          : 0
      const totalSwipes = org.vacancies.reduce((s, v) => s + v._count.swipes, 0)
      const vacanciesWithNoSwipes = org.vacancies
        .filter((v) => v._count.swipes === 0)
        .map((v) => v.title)

      const orgSla = await prisma.organisation.findUnique({
        where: { id: org.id },
        select: { avgResponseHours: true, slaScore: true },
      })

      const ctx: OrgDashboardContext = {
        orgName: org.name,
        description: org.description,
        status: org.status,
        activeVacancies: org.vacancies.length,
        vacanciesWithNoSwipes,
        pendingMatches,
        acceptedMatches,
        matchRate,
        avgResponseHours: orgSla?.avgResponseHours ?? null,
        slaScore: orgSla?.slaScore ?? null,
        totalSwipes,
      }
      systemPrompt = buildOrgDashboardSystemPrompt(ctx)
    } else {
      systemPrompt = buildPresaleSystemPrompt()
    }
  } else if (mode === "gemeente-dashboard" && session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, gemeenteSlug: true },
    })

    const slug = dbUser?.gemeenteSlug
    if (dbUser?.role === "GEMEENTE_ADMIN" && slug) {
      const gemeente = await prisma.gemeente.findUnique({
        where: { slug },
        select: { id: true, name: true, displayName: true },
      })

      if (gemeente) {
        const gid = gemeente.id

        const [orgCount, pendingOrgCount, vacancyCount, allMatches, matchesWithCats] =
          await Promise.all([
            prisma.organisation.count({ where: { status: "APPROVED", gemeenteId: gid } }),
            prisma.organisation.count({ where: { status: "PENDING_APPROVAL", gemeenteId: gid } }),
            prisma.vacancy.count({ where: { status: "ACTIVE", organisation: { gemeenteId: gid } } }),
            prisma.match.findMany({
              where: { vacancy: { organisation: { gemeenteId: gid } } },
              select: { status: true, startedAt: true, checkIn12SentAt: true },
            }),
            prisma.match.findMany({
              where: {
                status: { in: ["ACCEPTED", "COMPLETED"] },
                vacancy: { organisation: { gemeenteId: gid } },
              },
              select: {
                status: true,
                startedAt: true,
                vacancy: {
                  select: {
                    hours: true,
                    categories: { select: { category: { select: { name: true } } } },
                  },
                },
              },
            }),
          ])

        const acceptedCount = allMatches.filter((m) => m.status === "ACCEPTED").length
        const completedCount = allMatches.filter((m) => m.status === "COMPLETED").length
        const fulfilledMatches = acceptedCount + completedCount
        const checkIn12Count = allMatches.filter((m) => m.checkIn12SentAt !== null).length
        const retentionWeek12 =
          fulfilledMatches > 0 ? Math.round((checkIn12Count / fulfilledMatches) * 100) : 0

        let totalHours = 0
        const sdgHours = new Map<number, number>()
        for (const m of matchesWithCats) {
          const h = m.vacancy.hours ?? 2
          const wks = m.status === "COMPLETED"
            ? IMPACT_CONSTANTS.AVG_COMPLETED_WEEKS
            : m.startedAt
            ? Math.min(
                (Date.now() - m.startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
                IMPACT_CONSTANTS.MAX_ACTIVE_WEEKS,
              )
            : IMPACT_CONSTANTS.DEFAULT_ACCEPTED_WEEKS
          const hrs = h * Math.max(wks, 1)
          totalHours += hrs

          const cats = m.vacancy.categories.map((c) => c.category.name)
          const sdgs = new Set<number>()
          for (const cat of cats) (CATEGORY_SDG_MAP[cat] ?? []).forEach((n) => sdgs.add(n))
          const share = sdgs.size > 0 ? hrs / sdgs.size : 0
          for (const n of sdgs) sdgHours.set(n, (sdgHours.get(n) ?? 0) + share)
        }

        const economicValue = Math.round(totalHours * IMPACT_CONSTANTS.HOURLY_VALUE_EUR)
        const sroiValue = Math.round(economicValue * IMPACT_CONSTANTS.SROI_MULTIPLIER)

        const topSdgs = SDG_DEFINITIONS
          .filter((s) => sdgHours.has(s.number))
          .sort((a, b) => (sdgHours.get(b.number) ?? 0) - (sdgHours.get(a.number) ?? 0))
          .slice(0, 3)
          .map((s) => s.nameNl)

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const newMatchesThisMonth = await prisma.match.count({
          where: { vacancy: { organisation: { gemeenteId: gid } }, createdAt: { gte: startOfMonth } },
        })

        const ctx: GemeenteDashboardContext = {
          gemeenteName: gemeente.name,
          displayName: gemeente.displayName,
          totaalOrganisaties: orgCount,
          pendingOrganisaties: pendingOrgCount,
          totaalVacatures: vacancyCount,
          totaalMatches: allMatches.length,
          fulfilledMatches,
          newMatchesThisMonth,
          retentionWeek12,
          totalHours: Math.round(totalHours),
          economicValue,
          sroiValue,
          topSdgs,
        }
        systemPrompt = buildGemeenteDashboardSystemPrompt(ctx)
      } else {
        systemPrompt = buildPresaleSystemPrompt()
      }
    } else {
      systemPrompt = buildPresaleSystemPrompt()
    }
  } else {
    systemPrompt = buildPresaleSystemPrompt()
  }

  // Keep last 10 messages to avoid huge context
  const trimmedMessages = messages.slice(-10)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await getOpenAI().chat.completions.create({
          model: MODEL,
          stream: true,
          max_tokens: 600,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            ...trimmedMessages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ],
        })

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
            )
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      } catch (err) {
        console.error("[AI_CHAT_ERROR]", err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Er is een fout opgetreden. Probeer het opnieuw." })}\n\n`
          )
        )
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
