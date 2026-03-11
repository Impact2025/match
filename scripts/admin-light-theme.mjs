import { readFileSync, writeFileSync } from "fs"

const FILES = [
  "src/app/(admin)/layout.tsx",
  "src/app/(admin)/admin/dashboard/page.tsx",
  "src/app/(admin)/admin/organisations/page.tsx",
  "src/app/(admin)/admin/users/page.tsx",
  "src/app/(admin)/admin/vacancies/page.tsx",
  "src/app/(admin)/admin/logs/page.tsx",
  "src/app/(admin)/admin/settings/page.tsx",
  "src/app/(admin)/admin/scoring/page.tsx",
  "src/app/(admin)/admin/categories/page.tsx",
  "src/app/(admin)/admin/organisations/[id]/page.tsx",
  "src/components/admin/sidebar.tsx",
  "src/components/admin/status-badges.tsx",
  "src/components/admin/user-action-button.tsx",
  "src/components/admin/vacancy-admin-actions.tsx",
  "src/components/admin/taxonomy-forms.tsx",
  "src/components/admin/scoring-weights-panel.tsx",
  "src/app/(admin)/admin/analytics/page.tsx",
  "src/app/(admin)/admin/organisations/[id]/org-action-form.tsx",
]

// Order matters — more specific before less specific
const REPLACEMENTS = [
  // Dark backgrounds → light
  ["bg-[#0f0f0f]",        "bg-gray-50"],
  ["bg-[#080808]",        "bg-white"],
  ["bg-[#161616]",        "bg-white"],
  ["bg-[#1a1a1a]",        "bg-white"],
  ["bg-[#0d0d0d]",        "bg-gray-50"],
  ["bg-white/[0.04]",     "bg-gray-100"],
  ["bg-white/[0.025]",    "bg-gray-50"],
  ["bg-white/5",          "bg-gray-100"],
  // Borders
  ["border-white/[0.08]", "border-gray-200"],
  ["border-white/[0.06]", "border-gray-100"],
  ["border-white/[0.05]", "border-gray-100"],
  ["border-white/[0.04]", "border-gray-100"],
  ["border-white/[0.03]", "border-gray-100"],
  ["border-white/10",     "border-gray-200"],
  // Hover
  ["hover:bg-white/[0.02]",  "hover:bg-gray-50"],
  ["hover:bg-white/[0.015]", "hover:bg-gray-50"],
  ["hover:bg-white/[0.025]", "hover:bg-gray-50"],
  ["hover:bg-white/[0.03]",  "hover:bg-gray-50"],
  ["hover:bg-white/[0.04]",  "hover:bg-gray-100"],
  // Text opacity variants — safe, unambiguous
  ["text-white/85", "text-gray-700"],
  ["text-white/80", "text-gray-700"],
  ["text-white/75", "text-gray-600"],
  ["text-white/70", "text-gray-600"],
  ["text-white/65", "text-gray-500"],
  ["text-white/60", "text-gray-500"],
  ["text-white/55", "text-gray-500"],
  ["text-white/50", "text-gray-400"],
  ["text-white/45", "text-gray-400"],
  ["text-white/40", "text-gray-400"],
  ["text-white/35", "text-gray-400"],
  ["text-white/30", "text-gray-400"],
  ["text-white/25", "text-gray-300"],
  ["text-white/20", "text-gray-300"],
  ["text-white/15", "text-gray-200"],
  // Placeholder
  ["placeholder-white/20", "placeholder-gray-300"],
  // Orange brand (specific before generic)
  ["bg-[#FF6B35]/10",     "bg-orange-50"],
  ["bg-[#FF6B35]/15",     "bg-orange-100"],
  ["border-[#FF6B35]/40", "border-orange-300"],
  ["border-[#FF6B35]/20", "border-orange-200"],
  ["text-[#FF6B35]/80",   "text-orange-400"],
  ["text-[#FF6B35]",      "text-orange-500"],
  ["hover:bg-[#e55a27]",  "hover:bg-orange-600"],
  ["bg-[#FF6B35]",        "bg-orange-500"],
  ["focus:border-[#FF6B35]/50", "focus:border-orange-300"],
  ["focus:border-[#FF6B35]/40", "focus:border-orange-300"],
  ["shadow-2xl shadow-black/50", "shadow-lg shadow-gray-200/60"],
  ["text-white text-sm", "text-gray-900 text-sm"],
  // Status color bg + border (specific before generic)
  ["bg-green-400/10",   "bg-green-50"],
  ["border-green-400/20", "border-green-200"],
  ["bg-green-500/10",   "bg-green-50"],
  ["bg-red-400/10",     "bg-red-50"],
  ["border-red-400/20", "border-red-200"],
  ["bg-amber-400/10",   "bg-amber-50"],
  ["border-amber-400/20","border-amber-200"],
  ["bg-amber-500/8",    "bg-amber-50"],
  ["bg-amber-500/10",   "bg-amber-50"],
  ["bg-amber-500/15",   "bg-amber-100"],
  ["border-amber-500/20","border-amber-200"],
  ["border-amber-500/30","border-amber-300"],
  ["bg-amber-500/25",   "bg-amber-100"],
  ["bg-blue-400/10",    "bg-blue-50"],
  ["border-blue-400/20","border-blue-200"],
  ["bg-purple-400/10",  "bg-purple-50"],
  ["border-purple-400/20","border-purple-200"],
  // Status text colors
  ["text-green-400", "text-green-600"],
  ["text-red-400",   "text-red-600"],
  ["text-amber-400", "text-amber-600"],
  ["text-blue-400",  "text-blue-600"],
  ["text-purple-400","text-purple-600"],
  ["text-pink-400",  "text-pink-600"],
  ["text-orange-400","text-orange-500"],
  ["bg-orange-400/10","bg-orange-50"],
  // Standalone text-white on dark backgrounds → gray (specific patterns first)
  ["text-white tracking-tight", "text-gray-900 tracking-tight"],
  ["text-white font-bold tracking-tight", "text-gray-900 font-bold tracking-tight"],
  ['text-white font-bold text-white', 'text-gray-900 font-bold'], // safety
  ["text-white font-semibold text-sm", "text-gray-900 font-semibold text-sm"],
  ["text-white font-semibold", "text-gray-900 font-semibold"],
  ["text-white font-bold",     "text-gray-900 font-bold"],
  ["text-white font-medium",   "text-gray-900 font-medium"],
  // Remaining text-white in non-button JSX attribute positions
  // (buttons with bg-orange-500 keep their text-white)
  [/"text-white text-sm font-semibold"/g, '"text-gray-900 text-sm font-semibold"'],
]

let changed = 0
for (const rel of FILES) {
  let src
  try { src = readFileSync(rel, "utf8") } catch { console.warn("skip:", rel); continue }
  let out = src
  for (const [from, to] of REPLACEMENTS) {
    if (typeof from === "string") {
      out = out.split(from).join(to)
    } else {
      out = out.replace(from, to)
    }
  }
  if (out !== src) {
    writeFileSync(rel, out, "utf8")
    console.log("updated:", rel)
    changed++
  }
}
console.log(`\nDone. ${changed} files updated.`)
