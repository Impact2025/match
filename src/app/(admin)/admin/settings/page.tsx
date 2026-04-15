export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Mail, Globe, ShieldCheck, Clock, Database, Palette, Building2, Briefcase, Heart, LifeBuoy } from "lucide-react"

export default async function AdminSettingsPage() {
  const session = await auth()
  const currentUser = session?.user as { role?: string; gemeenteSlug?: string | null } | undefined
  const isGemeenteAdmin = currentUser?.role === "GEMEENTE_ADMIN"
  const gemeenteSlug = currentUser?.gemeenteSlug ?? null

  // ── Gemeente admin view ──────────────────────────────────────────────────────
  if (isGemeenteAdmin && gemeenteSlug) {
    const [gemeente, orgCount, approvedOrgCount, pendingOrgCount, vacancyCount, activeMatchCount, completedMatchCount] = await Promise.all([
      prisma.gemeente.findUnique({ where: { slug: gemeenteSlug } }),
      prisma.organisation.count({ where: { gemeente: { slug: gemeenteSlug } } }),
      prisma.organisation.count({ where: { gemeente: { slug: gemeenteSlug }, status: "APPROVED" } }),
      prisma.organisation.count({ where: { gemeente: { slug: gemeenteSlug }, status: "PENDING_APPROVAL" } }),
      prisma.vacancy.count({ where: { organisation: { gemeente: { slug: gemeenteSlug } }, status: "ACTIVE" } }),
      prisma.match.count({ where: { status: "ACCEPTED", vacancy: { organisation: { gemeente: { slug: gemeenteSlug } } } } }),
      prisma.match.count({ where: { status: "COMPLETED", vacancy: { organisation: { gemeente: { slug: gemeenteSlug } } } } }),
    ])

    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Instellingen</h1>
          <p className="text-gray-400 text-sm mt-1">Overzicht van uw gemeente-configuratie en statistieken</p>
        </div>

        {/* Gemeente configuratie */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Gemeente-configuratie</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Naam", value: gemeente?.name ?? "—" },
              { label: "Weergavenaam", value: gemeente?.displayName ?? "—" },
              { label: "Slug (subdomain)", value: gemeente?.slug ?? "—", mono: true },
              { label: "Tagline", value: gemeente?.tagline ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">{row.label}</p>
                <p className={`text-sm text-gray-700 ${row.mono ? "font-mono" : ""}`}>{row.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-gray-200 shrink-0"
              style={{ background: gemeente?.primaryColor ?? "#7c3aed" }}
            />
            <div>
              <p className="text-sm text-gray-600">Brandkleur</p>
              <p className="text-xs text-gray-400 font-mono">{gemeente?.primaryColor ?? "—"}</p>
            </div>
            <a
              href={`/admin/gemeenten/${gemeenteSlug}`}
              className="ml-auto text-xs text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              Uitstraling bewerken →
            </a>
          </div>
        </div>

        {/* Statistieken */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Gemeente statistieken</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Organisaties", value: orgCount, sub: `${approvedOrgCount} goedgekeurd${pendingOrgCount > 0 ? ` · ${pendingOrgCount} wacht` : ""}`, icon: Building2 },
              { label: "Actieve vacatures", value: vacancyCount, icon: Briefcase },
              { label: "Actieve matches", value: activeMatchCount, sub: `${completedMatchCount} afgerond`, icon: Heart },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                <stat.icon className="w-4 h-4 text-gray-300" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
                  {stat.sub && <p className="text-gray-300 text-[11px] mt-1">{stat.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automatische e-mails */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Automatische check-in e-mails</h2>
          </div>
          <div className="space-y-3">
            {[
              { week: "Week 1", desc: "Welkom-check: hoe verloopt de eerste kennismaking?" },
              { week: "Week 4", desc: "Tussentijdse check: loopt alles naar wens?" },
              { week: "Week 12", desc: "Kwartaal-check: is de match nog steeds actief?" },
            ].map((item) => (
              <div key={item.week} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
                <span className="w-14 shrink-0 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-100 rounded-md px-2 py-1 text-center">
                  {item.week}
                </span>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-4">Check-ins worden automatisch verstuurd aan vrijwilligers met een actieve match, dagelijks om 09:00 UTC.</p>
        </div>

        {/* E-mail templates */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Transactionele e-mails</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Alle e-mails worden verstuurd met de huisstijl van <strong className="text-gray-600">{gemeente?.displayName ?? gemeenteSlug}</strong> — de brandkleur en naam worden automatisch verwerkt in elke e-mail.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <div key={t} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-green-500 text-xs">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Platform support</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Voor technische vragen, nieuwe functies of uitbreidingen kunt u contact opnemen met het Vrijwilligersmatch-platform via <a href="mailto:support@vrijwilligersmatch.nl" className="text-orange-500 hover:underline">support@vrijwilligersmatch.nl</a>.
          </p>
        </div>
      </div>
    )
  }

  // ── Platform admin view (original) ──────────────────────────────────────────
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Instellingen</h1>
        <p className="text-gray-400 text-sm mt-1">Platform configuratie en statistieken</p>
      </div>

      {/* Platform stats */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Database className="w-4 h-4 text-orange-500" />
          <h2 className="text-gray-900 font-semibold text-sm">Database overzicht</h2>
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
            <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              {stat.sub && <p className="text-gray-300 text-[11px] mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Cron jobs */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-orange-500" />
          <h2 className="text-gray-900 font-semibold text-sm">Geplande taken</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-gray-600 text-sm font-medium">Check-in e-mails</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Stuurt vrijwilligers een check-in na 1, 4 en 12 weken actieve match
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs font-mono">dagelijks 09:00 UTC</p>
              <p className="text-gray-300 text-xs mt-0.5">/api/cron/check-in</p>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-xs mt-4">
          Cron-taken worden uitgevoerd via Vercel Cron (<code className="font-mono">vercel.json</code>) en vereisen de omgevingsvariabele <code className="font-mono">CRON_SECRET</code> (header: <code className="font-mono">x-cron-secret</code>).
        </p>
      </div>

      {/* Environment variables */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <h2 className="text-gray-900 font-semibold text-sm">Omgevingsvariabelen</h2>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            configuredCount === envVars.length
              ? "bg-green-50 text-green-600"
              : "bg-amber-50 text-amber-600"
          }`}>
            {configuredCount}/{envVars.length} geconfigureerd
          </span>
        </div>
        <div className="space-y-1">
          {envVars.map((env) => (
            <div
              key={env.key}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${env.set ? "bg-green-400" : "bg-red-400"}`} />
                <div>
                  <p className="text-gray-600 text-sm">{env.label}</p>
                  <p className="text-gray-300 text-[11px] font-mono">{env.key}</p>
                </div>
              </div>
              <div className="text-right">
                {env.value && env.set ? (
                  <p className="text-gray-400 text-xs font-mono max-w-[200px] truncate">{env.value}</p>
                ) : (
                  <span className={`text-xs ${env.set ? "text-green-600" : "text-red-600/70"}`}>
                    {env.set ? "✓ Ingesteld" : "✗ Ontbreekt"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform links */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-orange-500" />
          <h2 className="text-gray-900 font-semibold text-sm">Handige links</h2>
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
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium group-hover:text-white transition-colors">{link.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{link.desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-400 transition-colors text-lg leading-none">↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Email templates note */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-orange-500" />
          <h2 className="text-gray-900 font-semibold text-sm">E-mail templates</h2>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Alle transactionele e-mails worden verzonden via <strong className="text-gray-500">Resend</strong> met HTML-templates
          gedefinieerd in <code className="text-orange-500 bg-white/[0.03] px-1.5 py-0.5 rounded text-xs">src/lib/email.ts</code>.
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
            <div key={t} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-green-600 text-xs">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
