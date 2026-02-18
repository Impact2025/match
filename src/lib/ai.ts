import OpenAI from "openai"

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined
}

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai

export async function generateMatchScore(
  volunteerBio: string,
  vacancyDescription: string
): Promise<number> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Je bent een expert in vrijwilligersmatching. Geef een matchscore van 0-100 terug als een enkel getal, niets anders.",
      },
      {
        role: "user",
        content: `Vrijwilliger profiel: ${volunteerBio}\n\nVacature: ${vacancyDescription}\n\nMatchscore (0-100):`,
      },
    ],
    max_tokens: 5,
  })

  const score = parseInt(response.choices[0].message.content?.trim() ?? "50")
  return isNaN(score) ? 50 : Math.min(100, Math.max(0, score))
}

export async function generateIcebreaker(
  volunteerName: string,
  vacancyTitle: string,
  orgName: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Je schrijft vriendelijke, persoonlijke openingszinnen voor vrijwilligers die contact maken met organisaties. Houd het kort (1-2 zinnen) en authentiek.",
      },
      {
        role: "user",
        content: `Schrijf een openingszin voor ${volunteerName} die solliciteert op "${vacancyTitle}" bij ${orgName}.`,
      },
    ],
    max_tokens: 100,
  })

  return (
    response.choices[0].message.content?.trim() ??
    `Hoi! Ik ben geïnteresseerd in de vacature "${vacancyTitle}".`
  )
}
