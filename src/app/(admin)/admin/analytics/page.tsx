export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Activity, Heart, GitMerge, CheckCircle, Clock, BarChart2, TrendingUp, Cpu } from "lucide-react"

async function getEmbeddingCoverage() {
  try {
    const [vacancyTotal, vacancyEmbedded, userTotal, userEmbedded] = await Promise.all([
      prisma.vacancy.count({ where: { status: "ACTIVE" } }),
      prisma.$queryRaw<[{ cnt: bigint }]>`SELECT COUNT(*)::bigint as cnt FROM vacancies WHERE status='ACTIVE' AND embedding IS NOT NULL`,
      prisma.user.count({ where: { role: "VOLUNTEER", onboarded: true } }),
      prisma.$queryRaw<[{ cnt: bigint }]>`SELECT COUNT(*)::bigint as cnt FROM users WHERE role='VOLUNTEER' AND onboarded=true AND embedding IS NOT NULL`,
    ])
    return {
      vacancies: { total: vacancyTotal, embedded: Number(vacancyEmbedded[0].cnt) },
      users: { total: userTotal, embedded: Number(userEmbedded[0].cnt) },
      available: true,
    }
  } catch {
    return { available: false, vacancies: { total: 0, embedded: 0 }, users: { total: 0, embedded: 0 } }
  }
}

async function getAnalytics() {
  const [
    totalSwipes,
    likeSwipes,
    dislikeSwipes,
    superLikeSwipes,
    totalMatches,
    pendingMatches,
    acceptedMatches,
    rejectedMatches,
    completedMatches,
    matchesWithCheckIn1,
    matchesWithCheckIn4,
    matchesWithCheckIn12,
    matchReasonCounts,
    swipeScoreData,
  ] = await Promise.all([
    prisma.swipe.count(),
    prisma.swipe.count({ where: { direction: "LIKE" } }),
    prisma.swipe.count({ where: { direction: "DISLIKE" } }),
    prisma.swipe.count({ where: { direction: "SUPER_LIKE" } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "PENDING" } }),
    prisma.match.count({ where: { status: "ACCEPTED" } }),
    prisma.match.count({ where: { status: "REJECTED" } }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count({ where: { checkIn1SentAt: { not: null } } }),
    prisma.match.count({ where: { checkIn4SentAt: { not: null } } }),
    prisma.match.count({ where: { checkIn12SentAt: { not: null } } }),
    prisma.swipe.groupBy({
      by: ["matchReason"],
      where: { direction: { in: ["LIKE", "SUPER_LIKE"] }, matchReason: { not: null } },
      _count: { matchReason: true },
      orderBy: { _count: { matchReason: "desc" } },
    }),
    // Avg score components from stored snapshots
    prisma.$queryRaw<{ dir: string; avg_total: number; avg_motivation: number; avg_distance: number; avg_skill: number; avg_freshness: number; cnt: number }[]>`
      SELECT
        direction as dir,
        COUNT(*)::int as cnt,
        AVG(CAST(score_snapshot::json->>'total' AS FLOAT))::float as avg_total,
        AVG(CAST(score_snapshot::json->>'motivation' AS FLOAT))::float as avg_motivation,
        AVG(CAST(score_snapshot::json->>'distance' AS FLOAT))::float as avg_distance,
        AVG(CAST(score_snapshot::json->>'skill' AS FLOAT))::float as avg_skill,
        AVG(CAST(score_snapshot::json->>'freshness' AS FLOAT))::float as avg_freshness
      FROM swipes
      WHERE score_snapshot IS NOT NULL
      GROUP BY direction
    `,
  ])

  const likeRate = totalSwipes > 0 ? ((likeSwipes + superLikeSwipes) / totalSwipes) * 100 : 0
  const matchToAcceptRate = totalMatches > 0 ? (acceptedMatches / totalMatches) * 100 : 0
  const retentionWeek12Rate = acceptedMatches > 0 ? (matchesWithCheckIn12 / acceptedMatches) * 100 : 0

  // Map score data by direction
  const byDir = Object.fromEntries(swipeScoreData.map((r) => [r.dir, r]))

  return {
    totalSwipes, likeSwipes, dislikeSwipes, superLikeSwipes,
    totalMatches, pendingMatches, acceptedMatches, rejectedMatches, completedMatches,
    matchesWithCheckIn1, matchesWithCheckIn4, matchesWithCheckIn12,
    matchReasonCounts,
    likeRate, matchToAcceptRate, retentionWeek12Rate,
    scoreByDir: byDir,
    hasScoreData: swipeScoreData.length > 0,
  }
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 space-y-4">
      <div className={`w-9 h-9 rounded-lg bg-${color}-400/10 border border-${color}-400/20 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}-400`} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-white/25 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70 font-semibold">{value.toLocaleString("nl")} <span className="text-white/30 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-${color}-400`}
          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  )
}

function ScoreRow({ label, likeAvg, dislikeAvg }: { label: string; likeAvg?: number; dislikeAvg?: number }) {
  if (likeAvg === undefined && dislikeAvg === undefined) return null
  const diff = (likeAvg ?? 0) - (dislikeAvg ?? 0)
  const isPositive = diff > 0
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="py-3 px-4 text-sm text-white/60">{label}</td>
      <td className="py-3 px-4 text-sm text-right text-green-400 font-mono">
        {likeAvg != null ? likeAvg.toFixed(1) : "—"}
      </td>
      <td className="py-3 px-4 text-sm text-right text-red-400 font-mono">
        {dislikeAvg != null ? dislikeAvg.toFixed(1) : "—"}
      </td>
      <td className="py-3 px-4 text-sm text-right font-mono">
        {likeAvg != null && dislikeAvg != null ? (
          <span className={isPositive ? "text-green-400" : "text-red-400"}>
            {isPositive ? "+" : ""}{diff.toFixed(1)}
          </span>
        ) : "—"}
      </td>
    </tr>
  )
}

export default async function AnalyticsPage() {
  const [d, emb] = await Promise.all([getAnalytics(), getEmbeddingCoverage()])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Matching Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Outcome-tracking en score-correlaties voor het matching algoritme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Like-ratio" value={`${d.likeRate.toFixed(1)}%`} sub={`${(d.likeSwipes + d.superLikeSwipes).toLocaleString("nl")} / ${d.totalSwipes.toLocaleString("nl")} swipes`} icon={Heart} color="pink" />
        <StatCard label="Match-acceptatie" value={`${d.matchToAcceptRate.toFixed(1)}%`} sub={`${d.acceptedMatches} geaccepteerd van ${d.totalMatches}`} icon={GitMerge} color="green" />
        <StatCard label="Actieve matches" value={d.acceptedMatches} sub={`${d.pendingMatches} in behandeling`} icon={Activity} color="blue" />
        <StatCard label="Retentie week 12" value={`${d.retentionWeek12Rate.toFixed(1)}%`} sub={`${d.matchesWithCheckIn12} check-ins verstuurd`} icon={TrendingUp} color="orange" />
      </div>

      {/* Funnel */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Matching funnel</h2>
        </div>
        <FunnelBar label="Swipes totaal" value={d.totalSwipes} max={d.totalSwipes} color="white" />
        <FunnelBar label="Likes + Super Likes" value={d.likeSwipes + d.superLikeSwipes} max={d.totalSwipes} color="green" />
        <FunnelBar label="Matches (pending)" value={d.totalMatches} max={d.totalSwipes} color="blue" />
        <FunnelBar label="Matches geaccepteerd" value={d.acceptedMatches} max={d.totalSwipes} color="orange" />
        <FunnelBar label="Matches afgerond" value={d.completedMatches} max={d.totalSwipes} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention check-ins */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <h2 className="text-white font-semibold text-sm">Retentie check-ins</h2>
          </div>
          {[
            { label: "Check-in week 1 (7d)", sent: d.matchesWithCheckIn1 },
            { label: "Check-in week 4 (28d)", sent: d.matchesWithCheckIn4 },
            { label: "Check-in week 12 (84d)", sent: d.matchesWithCheckIn12 },
          ].map(({ label, sent }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-white/50">{label}</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-sm text-white/70 font-semibold">{sent}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-white/25 pt-2 border-t border-white/[0.04]">
            Totaal geaccepteerde matches: {d.acceptedMatches}
          </p>
        </div>

        {/* Match reasons */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#FF6B35]" />
            <h2 className="text-white font-semibold text-sm">Like-redenen</h2>
          </div>
          {d.matchReasonCounts.length === 0 ? (
            <p className="text-white/30 text-sm">Nog geen data</p>
          ) : (
            d.matchReasonCounts.map((row) => {
              const total = d.likeSwipes + d.superLikeSwipes
              const pct = total > 0 ? ((row._count.matchReason / total) * 100).toFixed(0) : "0"
              return (
                <div key={row.matchReason} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">{row.matchReason}</span>
                    <span className="text-white/60 font-semibold">{row._count.matchReason} <span className="text-white/30">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B35] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* pgvector embedding coverage */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Semantische embeddings (Stage 1)</h2>
          <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${emb.available ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
            {emb.available ? "pgvector actief" : "pgvector niet ingesteld"}
          </span>
        </div>

        {emb.available ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Vacatures embedded", value: emb.vacancies.embedded, total: emb.vacancies.total },
              { label: "Vrijwilligers embedded", value: emb.users.embedded, total: emb.users.total },
            ].map(({ label, value, total }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0
              return (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">{label}</span>
                    <span className="text-white/70 font-semibold">{value}/{total} <span className="text-white/30">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-white/30 text-sm">
            Voer <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">POST /api/admin/embeddings?setup</code> uit om pgvector te initialiseren, daarna <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">POST /api/admin/embeddings</code> om embeddings te genereren.
          </p>
        )}
      </div>

      {/* Score component correlation */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Score-component correlatie (RL feedback)</h2>
          <span className="ml-auto text-[10px] text-white/25 uppercase tracking-widest">Gemiddeld per swipe-richting</span>
        </div>
        {!d.hasScoreData ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-white/30 text-sm">Nog geen score snapshots beschikbaar.</p>
            <p className="text-white/20 text-xs">Zodra vrijwilligers swipen worden score-componenten opgeslagen voor analyse.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-3 px-4 text-left text-[11px] text-white/30 uppercase tracking-widest">Component</th>
                  <th className="py-3 px-4 text-right text-[11px] text-green-400/60 uppercase tracking-widest">LIKE avg</th>
                  <th className="py-3 px-4 text-right text-[11px] text-red-400/60 uppercase tracking-widest">DISLIKE avg</th>
                  <th className="py-3 px-4 text-right text-[11px] text-white/30 uppercase tracking-widest">Δ</th>
                </tr>
              </thead>
              <tbody>
                <ScoreRow label="Totaalscore" likeAvg={d.scoreByDir["LIKE"]?.avg_total} dislikeAvg={d.scoreByDir["DISLIKE"]?.avg_total} />
                <ScoreRow label="Motivatie (40%)" likeAvg={d.scoreByDir["LIKE"]?.avg_motivation} dislikeAvg={d.scoreByDir["DISLIKE"]?.avg_motivation} />
                <ScoreRow label="Afstand (30%)" likeAvg={d.scoreByDir["LIKE"]?.avg_distance} dislikeAvg={d.scoreByDir["DISLIKE"]?.avg_distance} />
                <ScoreRow label="Vaardigheden (20%)" likeAvg={d.scoreByDir["LIKE"]?.avg_skill} dislikeAvg={d.scoreByDir["DISLIKE"]?.avg_skill} />
                <ScoreRow label="Versheid (10%)" likeAvg={d.scoreByDir["LIKE"]?.avg_freshness} dislikeAvg={d.scoreByDir["DISLIKE"]?.avg_freshness} />
              </tbody>
            </table>
            <p className="text-xs text-white/20 mt-4">
              Positieve Δ = vrijwilligers met hogere score op dit component liiken vaker. Gebruik dit om gewichten te herijken.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
