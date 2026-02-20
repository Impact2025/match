import { Resend } from "resend"

// Lazy init — avoids build-time error when env var is not yet set
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM ?? "Vrijwilligersmatch <noreply@vrijwilligersmatch.nl>"
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

// ── Helpers ─────────────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#f97316,#f59e0b);border-radius:16px;padding:12px 16px;">
                  <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">Vrijwilligersmatch</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Card -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 1px 8px rgba(0,0,0,0.06);">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Vrijwilligersmatch.nl — Maak impact, vind je match
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;font-weight:600;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:12px;margin-top:24px;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="margin:12px 0;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`
}

function highlight(text: string): string {
  return `<span style="color:#f97316;font-weight:600;">${text}</span>`
}

function gdprFooter(): string {
  return `<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;line-height:1.5;">
    Je ontvangt dit bericht als geregistreerd gebruiker van Vrijwilligersmatch.nl.
    Je kunt je e-mailinstellingen aanpassen via <a href="${BASE_URL}/profile" style="color:#f97316;text-decoration:none;">je profiel</a>.
  </p>`
}

// ── Email senders ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const body = `
    ${h1(`Welkom, ${name}!`)}
    ${p(`Fijn dat je bij <strong>Vrijwilligersmatch.nl</strong> bent! We helpen jou de perfecte vrijwilligersplek te vinden die past bij jouw vaardigheden, interesses en beschikbaarheid.`)}
    ${p(`Begin vandaag nog met swipen en ontdek organisaties die jouw hulp goed kunnen gebruiken.`)}
    ${btn(`${BASE_URL}/swipe`, "Begin met swipen →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Heb je vragen? Beantwoord deze e-mail gewoon.</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Welkom bij Vrijwilligersmatch, ${name}!`,
    html: layout("Welkom bij Vrijwilligersmatch", body),
  })
}

export async function sendMatchNotificationOrgEmail(
  to: string,
  orgName: string,
  volunteerName: string,
  vacancyTitle: string,
  matchId: string
) {
  const body = `
    ${h1("Nieuwe interesse in je vacature!")}
    ${p(`${highlight(volunteerName)} is geïnteresseerd in de vacature ${highlight(`"${vacancyTitle}"`)}.`)}
    ${p(`Bekijk het profiel van ${volunteerName} en beslis of je de match wilt accepteren of afwijzen.`)}
    ${btn(`${BASE_URL}/organisation/matches`, "Bekijk match →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${volunteerName} is geïnteresseerd in "${vacancyTitle}"`,
    html: layout("Nieuwe match", body),
  })
}

export async function sendMatchAcceptedEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  conversationId: string
) {
  const body = `
    ${h1("Je match is geaccepteerd!")}
    ${p(`Goed nieuws, ${highlight(volunteerName)}! ${highlight(orgName)} heeft je match voor ${highlight(`"${vacancyTitle}"`)}<strong> geaccepteerd</strong>.`)}
    ${p(`Je kunt nu direct in contact komen via de chat. Maak een goede eerste indruk!`)}
    ${btn(`${BASE_URL}/chat?conversationId=${conversationId}`, "Open de chat →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} heeft je match geaccepteerd!`,
    html: layout("Match geaccepteerd", body),
  })
}

export async function sendMatchRejectedEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string
) {
  const body = `
    ${h1("Update over je match")}
    ${p(`Helaas, ${volunteerName}. ${highlight(orgName)} heeft je aanmelding voor ${highlight(`"${vacancyTitle}"`)}<strong> niet doorgezet</strong> op dit moment.`)}
    ${p(`Geen zorgen — er zijn genoeg andere organisaties die jouw hulp goed kunnen gebruiken. Blijf swipen!`)}
    ${btn(`${BASE_URL}/swipe`, "Verder swipen →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Update over je aanmelding bij ${orgName}`,
    html: layout("Match update", body),
  })
}

export async function sendCheckInEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  weekNumber: 1 | 4 | 12
) {
  const weekLabels: Record<number, string> = { 1: "1 week", 4: "4 weken", 12: "12 weken" }
  const weekLabel = weekLabels[weekNumber]
  const body = `
    ${h1(`Check-in na ${weekLabel}!`)}
    ${p(`Hoi ${highlight(volunteerName)}! Je doet al ${weekLabel} vrijwilligerswerk bij ${highlight(orgName)} voor de vacature ${highlight(`"${vacancyTitle}"`)}.`)}
    ${p(`We zijn benieuwd hoe het gaat! Deel je ervaringen met ons en laat weten of we iets voor je kunnen doen.`)}
    ${btn(`${BASE_URL}/matches`, "Bekijk mijn matches →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Bedankt voor je inzet — het maakt echt een verschil!<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Check-in: hoe gaat het bij ${orgName}?`,
    html: layout(`Check-in na ${weekLabel}`, body),
  })
}

export async function sendOrgApprovedEmail(to: string, orgName: string) {
  const body = `
    ${h1("Je organisatie is goedgekeurd!")}
    ${p(`Goed nieuws! ${highlight(orgName)} is geverifieerd en staat nu live op <strong>Vrijwilligersmatch.nl</strong>.`)}
    ${p(`Vrijwilligers kunnen nu jouw vacatures zien en matchen. Zorg dat je vacatures volledig en aantrekkelijk zijn voor de beste resultaten.`)}
    ${btn(`${BASE_URL}/organisation/vacancies`, "Beheer je vacatures →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Welkom in ons netwerk!<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} is goedgekeurd op Vrijwilligersmatch!`,
    html: layout("Organisatie goedgekeurd", body),
  })
}

export async function sendOrgRejectedEmail(to: string, orgName: string, reason?: string) {
  const body = `
    ${h1("Update over je registratie")}
    ${p(`Na beoordeling kunnen we ${highlight(orgName)} helaas op dit moment niet goedkeuren op Vrijwilligersmatch.nl.`)}
    ${reason ? p(`<strong>Reden:</strong> ${reason}`) : ""}
    ${p(`Heb je vragen of wil je meer informatie? Neem contact met ons op door op deze e-mail te reageren.`)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Update over de aanmelding van ${orgName}`,
    html: layout("Registratie update", body),
  })
}

export async function sendInvitationEmail(
  to: string,
  volunteerName: string,
  orgName: string,
  vacancyTitle: string,
  invitationId: string
) {
  const body = `
    ${h1(`${orgName} heeft je uitgenodigd!`)}
    ${p(`Hoi ${highlight(volunteerName)}! ${highlight(orgName)} heeft je uitgenodigd voor de vacature ${highlight(`"${vacancyTitle}"`)}.`)}
    ${p(`Bekijk de uitnodiging en laat weten of je interesse hebt. Je kunt de uitnodiging accepteren of afwijzen vanuit je matchesoverzicht.`)}
    ${btn(`${BASE_URL}/matches`, "Bekijk uitnodiging →")}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Geen interesse? Je kunt de uitnodiging gewoon afwijzen — geen verplichtingen.<br/>Het Vrijwilligersmatch-team</span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} heeft je uitgenodigd voor "${vacancyTitle}"`,
    html: layout("Uitnodiging ontvangen", body),
  })
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`
  const body = `
    ${h1("Wachtwoord resetten")}
    ${p(`Hoi ${name}, je hebt een wachtwoordreset aangevraagd. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.`)}
    ${p(`<strong>Deze link is 1 uur geldig.</strong>`)}
    ${btn(resetUrl, "Wachtwoord resetten →")}
    ${p(`Heb je dit niet aangevraagd? Dan hoef je niets te doen — je wachtwoord blijft ongewijzigd.`)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Of kopieer deze link:<br/><a href="${resetUrl}" style="color:#f97316;word-break:break-all;">${resetUrl}</a></span>`)}
    ${gdprFooter()}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Wachtwoord resetten — Vrijwilligersmatch",
    html: layout("Wachtwoord resetten", body),
  })
}
