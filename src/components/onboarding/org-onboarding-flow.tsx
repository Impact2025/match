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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES } from "@/config"


type OrgStep = "organisatie" | "categorieën" | "beschrijving" | "contact"
const STEPS: OrgStep[] = ["organisatie", "categorieën", "beschrijving", "contact"]
const TOTAL = STEPS.length

const STEP_TITLES: Record<OrgStep, string> = {
  organisatie: "Vertel ons over jullie organisatie",
  categorieën: "Welke doelgroepen bedienen jullie?",
  beschrijving: "Beschrijf jullie organisatie",
  contact: "Contactgegevens & locatie",
}

const STEP_SUBTITLES: Record<OrgStep, string> = {
  organisatie: "Beginnen met de basisgegevens. Upload jullie logo zodat vrijwilligers jullie herkennen.",
  categorieën: "Selecteer de doelgroepen waarop jullie organisatie zich richt.",
  beschrijving: "Vertel in een paar zinnen wat jullie organisatie doet en waarvoor jullie vrijwilligers zoeken.",
  contact: "Vul jullie contactgegevens in zodat vrijwilligers jullie kunnen bereiken. Alles is optioneel.",
}

const STEP_ICONS: Record<OrgStep, React.ReactNode> = {
  organisatie: <Building2 className="w-3.5 h-3.5" />,
  categorieën: <Tag className="w-3.5 h-3.5" />,
  beschrijving: <FileText className="w-3.5 h-3.5" />,
  contact: <MapPin className="w-3.5 h-3.5" />,
}

export function OrgOnboardingFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const [showWelcome, setShowWelcome] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Step 1: organisatie
  const [orgName, setOrgName] = useState("")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2: categorieën
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Step 3: beschrijving
  const [description, setDescription] = useState("")
  const [generatingAI, setGeneratingAI] = useState(false)

  // Step 4: contact
  const [website, setWebsite] = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [postcode, setPostcode] = useState("")
  const [city, setCity] = useState("")
  const [geocodedLat, setGeocodedLat] = useState<number | null>(null)
  const [geocodedLon, setGeocodedLon] = useState<number | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Pre-fill org name from session
  useEffect(() => {
    const userName = (session?.user as { name?: string } | null)?.name
    if (userName && !orgName) setOrgName(userName)
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Postcode geocoding with 800ms debounce
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
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
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
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
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
    const step = STEPS[currentStep]
    switch (step) {
      case "organisatie":
        return orgName.trim().length >= 2
      case "categorieën":
        return selectedCategories.length >= 1
      case "beschrijving":
        return description.trim().length >= 20
      case "contact":
        return true
    }
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      complete()
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  async function complete() {
    setIsLoading(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationName: orgName,
          logo: logoUrl,
          orgCategories: selectedCategories,
          description,
          website: website || undefined,
          orgEmail: orgEmail || undefined,
          phone: phone || undefined,
          address: address || undefined,
          postcode: postcode || undefined,
          city: city || undefined,
          lat: geocodedLat,
          lon: geocodedLon,
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

  const step = STEPS[currentStep]
  const stepNumber = currentStep + 1
  const isLastStep = currentStep === STEPS.length - 1

  const displayName = orgName || (session?.user as { name?: string } | null)?.name || ""
  const firstName = displayName.split(" ")[0]

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // --- Celebration overlay ---
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
          className="text-8xl mb-6 select-none"
        >
          🎉
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
          className="text-white/80 text-center leading-relaxed mb-10"
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

  // --- Welcome screen ---
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-10 pb-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl mb-5 select-none"
          >
            🏢
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
            <span className="font-semibold text-orange-500">4 stappen</span> een professioneel
            organisatieprofiel aanmaken. Vrijwilligers kunnen jullie dan vinden!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full space-y-2.5"
          >
            {[
              { emoji: "🏢", text: "Organisatienaam en logo" },
              { emoji: "🏷️", text: "Jullie doelgroepen" },
              { emoji: "✍️", text: "Beschrijving (met AI-hulp)" },
              { emoji: "📍", text: "Contactgegevens en locatie" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.07 }}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm text-left"
              >
                <span className="text-xl w-7 text-center">{item.emoji}</span>
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

  // --- Main step flow ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-8 h-8 flex items-center justify-center text-orange-500 disabled:opacity-0 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {stepNumber} / {TOTAL}
        </span>
        <div className="w-8" />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center mb-6 px-5">
        {STEPS.map((s, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          return (
            <div key={s} className="flex items-center">
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  backgroundColor: isDone || isActive ? "#f97316" : "#f3f4f6",
                  color: isDone || isActive ? "white" : "#9ca3af",
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isActive ? "ring-4 ring-orange-100" : ""
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : STEP_ICONS[s]}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-0.5 rounded-full transition-colors duration-500 ${
                    i < currentStep ? "bg-orange-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
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

            {/* Step 1: Organisatie */}
            {step === "organisatie" && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                    Naam van de organisatie
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

                {/* Logo drop zone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Logo</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                      uploading
                        ? "border-orange-300 bg-orange-50"
                        : logoUrl
                        ? "border-orange-200 bg-white"
                        : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-4"
                      />
                    ) : uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                        <p className="text-sm text-orange-500 font-medium">Uploaden...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-1">
                          <Upload className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Klik om logo te uploaden
                        </p>
                        <p className="text-xs text-gray-400">JPG, PNG · Max. 4MB</p>
                        {initials && (
                          <div className="mt-1 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                            {initials}
                          </div>
                        )}
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
                  {uploadError && (
                    <p className="text-xs text-red-500">{uploadError}</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Categorieën */}
            {step === "categorieën" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = selectedCategories.includes(cat.name)
                    return (
                      <motion.button
                        key={cat.name}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => toggleCategory(cat.name)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
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
                <p className="text-xs text-gray-400 pt-1">
                  {selectedCategories.length === 0
                    ? "Selecteer minimaal één doelgroep"
                    : `${selectedCategories.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* Step 3: Beschrijving */}
            {step === "beschrijving" && (
              <div className="space-y-3">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschrijf wat jullie organisatie doet, voor wie jullie werken en waarom vrijwilligers bij jullie passen..."
                  className="min-h-[150px] rounded-xl border-gray-200 bg-white resize-none text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{description.length} tekens</p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateDescription}
                    disabled={
                      generatingAI || selectedCategories.length === 0 || !orgName.trim()
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Genereren...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI genereren
                      </>
                    )}
                  </motion.button>
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Selecteer eerst categorieën (stap 2) om AI te gebruiken.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Contact */}
            {step === "contact" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                    Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.organisatie.nl"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="orgEmail" className="text-sm font-medium text-gray-700">
                    E-mailadres organisatie
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="orgEmail"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="info@organisatie.nl"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Telefoonnummer
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="020-1234567"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Adres
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Straat en huisnummer"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                    Postcode
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="postcode"
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
                  {city && !geocoding ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Gevonden: {city}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Stad wordt automatisch ingevuld op basis van de postcode.
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Stad
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    readOnly
                    placeholder="Wordt automatisch ingevuld"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                  />
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
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-70 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              {isLastStep ? "Profiel opslaan" : "Volgende"}
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </>
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
