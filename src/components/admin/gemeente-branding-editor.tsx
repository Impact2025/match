"use client"

import { useState, useCallback, useRef } from "react"
import {
  Save, Upload, Globe, Phone, MapPin, Mail, Palette,
  Image as ImageIcon, MessageSquare, Facebook, Instagram,
  Linkedin, Twitter, CheckCircle2, Loader2, AlertCircle,
  Smartphone, Eye,
} from "lucide-react"

interface SocialLinks {
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  twitter?: string | null
}

interface GemeenteData {
  slug: string
  name: string
  displayName: string
  tagline: string | null
  primaryColor: string
  accentColor: string | null
  logoUrl: string | null
  heroImageUrl: string | null
  faviconUrl: string | null
  website: string | null
  contactEmail: string | null
  welcomeTitle: string | null
  welcomeMessage: string | null
  contactPhone: string | null
  contactAddress: string | null
  socialLinks: SocialLinks | null
  emailSignature: string | null
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

// ── Colour picker ────────────────────────────────────────────────────────────

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [hex, setHex] = useState(value)

  function commit(raw: string) {
    const clean = raw.startsWith("#") ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHex(clean)
      onChange(clean)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-gray-500 w-20 shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <input
            type="color"
            value={hex}
            onChange={(e) => { setHex(e.target.value); onChange(e.target.value) }}
            className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
          />
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          maxLength={7}
          className="w-28 font-mono text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
        />
        <div className="h-8 w-8 rounded-lg border border-gray-100 shadow-sm" style={{ background: hex }} />
      </div>
    </div>
  )
}

// ── Image upload field ───────────────────────────────────────────────────────

function ImageField({
  label, value, onChange, hint,
}: { label: string; value: string | null; onChange: (v: string | null) => void; hint?: string }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } catch {
      // silently ignore upload errors — user can retry
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-start gap-3">
        {/* Thumbnail or placeholder */}
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploaden…" : "Afbeelding uploaden"}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="Of plak een URL…"
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-300"
          />
          {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 block">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-300 bg-white"

// ── Live preview ─────────────────────────────────────────────────────────────

function LivePreview({ data }: { data: GemeenteData }) {
  const accent = data.accentColor ?? data.primaryColor

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Eye className="w-3.5 h-3.5" />
        Live voorbeeld
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto w-[280px]">
        {/* Phone chrome */}
        <div className="absolute inset-0 rounded-[40px] border-[10px] border-gray-800 shadow-2xl pointer-events-none z-10" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-gray-800 rounded-full z-20" />

        {/* Screen content */}
        <div className="rounded-[30px] overflow-hidden bg-gray-50" style={{ minHeight: 560 }}>

          {/* Hero image or gradient header */}
          {data.heroImageUrl ? (
            <div className="h-32 relative">
              <img src={data.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${data.primaryColor}99)` }} />
            </div>
          ) : (
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${accent})` }} />
          )}

          {/* App header */}
          <div className="bg-white border-b px-4 py-2.5 flex items-center gap-2.5"
            style={{ borderBottomColor: `${data.primaryColor}33` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${accent})` }}>
              {data.logoUrl
                ? <img src={data.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                : data.displayName.charAt(0)
              }
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold" style={{ color: data.primaryColor }}>{data.name}</p>
              <p className="text-[9px] text-gray-400">× Vrijwilligersmatch</p>
            </div>
          </div>

          {/* Welcome card */}
          {(data.welcomeTitle || data.welcomeMessage) && (
            <div className="mx-3 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-900 mb-1">
                {data.welcomeTitle || `Welkom bij ${data.name}`}
              </p>
              {data.welcomeMessage && (
                <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{data.welcomeMessage}</p>
              )}
            </div>
          )}

          {/* Contact block */}
          {(data.contactPhone || data.contactAddress) && (
            <div className="mx-3 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Contact</p>
              {data.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 shrink-0" style={{ color: data.primaryColor }} />
                  <span className="text-[10px] text-gray-600">{data.contactPhone}</span>
                </div>
              )}
              {data.contactAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 shrink-0 mt-0.5" style={{ color: data.primaryColor }} />
                  <span className="text-[10px] text-gray-600 leading-relaxed line-clamp-2">{data.contactAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Social links */}
          {data.socialLinks && Object.values(data.socialLinks).some(Boolean) && (
            <div className="mx-3 mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Volg ons</p>
              <div className="flex gap-3">
                {data.socialLinks.facebook && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${data.primaryColor}15` }}>
                    <Facebook className="w-3.5 h-3.5" style={{ color: data.primaryColor }} />
                  </div>
                )}
                {data.socialLinks.instagram && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${data.primaryColor}15` }}>
                    <Instagram className="w-3.5 h-3.5" style={{ color: data.primaryColor }} />
                  </div>
                )}
                {data.socialLinks.linkedin && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${data.primaryColor}15` }}>
                    <Linkedin className="w-3.5 h-3.5" style={{ color: data.primaryColor }} />
                  </div>
                )}
                {data.socialLinks.twitter && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${data.primaryColor}15` }}>
                    <Twitter className="w-3.5 h-3.5" style={{ color: data.primaryColor }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Platform badge */}
          <div className="mx-3 mt-3 mb-4 text-center">
            <span className="text-[9px] text-gray-300">Mogelijk gemaakt door Vrijwilligersmatch</span>
          </div>
        </div>
      </div>

      {/* Colour palette */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500">Kleurenpalet</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Primair", color: data.primaryColor },
            { label: "Accent", color: data.accentColor ?? data.primaryColor },
            { label: "Licht", color: `${data.primaryColor}20` },
            { label: "Border", color: `${data.primaryColor}33` },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border border-gray-100 shadow-sm flex-shrink-0" style={{ background: color }} />
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-600">{label}</p>
                <p className="text-[9px] font-mono text-gray-400">{color}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Website link */}
      {data.website && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <a href={data.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:text-purple-700 truncate underline-offset-2 hover:underline">
              {data.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main editor ──────────────────────────────────────────────────────────────

export function GemeenteBrandingEditor({ initial }: { initial: GemeenteData }) {
  const [data, setData] = useState<GemeenteData>(initial)
  const [status, setStatus] = useState<SaveStatus>("idle")

  const set = useCallback(<K extends keyof GemeenteData>(key: K, value: GemeenteData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setStatus("idle")
  }, [])

  const setSocial = useCallback((key: keyof SocialLinks, value: string) => {
    setData((prev) => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks ?? {}), [key]: value || null },
    }))
    setStatus("idle")
  }, [])

  async function save() {
    setStatus("saving")
    try {
      const res = await fetch(`/api/admin/gemeenten/${data.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      setStatus(res.ok ? "saved" : "error")
      if (res.ok) setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="flex gap-8 items-start">

      {/* ── Left: settings panels ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Identiteit */}
        <Section icon={Globe} title="Identiteit">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Platform naam (bijv. WijHeemstede)">
              <input className={inputCls} value={data.name}
                onChange={(e) => set("name", e.target.value)} placeholder="WijHeemstede" />
            </Field>
            <Field label="Officiële naam">
              <input className={inputCls} value={data.displayName}
                onChange={(e) => set("displayName", e.target.value)} placeholder="Heemstede" />
            </Field>
          </div>
          <Field label="Tagline">
            <input className={inputCls} value={data.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value || null)}
              placeholder="Vrijwilligerswerk in Heemstede & omgeving" />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={data.website ?? ""}
              onChange={(e) => set("website", e.target.value || null)}
              placeholder="https://www.wijheemstede.nl" type="url" />
          </Field>
          <Field label="Contact e-mail">
            <input className={inputCls} value={data.contactEmail ?? ""}
              onChange={(e) => set("contactEmail", e.target.value || null)}
              placeholder="info@wijheemstede.nl" type="email" />
          </Field>
        </Section>

        {/* Kleuren */}
        <Section icon={Palette} title="Kleuren">
          <p className="text-xs text-gray-400 -mt-2">
            Pas de kleuren aan en zie direct het resultaat in het voorbeeld.
          </p>
          <div className="space-y-3">
            <ColorField label="Primair" value={data.primaryColor}
              onChange={(v) => set("primaryColor", v)} />
            <ColorField label="Accent" value={data.accentColor ?? data.primaryColor}
              onChange={(v) => set("accentColor", v)} />
          </div>
          <div className="flex gap-2 pt-1">
            {[
              ["Paars", "#6d28d9", "#8b5cf6"],
              ["Blauw", "#1d4ed8", "#3b82f6"],
              ["Groen", "#15803d", "#22c55e"],
              ["Rood", "#b91c1c", "#ef4444"],
              ["Oranje", "#c2410c", "#f97316"],
              ["Roze", "#9d174d", "#ec4899"],
            ].map(([name, primary, accent]) => (
              <button
                key={name}
                onClick={() => { set("primaryColor", primary); set("accentColor", accent) }}
                title={name}
                className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              />
            ))}
          </div>
        </Section>

        {/* Media */}
        <Section icon={ImageIcon} title="Media & Huisstijl">
          <ImageField label="Logo (wordt getoond naast de naam)"
            value={data.logoUrl} onChange={(v) => set("logoUrl", v)}
            hint="Aanbevolen: vierkant, minimaal 128×128px, PNG of SVG" />
          <ImageField label="Hero afbeelding (achtergrond op homepagina)"
            value={data.heroImageUrl} onChange={(v) => set("heroImageUrl", v)}
            hint="Aanbevolen: 1440×600px, herkenbaar beeld van de gemeente" />
          <ImageField label="Favicon"
            value={data.faviconUrl} onChange={(v) => set("faviconUrl", v)}
            hint="Favicon dat in de browsertab wordt getoond (32×32px, .ico of .png)" />
        </Section>

        {/* Welkomstbericht */}
        <Section icon={MessageSquare} title="Welkomstbericht">
          <p className="text-xs text-gray-400 -mt-2">
            Wordt getoond aan nieuwe vrijwilligers tijdens de registratie.
          </p>
          <Field label="Titel">
            <input className={inputCls} value={data.welcomeTitle ?? ""}
              onChange={(e) => set("welcomeTitle", e.target.value || null)}
              placeholder={`Welkom bij ${data.name || "WijGemeente"}!`} />
          </Field>
          <Field label="Bericht">
            <textarea className={`${inputCls} resize-y`} rows={4}
              value={data.welcomeMessage ?? ""}
              onChange={(e) => set("welcomeMessage", e.target.value || null)}
              placeholder="Beschrijf in eigen woorden wat vrijwilligers in jouw gemeente kunnen verwachten…" />
            <p className="text-[11px] text-gray-400 mt-1">{(data.welcomeMessage ?? "").length}/2000</p>
          </Field>
        </Section>

        {/* Contact */}
        <Section icon={Phone} title="Contact">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefoonnummer">
              <input className={inputCls} value={data.contactPhone ?? ""}
                onChange={(e) => set("contactPhone", e.target.value || null)}
                placeholder="023-547 8900" type="tel" />
            </Field>
          </div>
          <Field label="Adres">
            <textarea className={`${inputCls} resize-none`} rows={2}
              value={data.contactAddress ?? ""}
              onChange={(e) => set("contactAddress", e.target.value || null)}
              placeholder={"Vrijwilligersplein 1\n2102 AB Heemstede"} />
          </Field>
        </Section>

        {/* Sociaal */}
        <Section icon={Globe} title="Sociale media">
          <div className="space-y-3">
            {([
              ["facebook", Facebook, "Facebook pagina URL"],
              ["instagram", Instagram, "Instagram profiel URL"],
              ["linkedin", Linkedin, "LinkedIn pagina URL"],
              ["twitter", Twitter, "X / Twitter URL"],
            ] as const).map(([key, Icon, placeholder]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <input className={inputCls}
                  value={data.socialLinks?.[key] ?? ""}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={placeholder} type="url" />
              </div>
            ))}
          </div>
        </Section>

        {/* E-mail handtekening */}
        <Section icon={Mail} title="E-mail handtekening">
          <p className="text-xs text-gray-400 -mt-2">
            Wordt onderaan alle systeemmails vanuit jouw gemeente geplaatst.
          </p>
          <Field label="Handtekening">
            <textarea className={`${inputCls} resize-y font-mono text-xs`} rows={4}
              value={data.emailSignature ?? ""}
              onChange={(e) => set("emailSignature", e.target.value || null)}
              placeholder={`Met vriendelijke groet,\nVrijwilligerspunt WIJ ${data.displayName || "Gemeente"}\n${data.contactPhone ?? ""}`} />
          </Field>
        </Section>

        {/* Save button (bottom) */}
        <div className="flex items-center gap-4 pb-8">
          <button
            onClick={save}
            disabled={status === "saving"}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70"
            style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.accentColor ?? data.primaryColor})` }}
          >
            {status === "saving"
              ? <><Loader2 className="w-4 h-4 animate-spin" />Opslaan…</>
              : status === "saved"
              ? <><CheckCircle2 className="w-4 h-4" />Opgeslagen!</>
              : <><Save className="w-4 h-4" />Wijzigingen opslaan</>
            }
          </button>
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              Opslaan mislukt. Probeer opnieuw.
            </span>
          )}
          {status === "saved" && (
            <span className="text-sm text-green-600 font-medium">Wijzigingen zijn live!</span>
          )}
        </div>
      </div>

      {/* ── Right: sticky live preview ──────────────────────────────────── */}
      <div className="w-[320px] shrink-0 sticky top-6">
        <LivePreview data={data} />
      </div>
    </div>
  )
}
