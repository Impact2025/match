"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sliders, RotateCcw, Save, Info } from "lucide-react"
import type { ScoringWeights } from "@/lib/matching/scoring-engine"

interface Props {
  initialWeights: ScoringWeights
  defaults: ScoringWeights
}

const COMPONENT_WEIGHTS: (keyof ScoringWeights)[] = ["motivation", "distance", "skill", "freshness"]

const LABELS: Record<string, { nl: string; desc: string }> = {
  motivation:  { nl: "Motivatie",   desc: "VFI-profiel + Schwartz waarden + categorie-interesse overlap" },
  distance:    { nl: "Afstand",     desc: "Haversine afstand + remote bonus" },
  skill:       { nl: "Vaardigheden", desc: "Overlap tussen vrijwilliger- en vacaturevaardigheden" },
  freshness:   { nl: "Versheid",    desc: "Recency van de vacature (lineair verval)" },
  freshnessWindowDays: { nl: "Versheidsvenster (dagen)", desc: "Na hoeveel dagen is de versheids­score 0?" },
  smallOrgThreshold:   { nl: "Kleine organisatie drempel", desc: "Minder dan N swipes → kleine org boost (max +40%)" },
  largeOrgThreshold:   { nl: "Grote organisatie drempel", desc: "Meer dan N swipes → grote org afzwakking (max -30%)" },
}

function pct(v: number) {
  return Math.round(v * 100)
}

export function ScoringWeightsPanel({ initialWeights, defaults }: Props) {
  const [weights, setWeights] = useState<ScoringWeights>(initialWeights)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const componentSum = COMPONENT_WEIGHTS.reduce((s, k) => s + weights[k], 0)
  const sumPct = Math.round(componentSum * 100)
  const sumOk = Math.abs(componentSum - 1.0) <= 0.005

  function updateWeight(key: keyof ScoringWeights, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function resetToDefaults() {
    setWeights(defaults)
    setDirty(true)
  }

  async function save() {
    if (!sumOk) {
      toast.error(`Gewichten tellen op tot ${sumPct}% — moet precies 100% zijn.`)
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/scoring-weights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Opslaan mislukt")
        return
      }

      toast.success("Gewichten opgeslagen en direct actief!")
      setDirty(false)
    } catch {
      toast.error("Netwerkfout bij opslaan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Component weights */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Component gewichten</h2>
        </div>
        <p className="text-white/30 text-xs mb-5">
          Elk gewicht bepaalt hoe zwaar die factor meeweegt in de eindscore (0–100). De som moet exact 100% zijn.
        </p>

        <div className="space-y-5">
          {COMPONENT_WEIGHTS.map((key) => {
            const pctVal = pct(weights[key])
            const defPct = pct(defaults[key])
            const changed = weights[key] !== defaults[key]
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">{LABELS[key]?.nl}</span>
                    {changed && (
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                        gewijzigd (standaard: {defPct}%)
                      </span>
                    )}
                  </div>
                  <span className="text-[#FF6B35] font-mono text-sm font-semibold">{pctVal}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pctVal}
                  onChange={(e) => updateWeight(key, parseInt(e.target.value) / 100)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${pctVal}%, #333 ${pctVal}%, #333 100%)`,
                  }}
                />
                <p className="text-white/25 text-[11px] mt-1">{LABELS[key]?.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Sum indicator */}
        <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${sumOk ? "text-green-400" : "text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${sumOk ? "bg-green-400" : "bg-red-400"}`} />
          Totaal: {sumPct}% {sumOk ? "✓" : `(${sumPct > 100 ? "te hoog" : "te laag"} — moet 100% zijn)`}
        </div>
      </div>

      {/* Advanced config */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Info className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-white font-semibold text-sm">Geavanceerde instellingen</h2>
        </div>

        <div className="space-y-5">
          {(["freshnessWindowDays", "smallOrgThreshold", "largeOrgThreshold"] as const).map((key) => {
            const val = weights[key] as number
            const defVal = defaults[key] as number
            const changed = val !== defVal
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">{LABELS[key]?.nl}</span>
                    {changed && (
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                        gewijzigd (standaard: {defVal})
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={key === "freshnessWindowDays" ? 365 : 10000}
                    value={val}
                    onChange={(e) => updateWeight(key, parseInt(e.target.value) || defVal)}
                    className="w-24 bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm text-right font-mono focus:outline-none focus:border-[#FF6B35]/50"
                  />
                </div>
                <p className="text-white/25 text-[11px]">{LABELS[key]?.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04] text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Standaardwaarden
        </button>

        <button
          onClick={save}
          disabled={saving || !dirty || !sumOk}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "Opslaan..." : "Opslaan"}
        </button>

        {dirty && !sumOk && (
          <p className="text-red-400 text-xs">
            Gewichten moeten optellen tot 100%
          </p>
        )}
      </div>
    </div>
  )
}
