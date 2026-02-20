export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Settings, Mail, Globe, ShieldCheck, Clock, Database } from "lucide-react"

export default async function AdminSettingsPage() {
  const [userCount, orgCount, vacancyCount, matchCount, messageCount] = await Promise.all([
    prisma.user.count(),
    prisma.organisation.count(),
    prisma.vacancy.count(),
    prisma.match.count(),
    prisma.message.count(),
  ])

  const pendingOrgs = await prisma.organisation.count({ where: { status: "PENDING_APPROVAL" } })
  const activeMatches = await prisma.match.count({ where: { status: "ACCEPTED" } })
  const avgSla = await prisma.organisation.aggregate({
    _avg: { slaScore: true },
    where: { status: "APPROVED" },
  })

  const envVars = [
    { key: "DATABASE_URL", label: "PostgreSQL", set: !!process.env.DATABASE_URL },
    { key: "NEXTAUTH_SECRET", label: "Auth Secret", set: !!process.env.NEXTAUTH_SECRET },
    { key: "NEXTAUTH_URL", label: "Auth URL", value: process.env.NEXTAUTH_URL, set: !!process.env.NEXTAUTH_URL },
    { key: "RESEND_API_KEY", label: "Resend (e-mail)", set: !!process.env.RESEND_API_KEY },
    { key: "RESEND_FROM", label: "Afzender e-mail", value: process.env.RESEND_FROM, set: !!process.env.RESEND_FROM },
    { key: "OPENAI_API_KEY", label: "OpenAI (AI match)", set: !!process.env.OPENAI_API_KEY },
    { key: "PUSHER_APP_ID", label: "Pusher App ID", set: !!process.env.PUSHER_APP_ID },
    { key: "NEXT_PUBLIC_PUSHER_KEY", label: "Pusher Public Key", set: !!process.env.NEXT_PUBLIC_PUSHER_KEY },
    { key: "BLOB_READ_WRITE_TOKEN", label: "Vercel Blob", set: !!process.env.BLOB_READ_WRITE_TOKEN },
    { key: "CRON_SECRET", label: "Cron Secret", set: !!process.env.CRON_SECRET },
    { key: "GOOGLE_CLIENT_ID", label: "Google OAuth", set: !!process.env.GOOGLE_CLIENT_ID },
  ]

  const configuredCount = envVars.filter((e) => e.set).length

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Instellingen</h1>
        <p className="text-white/40 text-sm mt-1">Platform configuratie en statistieken</p>
      </div>

      {/* Platform stats */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Database className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Database overzicht</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Gebruikers", value: userCount },
            { label: "Organisaties", value: orgCount, sub: `${pendingOrgs} in behandeling` },
            { label: "Vacatures", value: vacancyCount },
            { label: "Matches", value: matchCount, sub: `${activeMatches} actief` },
            { label: "Berichten", value: messageCount },
            { label: "Gem. SLA score", value: avgSla._avg.slaScore != null ? `${Math.round(avgSla._avg.slaScore)}/100` : "—" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d0d] rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
              {stat.sub && <p className="text-white/25 text-[11px] mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Cron jobs */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Geplande taken</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
            <div>
              <p className="text-white/70 text-sm font-medium">Check-in e-mails</p>
              <p className="text-white/30 text-xs mt-0.5">
                Stuurt vrijwilligers een check-in na 1, 4 en 12 weken actieve match
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs font-mono">dagelijks 09:00 UTC</p>
              <p className="text-white/25 text-xs mt-0.5">/api/cron/check-in</p>
            </div>
          </div>
        </div>
        <p className="text-white/20 text-xs mt-4">
          Cron-taken worden uitgevoerd via Vercel Cron (<code className="font-mono">vercel.json</code>) en vereisen de omgevingsvariabele <code className="font-mono">CRON_SECRET</code> (header: <code className="font-mono">x-cron-secret</code>).
        </p>
      </div>

      {/* Environment variables */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
            <h2 className="text-white font-semibold text-sm">Omgevingsvariabelen</h2>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            configuredCount === envVars.length
              ? "bg-green-500/10 text-green-400"
              : "bg-amber-500/10 text-amber-400"
          }`}>
            {configuredCount}/{envVars.length} geconfigureerd
          </span>
        </div>
        <div className="space-y-1">
          {envVars.map((env) => (
            <div
              key={env.key}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${env.set ? "bg-green-400" : "bg-red-400"}`} />
                <div>
                  <p className="text-white/70 text-sm">{env.label}</p>
                  <p className="text-white/25 text-[11px] font-mono">{env.key}</p>
                </div>
              </div>
              <div className="text-right">
                {env.value && env.set ? (
                  <p className="text-white/40 text-xs font-mono max-w-[200px] truncate">{env.value}</p>
                ) : (
                  <span className={`text-xs ${env.set ? "text-green-400" : "text-red-400/70"}`}>
                    {env.set ? "✓ Ingesteld" : "✗ Ontbreekt"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform links */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Handige links</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Resend Dashboard", href: "https://resend.com/emails", desc: "E-mail logs en statistieken" },
            { label: "Pusher Dashboard", href: "https://dashboard.pusher.com", desc: "Real-time verbindingen" },
            { label: "Vercel Blob", href: "https://vercel.com/dashboard", desc: "Geüploade bestanden" },
            { label: "Vercel Dashboard", href: "https://vercel.com/dashboard", desc: "Deployments en cron logs" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 bg-[#0d0d0d] rounded-xl hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{link.label}</p>
                <p className="text-white/30 text-xs mt-0.5">{link.desc}</p>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg leading-none">↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Email templates note */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">E-mail templates</h2>
        </div>
        <p className="text-white/40 text-sm leading-relaxed">
          Alle transactionele e-mails worden verzonden via <strong className="text-white/60">Resend</strong> met HTML-templates
          gedefinieerd in <code className="text-[#FF6B35]/80 bg-white/[0.03] px-1.5 py-0.5 rounded text-xs">src/lib/email.ts</code>.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Welkom (registratie)",
            "Match ontvangen (organisatie)",
            "Match geaccepteerd (vrijwilliger)",
            "Match afgewezen (vrijwilliger)",
            "Check-in week 1 / 4 / 12",
            "Organisatie goedgekeurd",
            "Organisatie afgewezen",
            "Wachtwoord resetten",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm text-white/40">
              <span className="text-green-400 text-xs">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
