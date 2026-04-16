import { Resend } from "resend"

// Lazy init — avoids build-time error when env var is not yet set
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM ?? "Vrijwilligersmatch <noreply@vrijwilligersmatch.nl>"
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

// ── Gemeente branding ────────────────────────────────────────────────────────

export type EmailBrand = {
  primaryColor: string
  accentColor: string
  name: string
  emailSignature?: string | null
}

const DEFAULT_BRAND: EmailBrand = {
  primaryColor: "#f97316",
  accentColor: "#f59e0b",
  name: "Vrijwilligersmatch",
  emailSignature: null,
}

function resolveBrand(brand?: Partial<EmailBrand>): EmailBrand {
  return { ...DEFAULT_BRAND, ...brand }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function layout(title: string, body: string, brand?: Partial<EmailBrand>): string {
  const b = resolveBrand(brand)
  const year = new Date().getFullYear()
  const sig = b.emailSignature
    ? `<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #f3f4f6;font-size:12px;color:#6b7280;line-height:1.6;">${b.emailSignature}</p>`
    : ""
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
                <td style="background:linear-gradient(135deg,${b.primaryColor},${b.accentColor});border-radius:16px;padding:12px 16px;">
                  <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">${b.name}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Card -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 1px 8px rgba(0,0,0,0.06);">
            ${body}
            ${sig}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${year} ${b.name} × Vrijwilligersmatch.nl — Maak impact, vind je match
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string, brand?: Partial<EmailBrand>): string {
  const b = resolveBrand(brand)
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,${b.primaryColor},${b.accentColor});color:#fff;font-weight:600;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:12px;margin-top:24px;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="margin:12px 0;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`
}

function highlight(text: string, brand?: Partial<EmailBrand>): string {
  const b = resolveBrand(brand)
  return `<span style="color:${b.primaryColor};font-weight:600;">${text}</span>`
}

function gdprFooter(brand?: Partial<EmailBrand>): string {
  const b = resolveBrand(brand)
  return `<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;line-height:1.5;">
    Je ontvangt dit bericht als geregistreerd gebruiker van ${b.name}.
    Je kunt je e-mailinstellingen aanpassen via <a href="${BASE_URL}/profile" style="color:${b.primaryColor};text-decoration:none;">je profiel</a>.
  </p>`
}

// ── Email senders ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, brand?: Partial<EmailBrand>) {
  const b = resolveBrand(brand)
  const body = `
    ${h1(`Welkom, ${name}!`)}
    ${p(`Fijn dat je bij <strong>${b.name}</strong> bent! We helpen jou de perfecte vrijwilligersplek te vinden die past bij jouw vaardigheden, interesses en beschikbaarheid.`)}
    ${p(`Begin vandaag nog met swipen en ontdek organisaties die jouw hulp goed kunnen gebruiken.`)}
    ${btn(`${BASE_URL}/swipe`, "Begin met swipen →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Heb je vragen? Beantwoord deze e-mail gewoon.</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Welkom bij ${b.name}, ${name}!`,
    html: layout(`Welkom bij ${b.name}`, body, b),
  })
}

export async function sendMatchNotificationOrgEmail(
  to: string,
  orgName: string,
  volunteerName: string,
  vacancyTitle: string,
  matchId: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Nieuwe interesse in je vacature!")}
    ${p(`${highlight(volunteerName, b)} is geïnteresseerd in de vacature ${highlight(`"${vacancyTitle}"`, b)}.`)}
    ${p(`Bekijk het profiel van ${volunteerName} en beslis of je de match wilt accepteren of afwijzen.`)}
    ${btn(`${BASE_URL}/organisation/matches`, "Bekijk match →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${volunteerName} is geïnteresseerd in "${vacancyTitle}"`,
    html: layout("Nieuwe match", body, b),
  })
}

export async function sendMatchAcceptedEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  conversationId: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Je match is geaccepteerd!")}
    ${p(`Goed nieuws, ${highlight(volunteerName, b)}! ${highlight(orgName, b)} heeft je match voor ${highlight(`"${vacancyTitle}"`, b)}<strong> geaccepteerd</strong>.`)}
    ${p(`Je kunt nu direct in contact komen via de chat. Maak een goede eerste indruk!`)}
    ${btn(`${BASE_URL}/chat?conversationId=${conversationId}`, "Open de chat →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} heeft je match geaccepteerd!`,
    html: layout("Match geaccepteerd", body, b),
  })
}

export async function sendMatchRejectedEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Update over je match")}
    ${p(`Helaas, ${volunteerName}. ${highlight(orgName, b)} heeft je aanmelding voor ${highlight(`"${vacancyTitle}"`, b)}<strong> niet doorgezet</strong> op dit moment.`)}
    ${p(`Geen zorgen — er zijn genoeg andere organisaties die jouw hulp goed kunnen gebruiken. Blijf swipen!`)}
    ${btn(`${BASE_URL}/swipe`, "Verder swipen →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Update over je aanmelding bij ${orgName}`,
    html: layout("Match update", body, b),
  })
}

export async function sendCheckInEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  weekNumber: 1 | 4 | 12,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const weekLabels: Record<number, string> = { 1: "1 week", 4: "4 weken", 12: "12 weken" }
  const weekLabel = weekLabels[weekNumber]
  const body = `
    ${h1(`Check-in na ${weekLabel}!`)}
    ${p(`Hoi ${highlight(volunteerName, b)}! Je doet al ${weekLabel} vrijwilligerswerk bij ${highlight(orgName, b)} voor de vacature ${highlight(`"${vacancyTitle}"`, b)}.`)}
    ${p(`We zijn benieuwd hoe het gaat! Deel je ervaringen met ons en laat weten of we iets voor je kunnen doen.`)}
    ${btn(`${BASE_URL}/matches`, "Bekijk mijn matches →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Bedankt voor je inzet — het maakt echt een verschil!<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Check-in: hoe gaat het bij ${orgName}?`,
    html: layout(`Check-in na ${weekLabel}`, body, b),
  })
}

export async function sendOrgApprovedEmail(to: string, orgName: string, brand?: Partial<EmailBrand>) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Je organisatie is goedgekeurd!")}
    ${p(`Goed nieuws! ${highlight(orgName, b)} is geverifieerd en staat nu live op <strong>${b.name}</strong>.`)}
    ${p(`Vrijwilligers kunnen nu jouw vacatures zien en matchen. Zorg dat je vacatures volledig en aantrekkelijk zijn voor de beste resultaten.`)}
    ${btn(`${BASE_URL}/organisation/vacancies`, "Beheer je vacatures →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Welkom in ons netwerk!<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} is goedgekeurd op ${b.name}!`,
    html: layout("Organisatie goedgekeurd", body, b),
  })
}

export async function sendOrgRejectedEmail(to: string, orgName: string, reason?: string, brand?: Partial<EmailBrand>) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Update over je registratie")}
    ${p(`Na beoordeling kunnen we ${highlight(orgName, b)} helaas op dit moment niet goedkeuren op ${b.name}.`)}
    ${reason ? p(`<strong>Reden:</strong> ${reason}`) : ""}
    ${p(`Heb je vragen of wil je meer informatie? Neem contact met ons op door op deze e-mail te reageren.`)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Update over de aanmelding van ${orgName}`,
    html: layout("Registratie update", body, b),
  })
}

export async function sendInvitationEmail(
  to: string,
  volunteerName: string,
  orgName: string,
  vacancyTitle: string,
  invitationId: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1(`${orgName} heeft je uitgenodigd!`)}
    ${p(`Hoi ${highlight(volunteerName, b)}! ${highlight(orgName, b)} heeft je uitgenodigd voor de vacature ${highlight(`"${vacancyTitle}"`, b)}.`)}
    ${p(`Bekijk de uitnodiging en laat weten of je interesse hebt. Je kunt de uitnodiging accepteren of afwijzen vanuit je matchesoverzicht.`)}
    ${btn(`${BASE_URL}/matches`, "Bekijk uitnodiging →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Geen interesse? Je kunt de uitnodiging gewoon afwijzen — geen verplichtingen.<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${orgName} heeft je uitgenodigd voor "${vacancyTitle}"`,
    html: layout("Uitnodiging ontvangen", body, b),
  })
}

export async function sendPlacementConfirmedEmail(
  to: string,
  volunteerName: string,
  vacancyTitle: string,
  orgName: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Je bent officieel geplaatst! 🎉")}
    ${p(`Geweldig nieuws, ${highlight(volunteerName, b)}! ${highlight(orgName, b)} heeft bevestigd dat jij van start gaat als vrijwilliger voor ${highlight(`"${vacancyTitle}"`, b)}.`)}
    ${p(`Dit is het moment waarop jouw bijdrage echt begint. We zijn trots op je inzet en kijken uit naar de impact die je gaat maken.`)}
    ${btn(`${BASE_URL}/matches`, "Bekijk mijn matches →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">We sturen je over een week een check-in om te horen hoe het gaat.<br/>Veel succes en plezier!<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Je bent geplaatst bij ${orgName}!`,
    html: layout("Geplaatst als vrijwilliger", body, b),
  })
}

export async function sendConfirmationReminderEmail(
  to: string,
  orgName: string,
  volunteerName: string,
  vacancyTitle: string,
  matchId: string,
  daysSinceAccepted: number,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const body = `
    ${h1("Vergeet niet te bevestigen")}
    ${p(`Hoi ${highlight(orgName, b)}! ${highlight(volunteerName, b)} is al ${daysSinceAccepted} dagen geleden gekoppeld aan jullie vacature ${highlight(`"${vacancyTitle}"`, b)}.`)}
    ${p(`Is ${volunteerName} inmiddels gestart als vrijwilliger? Bevestig de plaatsing zodat we de voortgang kunnen bijhouden en de juiste check-ins kunnen sturen.`)}
    ${btn(`${BASE_URL}/organisation/matches`, "Bevestig plaatsing →", b)}
    ${p(`Is de samenwerking toch niet doorgegaan? Dan kun je de match ook sluiten vanuit het overzicht.`)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Groeten,<br/>Het ${b.name}-team</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Vergeet niet: bevestig de plaatsing van ${volunteerName}`,
    html: layout("Bevestiging nog open", body, b),
  })
}

export function buildBulkEmailHtml(subject: string, message: string, brand?: Partial<EmailBrand>): string {
  const b = resolveBrand(brand)
  const isHtml = /<[a-z][\s\S]*>/i.test(message)
  const content = isHtml
    ? `<div style="font-size:14px;line-height:1.7;color:#374151;">${message}</div>`
    : message
        .split(/\n{2,}/)
        .map((para) => p(para.replace(/\n/g, "<br/>")))
        .join("")
  const body = `
    ${h1(subject)}
    ${content}
    ${gdprFooter(b)}
  `
  return layout(subject, body, b)
}

// ── Activiteit emails ────────────────────────────────────────────────────────

export async function sendActivityRegistrationEmail(
  to: string,
  name: string,
  activityTitle: string,
  activityDate: Date,
  orgName: string,
  activityId: string,
  waitlisted: boolean,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const dateStr = activityDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
  const timeStr = activityDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  const body = waitlisted
    ? `
      ${h1("Je staat op de wachtlijst!")}
      ${p(`Hoi ${highlight(name, b)}, je bent op de wachtlijst geplaatst voor ${highlight(`"${activityTitle}"`, b)} van ${highlight(orgName, b)}.`)}
      ${p(`De activiteit is op ${highlight(`${dateStr} om ${timeStr}`, b)}. Je ontvangt direct bericht als er een plek vrijkomt.`)}
      ${btn(`${BASE_URL}/activiteiten/${activityId}`, "Bekijk activiteit →", b)}
      ${gdprFooter(b)}
    `
    : `
      ${h1("Je aanmelding is bevestigd!")}
      ${p(`Hoi ${highlight(name, b)}, je bent aangemeld voor ${highlight(`"${activityTitle}"`, b)} van ${highlight(orgName, b)}.`)}
      ${p(`De activiteit is op ${highlight(`${dateStr} om ${timeStr}`, b)}. We zien je dan!`)}
      ${btn(`${BASE_URL}/activiteiten/${activityId}`, "Bekijk activiteit →", b)}
      ${p(`<span style="font-size:13px;color:#9ca3af;">Kun je toch niet? Meld je dan tijdig af via de knop hierboven.</span>`)}
      ${gdprFooter(b)}
    `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: waitlisted
      ? `Wachtlijst: "${activityTitle}"`
      : `Aanmelding bevestigd: "${activityTitle}"`,
    html: layout(waitlisted ? "Wachtlijst" : "Aanmelding bevestigd", body, b),
  })
}

export async function sendActivityWaitlistPromotedEmail(
  to: string,
  name: string,
  activityTitle: string,
  activityDate: Date,
  orgName: string,
  activityId: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const dateStr = activityDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
  const timeStr = activityDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  const body = `
    ${h1("Er is een plek vrijgekomen! 🎉")}
    ${p(`Goed nieuws, ${highlight(name, b)}! Er is een plek vrijgekomen voor ${highlight(`"${activityTitle}"`, b)} van ${highlight(orgName, b)}.`)}
    ${p(`Je bent van de wachtlijst gepromoveerd en nu officieel aangemeld. De activiteit is op ${highlight(`${dateStr} om ${timeStr}`, b)}.`)}
    ${btn(`${BASE_URL}/activiteiten/${activityId}`, "Bekijk activiteit →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Kun je toch niet? Meld je dan tijdig af zodat iemand anders de plek kan krijgen.</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Goed nieuws: plek vrijgekomen voor "${activityTitle}"`,
    html: layout("Plek vrijgekomen", body, b),
  })
}

export async function sendActivityReminderEmail(
  to: string,
  name: string,
  activityTitle: string,
  activityDate: Date,
  isOnline: boolean,
  location: string | null,
  meetUrl: string | null,
  activityId: string,
  brand?: Partial<EmailBrand>
) {
  const b = resolveBrand(brand)
  const timeStr = activityDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  const locatieStr = isOnline
    ? (meetUrl ? `<a href="${meetUrl}" style="color:${b.primaryColor};">Online (klik voor link)</a>` : "Online")
    : (location ?? "Zie activiteitsdetails")
  const body = `
    ${h1("Morgen is het zover! 📅")}
    ${p(`Hoi ${highlight(name, b)}, morgen om ${highlight(timeStr, b)} begint ${highlight(`"${activityTitle}"`, b)}. We zijn benieuwd naar je!`)}
    ${p(`<strong>Locatie:</strong> ${locatieStr}`)}
    ${btn(`${BASE_URL}/activiteiten/${activityId}`, "Bekijk details →", b)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Kun je toch niet? Meld je dan nu af zodat iemand anders de plek kan krijgen.</span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Herinnering: morgen "${activityTitle}"`,
    html: layout("Herinnering activiteit", body, b),
  })
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, brand?: Partial<EmailBrand>) {
  const b = resolveBrand(brand)
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`
  const body = `
    ${h1("Wachtwoord resetten")}
    ${p(`Hoi ${name}, je hebt een wachtwoordreset aangevraagd. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.`)}
    ${p(`<strong>Deze link is 1 uur geldig.</strong>`)}
    ${btn(resetUrl, "Wachtwoord resetten →", b)}
    ${p(`Heb je dit niet aangevraagd? Dan hoef je niets te doen — je wachtwoord blijft ongewijzigd.`)}
    ${p(`<span style="font-size:13px;color:#9ca3af;">Of kopieer deze link:<br/><a href="${resetUrl}" style="color:${b.primaryColor};word-break:break-all;">${resetUrl}</a></span>`)}
    ${gdprFooter(b)}
  `
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Wachtwoord resetten — ${b.name}`,
    html: layout("Wachtwoord resetten", body, b),
  })
}
