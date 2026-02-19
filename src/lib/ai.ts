import OpenAI from "openai"

// Lazy init — avoids build-time error when env var is not yet set
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export async function generateMatchScore(
  volunteerBio: string,
  vacancyDescription: string
): Promise<number> {
  const response = await getOpenAI().chat.completions.create({
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

export async function generateOrgDescription(
  orgName: string,
  categories: string[]
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Je schrijft professionele, warme beschrijvingen voor vrijwilligersorganisaties op een Nederlands platform. De beschrijving is in het Nederlands, 2-3 zinnen, en spreekt potentiële vrijwilligers aan. Gebruik geen moeilijke woorden en maak het persoonlijk en uitnodigend.",
        },
        {
          role: "user",
          content: `Schrijf een organisatiebeschrijving voor "${orgName}", actief in: ${categories.join(", ")}.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    })

    return (
      response.choices[0].message.content?.trim() ??
      `${orgName} is een actieve organisatie die vrijwilligers inzet voor ${categories.join(", ")}.`
    )
  } catch {
    return `${orgName} is een actieve organisatie die vrijwilligers inzet voor ${categories.join(", ")}.`
  }
}

export async function generateIcebreaker(
  volunteerName: string,
  vacancyTitle: string,
  orgName: string
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
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
