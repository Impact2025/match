"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  Sparkles,
  Globe,
  Mail,
  Phone,
  Building2,
  Tag,
  FileText,
  Check,
  Upload,
  Users,
  Heart,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES } from "@/config"

type OrgStep = "organisatie" | "doelgroepen" | "verhaal" | "contact"
const STEPS: OrgStep[] = ["organisatie", "doelgroepen", "verhaal", "contact"]
const TOTAL = STEPS.length

const STEP_TITLES: Record<OrgStep, string> = {
  organisatie: "Vertel ons over jullie organisatie",
  doelgroepen: "Wie helpen jullie?",
  verhaal:     "Jullie verhaal",
  contact:     "Contact & locatie",
}

const STEP_SUBTITLES: Record<OrgStep, string> = {
  organisatie: "Begin met de naam, het logo en de omvang van jullie organisatie.",
  doelgroepen: "Selecteer de doelgroepen en het type inzet dat jullie zoeken.",
  verhaal:     "Beschrijf jullie organisatie en geef aan wat vrijwilligers bij jullie kunnen verwachten.",
  contact:     "Vul jullie contactgegevens in. Alles is optioneel.",
}

const STEP_ICONS: Record<OrgStep, React.ReactNode> = {
  organisatie: <Building2 className="w-3.5 h-3.5" />,
  doelgroepen: <Tag className="w-3.5 h-3.5" />,
  verhaal:     <FileText className="w-3.5 h-3.5" />,
  contact:     <MapPin className="w-3.5 h-3.5" />,
}

const ORG_SIZES = [
  { value: "starter",  label: "Starter",       desc: "Minder dan 10 vrijwilligers" },
  { value: "middel",   label: "Middelgroot",    desc: "10 tot 50 vrijwilligers" },
  { value: "groot",    label: "Groot",          desc: "Meer dan 50 vrijwilligers" },
]

const INZET_TYPES = [
  { value: "wekelijks",    label: "Wekelijkse vaste inzet",  desc: "Vrijwilligers die structureel terugkomen" },
  { value: "projectmatig", label: "Projectmatig",            desc: "Per project of tijdelijke periode" },
  { value: "incidenteel",  label: "Incidenteel / eenmalig",  desc: "Losse klussen of evenementen" },
]

const VOLUNTEER_BENEFITS = [
  { value: "begeleiding",    label: "Persoonlijke begeleiding",    icon: "🤝" },
  { value: "reiskosten",     label: "Reiskostenvergoeding",        icon: "🚌" },
  { value: "onkosten",       label: "Onkostenvergoeding",          icon: "💶" },
  { value: "opleiding",      label: "Opleiding / training",        icon: "🎓" },
  { value: "certificaat",    label: "Certificaat / referentie",    icon: "📜" },
  { value: "teamactiviteit", label: "Teamactiviteiten",            icon: "🎉" },
  { value: "flexibel",       label: "Flexibele tijden",            icon: "⏰" },
  { value: "werkervaring",   label: "Relevante werkervaring",      icon: "💼" },
]

export function OrgOnboardingFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showWelcome,     setShowWelcome]     = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStep,     setCurrentStep]     = useState(0)

  // Step 1
  const [orgName,     setOrgName]     = useState("")
  const [orgSize,     setOrgSize]     = useState<string>("")
  const [logoUrl,     setLogoUrl]     = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedInzetTypes, setSelectedInzetTypes] = useState<string[]>([])

  // Step 3
  const [description,       setDescription]       = useState("")
  const [selectedBenefits,  setSelectedBenefits]  = useState<string[]>([])
  const [generatingAI,      setGeneratingAI]       = useState(false)

  // Step 4
  const [website,  setWebsite]  = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [phone,    setPhone]    = useState("")
  const [address,  setAddress]  = useState("")
  const [postcode, setPostcode] = useState("")
  const [city,     setCity]     = useState("")
  const [geocodedLat, setGeocodedLat] = useState<number | null>(null)
  const [geocodedLon, setGeocodedLon] = useState<number | null>(null)
  const [geocoding,   setGeocoding]   = useState(false)
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const userName = (session?.user as { name?: string } | null)?.name
    if (userName && !orgName) setOrgName(userName)
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    const isValid = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postcode)
    if (!isValid) return
    setGeocoding(true)
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?postcode=${encodeURIComponent(postcode)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.city) setCity(data.city)
          if (data?.lat != null) setGeocodedLat(data.lat)
          if (data?.lon != null) setGeocodedLon(data.lon)
        }
      } finally {
        setGeocoding(false)
      }
    }, 800)
    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current) }
  }, [postcode])

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload?type=orgLogo", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload mislukt")
      const data = await res.json()
      setLogoUrl(data.url)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Logo uploaden mislukt.")
    } finally {
      setUploading(false)
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat])
  }

  function toggleInzetType(val: string) {
    setSelectedInzetTypes((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val])
  }

  function toggleBenefit(val: string) {
    setSelectedBenefits((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val])
  }

  async function handleGenerateDescription() {
    if (selectedCategories.length === 0 || !orgName.trim()) return
    setGeneratingAI(true)
    try {
      const res = await fetch("/api/ai/org-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, categories: selectedCategories }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.description) setDescription(data.description)
      }
    } finally {
      setGeneratingAI(false)
    }
  }

  function canProceed(): boolean {
    switch (STEPS[currentStep]) {
      case "organisatie": return orgName.trim().length >= 2
      case "doelgroepen": return selectedCategories.length >= 1
      case "verhaal":     return description.trim().length >= 20
      case "contact":     return true
    }
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) setCurrentStep((p) => p + 1)
    else complete()
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((p) => p - 1)
  }

  async function complete() {
    setIsLoading(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationName:  orgName,
          logo:              logoUrl,
          orgSize:           orgSize || undefined,
          orgCategories:     selectedCategories,
          inzetType:         selectedInzetTypes,
          description,
          volunteerBenefits: selectedBenefits,
          website:           website || undefined,
          orgEmail:          orgEmail || undefined,
          phone:             phone || undefined,
          address:           address || undefined,
          postcode:          postcode || undefined,
          city:              city || undefined,
          lat:               geocodedLat,
          lon:               geocodedLon,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error ?? "Opslaan mislukt. Probeer het opnieuw.")
        setIsLoading(false)
        return
      }
      setShowCelebration(true)
      await new Promise((r) => setTimeout(r, 2200))
      router.refresh()
      router.push("/organisation/dashboard")
    } catch {
      setSaveError("Netwerkfout. Controleer je verbinding en probeer opnieuw.")
      setIsLoading(false)
    }
  }

  const step       = STEPS[currentStep]
  const stepNumber = currentStep + 1
  const isLastStep = currentStep === STEPS.length - 1
  const firstName  = (orgName || (session?.user as { name?: string } | null)?.name || "").split(" ")[0]

  // ── Celebration ─────────────────────────────────────────────────────────────
  if (showCelebration) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-400 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6"
        >
          <Heart className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-3 text-center"
        >
          {firstName ? `${firstName} staat op de kaart!` : "Jullie staan op de kaart!"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="text-white/80 text-center leading-relaxed mb-10 max-w-xs"
        >
          Het organisatieprofiel is aangemaakt. Vrijwilligers kunnen jullie nu vinden!
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-white/70 text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Je wordt doorgestuurd...
        </motion.div>
      </motion.div>
    )
  }

  // ── Welcome ──────────────────────────────────────────────────────────────────
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-10 pb-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6"
          >
            <Building2 className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Welkom{firstName ? `, ${firstName}` : ""}!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-gray-500 text-sm leading-relaxed mb-7"
          >
            We helpen jullie in{" "}
            <span className="font-semibold text-orange-500">4 stappen</span> een compleet
            organisatieprofiel aanmaken. Duurt maar 3 minuten.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full space-y-2"
          >
            {[
              { icon: <Building2 className="w-4 h-4 text-gray-400" />, text: "Organisatienaam, logo & omvang" },
              { icon: <Tag       className="w-4 h-4 text-gray-400" />, text: "Doelgroepen en type inzet" },
              { icon: <FileText  className="w-4 h-4 text-gray-400" />, text: "Jullie verhaal (met AI-hulp)" },
              { icon: <MapPin    className="w-4 h-4 text-gray-400" />, text: "Contactgegevens en locatie" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.07 }}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left"
              >
                {item.icon}
                <span className="text-sm text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="px-5 pb-8 pt-2">
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowWelcome(false)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors text-base"
          >
            Profiel aanmaken
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Door verder te gaan ga je akkoord met onze gebruiksvoorwaarden.
          </p>
        </div>
      </div>
    )
  }

  // ── Main flow ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-8 h-8 flex items-center justify-center text-gray-400 disabled:opacity-0 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-sm text-gray-400 font-medium">{stepNumber} / {TOTAL}</span>
        <div className="w-8" />
      </div>

      {/* Progress bar (matching volunteer flow) */}
      <div className="px-5 mb-6">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            animate={{ width: `${(stepNumber / TOTAL) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1.5">
              {STEP_TITLES[step]}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {STEP_SUBTITLES[step]}
            </p>

            {/* ── Step 1: Organisatie ─────────────────────────────────────── */}
            {step === "organisatie" && (
              <div className="space-y-5">
                {/* Naam */}
                <div className="space-y-1.5">
                  <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                    Naam van de organisatie <span className="text-orange-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Naam van jullie organisatie"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>

                {/* Organisatiegrootte */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Hoe groot is jullie organisatie?
                  </Label>
                  <div className="flex flex-col gap-2">
                    {ORG_SIZES.map(({ value, label, desc }) => (
                      <motion.button
                        key={value}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setOrgSize(value)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          orgSize === value
                            ? "border-orange-400 bg-orange-50"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          orgSize === value ? "border-orange-500 bg-orange-500" : "border-gray-300"
                        }`}>
                          {orgSize === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${orgSize === value ? "text-orange-700" : "text-gray-800"}`}>{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Logo <span className="text-xs font-normal text-gray-400">(optioneel)</span>
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                      uploading
                        ? "border-orange-300 bg-orange-50"
                        : logoUrl
                        ? "border-orange-200 bg-white"
                        : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-4" />
                    ) : uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                        <p className="text-sm text-orange-500 font-medium">Uploaden...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center px-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Klik om logo te uploaden</p>
                        <p className="text-xs text-gray-400">JPG, PNG · Max. 4 MB</p>
                      </div>
                    )}
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Ander logo kiezen
                    </button>
                  )}
                  {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                </div>
              </div>
            )}

            {/* ── Step 2: Doelgroepen & Inzet ────────────────────────────── */}
            {step === "doelgroepen" && (
              <div className="space-y-6">
                {/* Categorieën */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const selected = selectedCategories.includes(cat.name)
                      return (
                        <motion.button
                          key={cat.name}
                          whileTap={{ scale: 0.91 }}
                          onClick={() => toggleCategory(cat.name)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected
                              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                          {selected && <Check className="w-3 h-3 ml-0.5" />}
                        </motion.button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedCategories.length === 0
                      ? "Selecteer minimaal één doelgroep"
                      : `${selectedCategories.length} geselecteerd`}
                  </p>
                </div>

                {/* Inzet types */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-gray-800">Wat voor inzet zoeken jullie?</p>
                  <p className="text-xs text-gray-400 -mt-1">Meerdere opties mogelijk</p>
                  <div className="flex flex-col gap-2">
                    {INZET_TYPES.map(({ value, label, desc }) => {
                      const selected = selectedInzetTypes.includes(value)
                      return (
                        <motion.button
                          key={value}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => toggleInzetType(value)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                            selected ? "border-orange-500 bg-orange-500" : "border-gray-300"
                          }`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${selected ? "text-orange-700" : "text-gray-800"}`}>{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Jullie verhaal ──────────────────────────────────── */}
            {step === "verhaal" && (
              <div className="space-y-5">
                {/* Beschrijving */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      Beschrijving <span className="text-orange-500">*</span>
                    </Label>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateDescription}
                      disabled={generatingAI || selectedCategories.length === 0 || !orgName.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {generatingAI ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Genereren...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" /> AI genereren</>
                      )}
                    </motion.button>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschrijf wat jullie organisatie doet, voor wie jullie werken en waarom vrijwilligers bij jullie passen..."
                    className="min-h-[130px] rounded-xl border-gray-200 bg-white resize-none text-sm"
                  />
                  <p className="text-xs text-gray-400">{description.length} tekens (min. 20)</p>
                  {selectedCategories.length === 0 && (
                    <p className="text-xs text-amber-600">Selecteer eerst doelgroepen (stap 2) om AI te gebruiken.</p>
                  )}
                </div>

                {/* Wat bieden jullie? */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-gray-800">Wat bieden jullie vrijwilligers?</p>
                  <p className="text-xs text-gray-400 -mt-1">Selecteer alles wat van toepassing is</p>
                  <div className="grid grid-cols-2 gap-2">
                    {VOLUNTEER_BENEFITS.map(({ value, label, icon }) => {
                      const selected = selectedBenefits.includes(value)
                      return (
                        <motion.button
                          key={value}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => toggleBenefit(value)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{icon}</span>
                          <span className={`text-xs font-medium leading-tight ${selected ? "text-orange-700" : "text-gray-700"}`}>
                            {label}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Contact ─────────────────────────────────────────── */}
            {step === "contact" && (
              <div className="space-y-5">
                {/* Online */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Online</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.organisatie.nl"
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="info@organisatie.nl"
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="020-1234567 of 06-12345678"
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Locatie */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Locatie</p>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Straat en huisnummer"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="1234 AB"
                      maxLength={7}
                      className="pl-10 pr-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                    {geocoding && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  {/* City badge — geen extra input veld */}
                  {city && !geocoding && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-700">{city}</span>
                      <span className="text-xs text-green-500 ml-auto">automatisch ingevuld</span>
                    </div>
                  )}
                  {!city && !geocoding && postcode && (
                    <p className="text-xs text-gray-400 pl-1">Stad wordt automatisch ingevuld op basis van de postcode.</p>
                  )}
                </div>

                {/* Info box */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Jullie profiel wordt na aanmelding handmatig geverifieerd. Na goedkeuring zijn jullie zichtbaar voor vrijwilligers.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-4">
        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-3">
            {saveError}
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={nextStep}
          disabled={isLoading || !canProceed()}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 text-base"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Opslaan...</>
          ) : (
            <>{isLastStep ? "Profiel opslaan" : "Volgende"}<ChevronRight className="w-5 h-5" strokeWidth={2.5} /></>
          )}
        </motion.button>
        {currentStep === 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Door verder te gaan ga je akkoord met onze gebruiksvoorwaarden.
          </p>
        )}
      </div>
    </div>
  )
}
