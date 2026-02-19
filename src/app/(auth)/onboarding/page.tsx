"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Loader2,
  Check,
  Zap,
  Heart,
  Lightbulb,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORIES, SKILLS, AVAILABILITY_OPTIONS } from "@/config"
import { OrgOnboardingFlow } from "@/components/onboarding/org-onboarding-flow"

type Step = "personal" | "skills" | "interests" | "availability" | "vfi"
const STEPS: Step[] = ["personal", "skills", "interests", "availability", "vfi"]
const TOTAL = STEPS.length

const STEP_TITLES: Record<Step, string> = {
  personal: "Vertel ons wat over jezelf",
  skills: "Wat zijn je vaardigheden?",
  interests: "Wie wil je helpen?",
  availability: "Wanneer ben je beschikbaar?",
  vfi: "Wat motiveert jou?",
}

const STEP_SUBTITLES: Record<Step, string> = {
  personal: "We gebruiken dit om de beste matches voor je te vinden op Vrijwilligersmatch.nl",
  skills: "Selecteer de vaardigheden die je wilt inzetten.",
  interests: "Kies één of meer doelgroepen die je aanspreken.",
  availability: "Geef aan wanneer je beschikbaar bent voor vrijwilligerswerk.",
  vfi: "Geef aan hoeveel elke reden voor jou telt. Dit helpt ons jou beter te matchen.",
}

const STEP_ICONS: Record<Step, React.ReactNode> = {
  personal: <User className="w-3.5 h-3.5" />,
  skills: <Zap className="w-3.5 h-3.5" />,
  interests: <Heart className="w-3.5 h-3.5" />,
  availability: <Calendar className="w-3.5 h-3.5" />,
  vfi: <Lightbulb className="w-3.5 h-3.5" />,
}

const SKILL_EMOJIS: Record<string, string> = {
  Communicatie: "💬",
  Organisatie: "📋",
  Rijbewijs: "🚗",
  "IT / Technologie": "💻",
  Marketing: "📣",
  Taalvaardigheid: "🗣️",
  EHBO: "🏥",
  Koken: "🍳",
  Muziek: "🎵",
  Fotografie: "📸",
  Tuinieren: "🌱",
  "Coaching / Begeleiding": "🤝",
  Administratie: "📊",
  "Creatief denken": "💡",
  Teamwork: "👥",
  Lesgeven: "📚",
}

const AVAILABILITY_EMOJIS: Record<string, string> = {
  monday: "🌅",
  tuesday: "☀️",
  wednesday: "🌤️",
  thursday: "🌈",
  friday: "🎉",
  saturday: "🌞",
  sunday: "😴",
  morning: "🌄",
  afternoon: "🌻",
  evening: "🌙",
}

const VFI_QUESTIONS: Record<string, string> = {
  waarden: "Ik wil iets betekenen voor de samenleving",
  begrip: "Vrijwilligerswerk helpt me mezelf beter te begrijpen",
  sociaal: "Ik wil nieuwe mensen ontmoeten",
  loopbaan: "Ik wil relevante werkervaring opdoen",
  bescherming: "Vrijwilligerswerk helpt me me beter te voelen",
  verbetering: "Ik wil mijn kennis en vaardigheden uitbreiden",
}

const VFI_SCALE = [
  { value: 1, emoji: "😐", label: "Niet" },
  { value: 2, emoji: "🙂", label: "Beetje" },
  { value: 3, emoji: "😊", label: "Soms" },
  { value: 4, emoji: "😄", label: "Vaak" },
  { value: 5, emoji: "🤩", label: "Zeker!" },
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAYDELEN = ["morning", "afternoon", "evening"]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // All hooks before early returns
  const [showWelcome, setShowWelcome] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [location, setLocation] = useState("")
  const [postcode, setPostcode] = useState("")

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])

  const [vfiScores, setVfiScores] = useState({
    waarden: 3,
    begrip: 3,
    sociaal: 3,
    loopbaan: 3,
    bescherming: 3,
    verbetering: 3,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [detectedCity, setDetectedCity] = useState<string | null>(null)
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const sessionName = (session?.user as { name?: string } | null)?.name
    if (sessionName && !name) setName(sessionName)
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    const isValid = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postcode)
    if (!isValid) {
      setDetectedCity(null)
      return
    }
    setGeocoding(true)
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?postcode=${encodeURIComponent(postcode)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.city) {
            setDetectedCity(data.city)
            setLocation(data.city)
          }
        }
      } finally {
        setGeocoding(false)
      }
    }, 800)
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
  }, [postcode])

  // --- Early returns (all hooks above) ---
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  const userRole = (session?.user as { role?: string } | null)?.role
  if (userRole === "ORGANISATION") return <OrgOnboardingFlow />

  // --- Volunteer flow ---
  const sessionName = (session?.user as { name?: string } | null)?.name ?? ""
  const firstName = sessionName.split(" ")[0]

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }
  function toggleInterest(cat: string) {
    setSelectedInterests((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }
  function toggleAvailability(val: string) {
    setSelectedAvailability((prev) => (prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]))
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
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          age: age ? Number(age) : undefined,
          skills: selectedSkills,
          interests: selectedInterests,
          availability: selectedAvailability,
          location: location || undefined,
          postcode: postcode || undefined,
          motivationProfile: vfiScores,
        }),
      })
      if (!res.ok) {
        setIsLoading(false)
        return
      }
      setShowCelebration(true)
      await new Promise((r) => setTimeout(r, 2200))
      router.refresh()
      router.push("/swipe")
    } catch {
      setIsLoading(false)
    }
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const stepNumber = currentStep + 1

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
          Je bent klaar{firstName ? `, ${firstName}` : ""}!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="text-white/80 text-center leading-relaxed mb-10"
        >
          Je profiel is aangemaakt. We gaan nu de beste matches voor je zoeken!
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
            🧡
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
            We helpen je in{" "}
            <span className="font-semibold text-orange-500">5 stappen</span> het perfecte
            vrijwilligersprofiel aanmaken. Duurt maar 3 minuten!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full space-y-2.5"
          >
            {[
              { emoji: "👤", text: "Vertel iets over jezelf" },
              { emoji: "⚡", text: "Kies jouw vaardigheden" },
              { emoji: "❤️", text: "Selecteer je interesses" },
              { emoji: "📅", text: "Geef je beschikbaarheid aan" },
              { emoji: "💡", text: "Deel je motivatie" },
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
            transition={{ delay: 0.85 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowWelcome(false)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors text-base"
          >
            Laten we beginnen
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
                className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? "ring-4 ring-orange-100" : ""}`}
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

            {/* Step 1: Personal */}
            {step === "personal" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Naam
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Voornaam en achternaam"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                    Leeftijd
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Bijv. 25"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Stad of gemeente
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Stad of gemeente"
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
                  {detectedCity && !geocoding ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Gevonden: {detectedCity}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Stad wordt automatisch ingevuld op basis van je postcode.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {step === "skills" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => {
                    const selected = selectedSkills.includes(skill)
                    return (
                      <motion.button
                        key={skill}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          selected
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <span className="text-base leading-none">
                          {SKILL_EMOJIS[skill] ?? "✦"}
                        </span>
                        {skill}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  {selectedSkills.length === 0
                    ? "Selecteer je vaardigheden"
                    : `${selectedSkills.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === "interests" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = selectedInterests.includes(cat.name)
                    return (
                      <motion.button
                        key={cat.name}
                        whileTap={{ scale: 0.91 }}
                        onClick={() => toggleInterest(cat.name)}
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
                  {selectedInterests.length === 0
                    ? "Kies minimaal één doelgroep"
                    : `${selectedInterests.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* Step 4: Availability */}
            {step === "availability" && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
                    Dag
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.filter((o) => DAYS.includes(o.value)).map((opt) => {
                      const selected = selectedAvailability.includes(opt.value)
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.91 }}
                          onClick={() => toggleAvailability(opt.value)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected
                              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <span>{AVAILABILITY_EMOJIS[opt.value]}</span>
                          {opt.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
                    Dagdeel
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.filter((o) => DAYDELEN.includes(o.value)).map((opt) => {
                      const selected = selectedAvailability.includes(opt.value)
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.91 }}
                          onClick={() => toggleAvailability(opt.value)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected
                              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <span>{AVAILABILITY_EMOJIS[opt.value]}</span>
                          {opt.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedAvailability.length === 0
                    ? "Selecteer jouw beschikbaarheid"
                    : `${selectedAvailability.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* Step 5: VFI */}
            {step === "vfi" && (
              <div className="space-y-3.5">
                {Object.entries(VFI_QUESTIONS).map(([key, question]) => (
                  <div key={key} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
                    <div className="flex gap-1.5">
                      {VFI_SCALE.map(({ value, emoji, label }) => {
                        const isSelected =
                          vfiScores[key as keyof typeof vfiScores] === value
                        return (
                          <motion.button
                            key={value}
                            whileTap={{ scale: 0.88 }}
                            onClick={() =>
                              setVfiScores((prev) => ({ ...prev, [key]: value }))
                            }
                            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-orange-400 bg-orange-50"
                                : "border-gray-100 bg-gray-50 hover:border-gray-200"
                            }`}
                          >
                            <span className="text-lg leading-none">{emoji}</span>
                            <span
                              className={`text-[10px] font-medium mt-1 ${
                                isSelected ? "text-orange-600" : "text-gray-400"
                              }`}
                            >
                              {label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={nextStep}
          disabled={isLoading}
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
      </div>
    </div>
  )
}
