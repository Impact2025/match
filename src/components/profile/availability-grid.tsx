"use client"

import { Check } from "lucide-react"

const DAYS = [
  { value: "monday",    label: "Maandag",   short: "Ma" },
  { value: "tuesday",   label: "Dinsdag",   short: "Di" },
  { value: "wednesday", label: "Woensdag",  short: "Wo" },
  { value: "thursday",  label: "Donderdag", short: "Do" },
  { value: "friday",    label: "Vrijdag",   short: "Vr" },
  { value: "saturday",  label: "Zaterdag",  short: "Za" },
  { value: "sunday",    label: "Zondag",    short: "Zo" },
]

const SLOTS = [
  { value: "morning",   label: "Ochtend" },
  { value: "afternoon", label: "Middag"  },
  { value: "evening",   label: "Avond"   },
]

interface AvailabilityGridProps {
  selected: string[]
  onChange: (slots: string[]) => void
  activeColor?: string
}

export function AvailabilityGrid({ selected, onChange, activeColor }: AvailabilityGridProps) {
  const color = activeColor ?? "#f97316"

  function toggle(day: string, slot: string) {
    const key = `${day}_${slot}`
    onChange(selected.includes(key) ? selected.filter((s) => s !== key) : [...selected, key])
  }

  const count = selected.length

  return (
    <div className="space-y-2">
      <div className="w-full">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-16" />
              {SLOTS.map((s) => (
                <th key={s.value} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 text-center">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day.value}>
                <td className="text-xs font-medium text-gray-600 pr-2 py-1 w-16">{day.label}</td>
                {SLOTS.map((slot) => {
                  const key = `${day.value}_${slot.value}`
                  const active = selected.includes(key)
                  return (
                    <td key={slot.value} className="text-center py-1">
                      <button
                        type="button"
                        onClick={() => toggle(day.value, slot.value)}
                        aria-label={`${day.label} ${slot.label}`}
                        className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center mx-auto ${
                          active ? "" : "border-gray-200 bg-gray-50 hover:border-orange-300"
                        }`}
                        style={active ? { borderColor: color, backgroundColor: color } : undefined}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        {count === 0
          ? "Selecteer jouw beschikbare momenten"
          : `${count} moment${count === 1 ? "" : "en"} geselecteerd`}
      </p>
    </div>
  )
}

/** Convert legacy flat format ["monday","morning"] to combined ["monday_morning"].
 *  Call this once when loading existing user data. */
export function migrateLegacyAvailability(raw: string[]): string[] {
  const days  = new Set(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"])
  const slots = new Set(["morning","afternoon","evening"])

  // Already new format — passthrough
  if (raw.every((v) => v.includes("_"))) return raw

  const selectedDays  = raw.filter((v) => days.has(v))
  const selectedSlots = raw.filter((v) => slots.has(v))

  // If mixed (some new, some old), return as-is
  if (raw.some((v) => v.includes("_"))) return raw

  // Both lists present → expand to all combinations
  if (selectedDays.length > 0 && selectedSlots.length > 0) {
    return selectedDays.flatMap((d) => selectedSlots.map((s) => `${d}_${s}`))
  }

  // Only days or only slots stored → nothing we can do
  return []
}
