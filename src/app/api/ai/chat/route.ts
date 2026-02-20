import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"
import {
  buildPresaleSystemPrompt,
  buildDashboardSystemPrompt,
  type DashboardUserContext,
} from "@/lib/ai-prompts"

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
