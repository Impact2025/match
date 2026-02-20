/**
 * Semantic embedding utilities — Vrijwilligersmatch.nl
 *
 * Model: text-embedding-3-small (1536 dimensions, ~$0.02 / million tokens)
 *
 * Stage 1 retrieval flow:
 *   1. User profile text → embed → store on User.embedding (vector column)
 *   2. Vacancy text       → embed → store on Vacancy.embedding (vector column)
 *   3. At swipe time: ANN cosine search on vacancies table → top-80 candidates
 *   4. Stage 2: calculateMatchScore() on those 80 candidates → top-N returned
 *
 * Graceful fallback: if either embedding is missing, Stage 1 is skipped and
 * Stage 2 runs on the full active vacancy set (existing behaviour).
 */

import OpenAI from "openai"

// Lazy init — avoids build crash when OPENAI_API_KEY is not set
let _openai: OpenAI | null = null
function getClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export const EMBEDDING_MODEL = "text-embedding-3-small"
export const EMBEDDING_DIMS = 1536

/**
 * Generates a text embedding vector using OpenAI's embedding API.
 * Input is truncated to 8000 chars to stay well within the 8191-token limit.
 */
export async function embedText(text: string): Promise<number[]> {
  const input = text.slice(0, 8000).trim()
  if (!input) throw new Error("Cannot embed empty text")

  const res = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMS,
  })

  return res.data[0].embedding
}

/**
 * Serializes an embedding vector to the pgvector literal format.
 * Example: [0.1, -0.2, 0.3, ...]
 */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((n) => n.toFixed(8)).join(",")}]`
}

// ─── Text builders ─────────────────────────────────────────────────────────

/**
 * Builds a rich text representation of a vacancy for embedding.
 * Combines all semantic signals into a single document.
 */
export function vacancyToText(vacancy: {
  title: string
  description: string
  skills: string[]
  categories: string[]
  city?: string | null
  remote: boolean
  hours?: number | null
  duration?: string | null
}): string {
  const lines = [
    `Functie: ${vacancy.title}`,
    vacancy.description,
    vacancy.categories.length > 0 ? `Sector: ${vacancy.categories.join(", ")}` : "",
    vacancy.skills.length > 0 ? `Vaardigheden: ${vacancy.skills.join(", ")}` : "",
    vacancy.remote ? "Op afstand mogelijk" : (vacancy.city ? `Locatie: ${vacancy.city}` : ""),
    vacancy.hours ? `Tijdsinvestering: ${vacancy.hours} uur per week` : "",
    vacancy.duration ? `Duur: ${vacancy.duration}` : "",
  ].filter(Boolean)

  return lines.join("\n")
}

/**
 * Builds a rich text representation of a volunteer profile for embedding.
 */
export function volunteerToText(user: {
  name?: string | null
  bio?: string | null
  skills: string[]
  interests: string[]
  location?: string | null
}): string {
  const lines = [
    user.name ? `Vrijwilliger: ${user.name}` : "",
    user.bio ?? "",
    user.interests.length > 0 ? `Interesses: ${user.interests.join(", ")}` : "",
    user.skills.length > 0 ? `Vaardigheden: ${user.skills.join(", ")}` : "",
    user.location ? `Woonplaats: ${user.location}` : "",
  ].filter(Boolean)

  return lines.join("\n")
}
