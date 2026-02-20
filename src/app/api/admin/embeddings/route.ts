/**
 * Admin: Embedding generation endpoint
 *
 * GET  /api/admin/embeddings        — coverage stats (how many have embeddings)
 * POST /api/admin/embeddings        — run batch embedding generation
 * POST /api/admin/embeddings?setup  — initialise pgvector extension + vector columns
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  embedText, toVectorLiteral,
  vacancyToText, volunteerToText,
  EMBEDDING_DIMS,
} from "@/lib/embeddings"

// ── Auth helper ────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const u = session.user as { role?: string }
  return u.role === "ADMIN" ? session : null
}

// ── GET — coverage stats ───────────────────────────────────────────────────

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  try {
    const [
      totalVacancies,
      totalUsers,
      vacanciesWithEmbedding,
      usersWithEmbedding,
    ] = await Promise.all([
      prisma.vacancy.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "VOLUNTEER", onboarded: true } }),
      prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(*)::bigint as cnt FROM vacancies
        WHERE status = 'ACTIVE' AND embedding IS NOT NULL
      `.catch(() => [{ cnt: BigInt(0) }]),
      prisma.$queryRaw<[{ cnt: bigint }]>`
        SELECT COUNT(*)::bigint as cnt FROM users
        WHERE role = 'VOLUNTEER' AND onboarded = true AND embedding IS NOT NULL
      `.catch(() => [{ cnt: BigInt(0) }]),
    ])

    return NextResponse.json({
      vacancies: { total: totalVacancies, withEmbedding: Number(vacanciesWithEmbedding[0].cnt) },
      users: { total: totalUsers, withEmbedding: Number(usersWithEmbedding[0].cnt) },
    })
  } catch (error) {
    console.error("[GET_EMBEDDING_STATS_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}

// ── POST — setup or batch generate ────────────────────────────────────────

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)

  // ?setup=1 — initialise pgvector extension and add vector columns
  if (searchParams.get("setup") !== null) {
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`

      await prisma.$executeRaw`
        ALTER TABLE vacancies
        ADD COLUMN IF NOT EXISTS embedding vector(${EMBEDDING_DIMS})
      `

      await prisma.$executeRaw`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS embedding vector(${EMBEDDING_DIMS})
      `

      // IVFFlat index — efficient for cosine ANN search (build after data ingestion)
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_vacancy_embedding
        ON vacancies USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 50)
      `.catch(() => {
        // Index creation may fail if not enough rows — safe to ignore
      })

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_embedding
        ON users USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 50)
      `.catch(() => {})

      return NextResponse.json({ ok: true, message: "pgvector gereed" })
    } catch (error) {
      console.error("[PGVECTOR_SETUP_ERROR]", error)
      return NextResponse.json({ error: "Setup mislukt — is pgvector beschikbaar op deze database?" }, { status: 500 })
    }
  }

  // Batch embed — generate embeddings for vacancies and users that don't have one yet
  const results = { vacancies: { ok: 0, err: 0 }, users: { ok: 0, err: 0 } }

  // --- Vacancies ---
  const vacancies = await prisma.vacancy.findMany({
    where: { status: "ACTIVE" },
    include: {
      skills: { include: { skill: true } },
      categories: { include: { category: true } },
    },
  })

  const vacanciesNeedingEmbed = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM vacancies WHERE status = 'ACTIVE' AND embedding IS NULL
  `.catch(() => vacancies.map((v) => ({ id: v.id }))) // fallback: embed all

  const needEmbedIds = new Set(vacanciesNeedingEmbed.map((r) => r.id))

  for (const vacancy of vacancies.filter((v) => needEmbedIds.has(v.id))) {
    try {
      const text = vacancyToText({
        title: vacancy.title,
        description: vacancy.description,
        skills: vacancy.skills.map((s) => s.skill.name),
        categories: vacancy.categories.map((c) => c.category.name),
        city: vacancy.city,
        remote: vacancy.remote,
        hours: vacancy.hours,
        duration: vacancy.duration,
      })

      const embedding = await embedText(text)
      const vectorLiteral = toVectorLiteral(embedding)

      await prisma.$executeRawUnsafe(
        `UPDATE vacancies SET embedding = '${vectorLiteral}'::vector WHERE id = '${vacancy.id}'`
      )
      results.vacancies.ok++
    } catch (err) {
      console.error(`[EMBED_VACANCY_ERROR] ${vacancy.id}`, err)
      results.vacancies.err++
    }
  }

  // --- Users (volunteers) ---
  const users = await prisma.user.findMany({
    where: { role: "VOLUNTEER", onboarded: true },
    select: {
      id: true, name: true, bio: true, location: true,
      skills: { select: { skill: { select: { name: true } } } },
      interests: { select: { category: { select: { name: true } } } },
    },
  })

  const usersNeedingEmbed = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM users WHERE role = 'VOLUNTEER' AND onboarded = true AND embedding IS NULL
  `.catch(() => users.map((u) => ({ id: u.id })))

  const needUserIds = new Set(usersNeedingEmbed.map((r) => r.id))

  for (const user of users.filter((u) => needUserIds.has(u.id))) {
    try {
      const text = volunteerToText({
        name: user.name,
        bio: user.bio,
        skills: user.skills.map((s) => s.skill.name),
        interests: user.interests.map((i) => i.category.name),
        location: user.location,
      })

      const embedding = await embedText(text)
      const vectorLiteral = toVectorLiteral(embedding)

      await prisma.$executeRawUnsafe(
        `UPDATE users SET embedding = '${vectorLiteral}'::vector WHERE id = '${user.id}'`
      )
      results.users.ok++
    } catch (err) {
      console.error(`[EMBED_USER_ERROR] ${user.id}`, err)
      results.users.err++
    }
  }

  return NextResponse.json({ ok: true, results })
}
