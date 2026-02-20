"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Sparkles,
  CheckCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORIES, SKILLS, AVAILABILITY_OPTIONS } from "@/config"
import { OrgOnboardingFlow } from "@/components/onboarding/org-onboarding-flow"

type Step = "personal" | "skills" | "interests" | "availability" | "vfi" | "schwartz"
const STEPS: Step[] = ["personal", "skills", "interests", "availability", "vfi", "schwartz"]
const TOTAL = STEPS.length

const STEP_TITLES: Record<Step, string> = {
  personal:     "Vertel ons wat over jezelf",
  skills:       "Wat zijn je vaardigheden?",
  interests:    "Wie wil je helpen?",
  availability: "Wanneer ben je beschikbaar?",
  vfi:          "Wat motiveert jou?",
  schwartz:     "Wat zijn jouw kernwaarden?",
}

const STEP_SUBTITLES: Record<Step, string> = {
  personal:     "We gebruiken dit om de beste matches voor je te vinden op Vrijwilligersmatch.nl",
  skills:       "Selecteer de vaardigheden die je wilt inzetten.",
  interests:    "Kies één of meer doelgroepen die je aanspreken.",
  availability: "Geef aan wanneer je beschikbaar bent voor vrijwilligerswerk.",
  vfi:          "Geef aan hoeveel elke reden voor jou telt. Dit helpt ons jou beter te matchen.",
  schwartz:     "Hoe erg lijkt deze persoon op jou? Dit verfijnt jouw matches.",
}

const STEP_ICONS: Record<Step, React.ReactNode> = {
  personal:     <User className="w-3.5 h-3.5" />,
  skills:       <Zap className="w-3.5 h-3.5" />,
  interests:    <Heart className="w-3.5 h-3.5" />,
  availability: <Calendar className="w-3.5 h-3.5" />,
  vfi:          <Lightbulb className="w-3.5 h-3.5" />,
  schwartz:     <Sparkles className="w-3.5 h-3.5" />,
}


const VFI_QUESTIONS: Record<string, string> = {
  waarden:     "Ik wil iets betekenen voor de samenleving",
  begrip:      "Vrijwilligerswerk helpt me mezelf beter te begrijpen",
  sociaal:     "Ik wil nieuwe mensen ontmoeten",
  loopbaan:    "Ik wil relevante werkervaring opdoen",
  bescherming: "Vrijwilligerswerk helpt me me beter te voelen",
  verbetering: "Ik wil mijn kennis en vaardigheden uitbreiden",
}

const VFI_SCALE = [
  { value: 1, label: "Niet" },
  { value: 2, label: "Weinig" },
  { value: 3, label: "Soms" },
  { value: 4, label: "Vaak" },
  { value: 5, label: "Zeker" },
]

// ─── Schwartz PVQ Portraits ───────────────────────────────────────────────────
const SCHWARTZ_PORTRAITS = [
  {
    key: "zorg",
    naam: "Mira",
    beschrijving: "Het is heel belangrijk voor Mira om voor de mensen om haar heen te zorgen. Ze wil graag het welzijn van anderen bevorderen.",
  },
  {
    key: "universalisme",
    naam: "Daan",
    beschrijving: "Daan vindt het belangrijk dat alle mensen gelijkwaardig worden behandeld. Hij heeft begrip voor mensen die anders zijn dan hij.",
  },
  {
    key: "zelfrichting",
    naam: "Sana",
    beschrijving: "Sana maakt graag haar eigen keuzes en handelt zelfstandig. Ze wil nieuwe ideeën bedenken en creatief zijn.",
  },
  {
    key: "stimulatie",
    naam: "Boris",
    beschrijving: "Boris houdt van opwinding en avontuur. Hij zoekt altijd nieuwe, uitdagende ervaringen en verveelt zich snel als het leven te rustig is.",
  },
  {
    key: "hedonisme",
    naam: "Emma",
    beschrijving: "Emma geniet volop van het leven. Ze doet graag dingen die plezier en genoegen geven.",
  },
  {
    key: "prestatie",
    naam: "Lars",
    beschrijving: "Voor Lars is het belangrijk om te laten zien hoe competent hij is. Succes en erkenning motiveren hem sterk.",
  },
  {
    key: "macht",
    naam: "Kim",
    beschrijving: "Kim wil graag invloedrijk zijn en wil dat anderen haar mening respecteren. Het is haar belangrijk om een leidende positie te hebben.",
  },
  {
    key: "veiligheid",
    naam: "Abdul",
    beschrijving: "Abdul voelt zich het beste als zijn omgeving veilig en stabiel is. Voorspelbaarheid en orde zijn voor hem essentieel.",
  },
  {
    key: "conformiteit",
    naam: "Jana",
    beschrijving: "Jana houdt zich aan regels en verwachtingen van anderen. Ze doet niets wat anderen zou kunnen storen of kwetsen.",
  },
  {
    key: "traditie",
    naam: "Piet",
    beschrijving: "Voor Piet zijn tradities en gewoontes uit zijn cultuur heel waardevol. Hij probeert deze te respecteren en in stand te houden.",
  },
] as const

type SchwartzKey = (typeof SCHWARTZ_PORTRAITS)[number]["key"]

const SCHWARTZ_SCALE = [
  { value: 0, label: "Helemaal niet" },
  { value: 1, label: "Niet echt" },
  { value: 2, label: "Een beetje" },
  { value: 3, label: "Goed" },
  { value: 4, label: "Erg" },
  { value: 5, label: "Heel erg" },
]

const DAYS     = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
const DAYDELEN = ["morning","afternoon","evening"]

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [showWelcome,     setShowWelcome]     = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStep,     setCurrentStep]     = useState(0)

  const [name,     setName]     = useState("")
  const [age,      setAge]      = useState("")
  const [location, setLocation] = useState("")
  const [postcode, setPostcode] = useState("")

  const [selectedSkills,       setSelectedSkills]       = useState<string[]>([])
  const [selectedInterests,    setSelectedInterests]    = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [maxDistance,          setMaxDistance]          = useState<number>(25)
  const [commitmentType,       setCommitmentType]       = useState<string>("")

  const [vfiScores, setVfiScores] = useState({
    waarden: 3, begrip: 3, sociaal: 3, loopbaan: 3, bescherming: 3, verbetering: 3,
  })

  const [schwartzScores, setSchwartzScores] = useState<Record<SchwartzKey, number>>({
    zorg: 3, universalisme: 3, zelfrichting: 3, stimulatie: 3, hedonisme: 3,
    prestatie: 3, macht: 3, veiligheid: 3, conformiteit: 3, traditie: 3,
  })
  const [portraitIndex, setPortraitIndex] = useState(0)
  const portraitAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (!isValid) { setDetectedCity(null); return }
    setGeocoding(true)
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?postcode=${encodeURIComponent(postcode)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.city) { setDetectedCity(data.city); setLocation(data.city) }
        }
      } finally { setGeocoding(false) }
    }, 800)
    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current) }
  }, [postcode])

  // --- Early returns ---
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  const userRole = (session?.user as { role?: string } | null)?.role
  if (userRole === "ORGANISATION") return <OrgOnboardingFlow />

  const sessionName = (session?.user as { name?: string } | null)?.name ?? ""
  const firstName   = sessionName.split(" ")[0]

  // --- Handlers ---
  function toggleSkill(skill: string) {
    setSelectedSkills((p) => p.includes(skill) ? p.filter((s) => s !== skill) : [...p, skill])
  }
  function toggleInterest(cat: string) {
    setSelectedInterests((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat])
  }
  function toggleAvailability(val: string) {
    setSelectedAvailability((p) => p.includes(val) ? p.filter((d) => d !== val) : [...p, val])
  }

  const handlePortraitRate = useCallback((key: SchwartzKey, value: number) => {
    setSchwartzScores((prev) => ({ ...prev, [key]: value }))
    if (portraitAdvanceTimer.current) clearTimeout(portraitAdvanceTimer.current)
    portraitAdvanceTimer.current = setTimeout(() => {
      setPortraitIndex((prev) => Math.min(prev + 1, SCHWARTZ_PORTRAITS.length - 1))
    }, 350)
  }, [])

  function nextStep() {
    if (currentStep < STEPS.length - 1) setCurrentStep((p) => p + 1)
    else complete()
  }
  function prevStep() {
    if (currentStep > 0) setCurrentStep((p) => p - 1)
  }

  async function complete() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:              name || undefined,
          age:               age ? Number(age) : undefined,
          skills:            selectedSkills,
          interests:         selectedInterests,
          availability:      selectedAvailability,
          location:          location || undefined,
          postcode:          postcode || undefined,
          maxDistance,
          commitmentType:    commitmentType || undefined,
          motivationProfile: vfiScores,
          schwartzProfile:   schwartzScores,
        }),
      })
      if (!res.ok) { setIsLoading(false); return }
      setShowCelebration(true)
      await new Promise((r) => setTimeout(r, 2200))
      router.refresh()
      router.push("/swipe")
    } catch {
      setIsLoading(false)
    }
  }

  const step       = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const stepNumber = currentStep + 1

  // --- Celebration ---
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
          className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
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

  // --- Welcome ---
  if (showWelcome) {
    const STEP_LIST = [
      { icon: <User className="w-4 h-4 text-gray-400" />,      text: "Vertel iets over jezelf" },
      { icon: <Zap className="w-4 h-4 text-gray-400" />,       text: "Kies jouw vaardigheden" },
      { icon: <Heart className="w-4 h-4 text-gray-400" />,     text: "Selecteer je interesses" },
      { icon: <Calendar className="w-4 h-4 text-gray-400" />,  text: "Geef je beschikbaarheid aan" },
      { icon: <Lightbulb className="w-4 h-4 text-gray-400" />, text: "Deel je motivatie (VFI)" },
      { icon: <Sparkles className="w-4 h-4 text-gray-400" />,  text: "Jouw kernwaarden (Schwartz)" },
    ]

    return (
      <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-10 pb-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6"
          >
            <Heart className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
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
            <span className="font-semibold text-orange-500">6 stappen</span> het perfecte
            vrijwilligersprofiel aanmaken. Duurt maar 4 minuten.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full space-y-2"
          >
            {STEP_LIST.map((item, i) => (
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
            transition={{ delay: 0.9 }}
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
  const portrait = SCHWARTZ_PORTRAITS[portraitIndex]
  const allPortraitsRated = portraitIndex >= SCHWARTZ_PORTRAITS.length - 1

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
        <span className="text-sm text-gray-400 font-medium">
          {stepNumber} / {TOTAL}
        </span>
        <div className="w-8" />
      </div>

      {/* Progress bar */}
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

            {/* ── Step 1: Personal ── */}
            {step === "personal" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Naam</Label>
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
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700">Leeftijd</Label>
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
                  <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode</Label>
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
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Stad of gemeente
                    {detectedCity && !geocoding && (
                      <span className="ml-2 text-xs font-normal text-green-600">automatisch ingevuld</span>
                    )}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Vul eerst je postcode in"
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-white"
                    />
                  </div>
                </div>

                {/* Max reisafstand */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Hoe ver ben je bereid te reizen?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 5,    label: "5 km" },
                      { value: 10,   label: "10 km" },
                      { value: 25,   label: "25 km" },
                      { value: 50,   label: "50 km" },
                      { value: 9999, label: "Heel NL" },
                    ].map(({ value, label }) => (
                      <motion.button
                        key={value}
                        whileTap={{ scale: 0.91 }}
                        type="button"
                        onClick={() => setMaxDistance(value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          maxDistance === value
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Skills ── */}
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
                        {selected && <Check className="w-3 h-3" />}
                        {skill}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  {selectedSkills.length === 0 ? "Selecteer je vaardigheden" : `${selectedSkills.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* ── Step 3: Interests ── */}
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
                        {cat.name}
                        {selected && <Check className="w-3 h-3 ml-0.5" />}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  {selectedInterests.length === 0 ? "Kies minimaal één doelgroep" : `${selectedInterests.length} geselecteerd`}
                </p>
              </div>
            )}

            {/* ── Step 4: Availability ── */}
            {step === "availability" && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Dag</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.filter((o) => DAYS.includes(o.value)).map((opt) => {
                      const selected = selectedAvailability.includes(opt.value)
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.91 }}
                          onClick={() => toggleAvailability(opt.value)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          {opt.label}
                          {selected && <Check className="w-3 h-3" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Dagdeel</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.filter((o) => DAYDELEN.includes(o.value)).map((opt) => {
                      const selected = selectedAvailability.includes(opt.value)
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.91 }}
                          onClick={() => toggleAvailability(opt.value)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          {opt.label}
                          {selected && <Check className="w-3 h-3" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedAvailability.length === 0 ? "Selecteer jouw beschikbaarheid" : `${selectedAvailability.length} opties geselecteerd`}
                </p>

                {/* Inzetvoorkeur */}
                <div className="pt-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Type inzet</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "wekelijks",    label: "Vaste wekelijkse inzet",   desc: "Ik wil structureel betrokken zijn" },
                      { value: "projectmatig", label: "Projectmatig",              desc: "Per project of periode" },
                      { value: "incidenteel",  label: "Incidenteel / eenmalig",   desc: "Losse klussen of events" },
                      { value: "alles",        label: "Maakt me niet uit",        desc: "Ik sta overal voor open" },
                    ].map(({ value, label, desc }) => (
                      <motion.button
                        key={value}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setCommitmentType(value)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          commitmentType === value
                            ? "border-orange-400 bg-orange-50"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          commitmentType === value ? "border-orange-500 bg-orange-500" : "border-gray-300"
                        }`}>
                          {commitmentType === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${commitmentType === value ? "text-orange-700" : "text-gray-800"}`}>{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: VFI Motivation ── */}
            {step === "vfi" && (
              <div className="space-y-3.5">
                {Object.entries(VFI_QUESTIONS).map(([key, question]) => (
                  <div key={key} className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
                    <div className="flex gap-1.5">
                      {VFI_SCALE.map(({ value, label }) => {
                        const isSelected = vfiScores[key as keyof typeof vfiScores] === value
                        return (
                          <motion.button
                            key={value}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => setVfiScores((p) => ({ ...p, [key]: value }))}
                            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                              isSelected ? "border-orange-400 bg-white" : "border-transparent bg-white hover:border-gray-200"
                            }`}
                          >
                            <span className={`text-sm font-bold ${isSelected ? "text-orange-500" : "text-gray-400"}`}>
                              {value}
                            </span>
                            <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? "text-orange-600" : "text-gray-400"}`}>
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

            {/* ── Step 6: Schwartz Portraits ── */}
            {step === "schwartz" && (
              <div>
                {/* Portrait progress */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {SCHWARTZ_PORTRAITS.map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: i === portraitIndex ? 20 : 6,
                          backgroundColor:
                            i < portraitIndex ? "#f97316" :
                            i === portraitIndex ? "#f97316" : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {portraitIndex + 1} / {SCHWARTZ_PORTRAITS.length}
                  </span>
                </div>

                {/* Portrait card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={portrait.key}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 rounded-2xl p-5 mb-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-lg flex-shrink-0">
                        {portrait.naam.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">
                          Portret {portraitIndex + 1}
                        </p>
                        <p className="font-bold text-gray-900">{portrait.naam}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {portrait.beschrijving}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Rating buttons */}
                <p className="text-xs text-gray-500 mb-3 text-center font-medium">
                  Hoe erg lijkt <strong>{portrait.naam}</strong> op jou?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SCHWARTZ_SCALE.map(({ value, label }) => {
                    const isSelected = schwartzScores[portrait.key as SchwartzKey] === value
                    return (
                      <motion.button
                        key={value}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handlePortraitRate(portrait.key as SchwartzKey, value)}
                        className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-orange-400 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Navigate between portraits */}
                <div className="flex justify-between mt-5">
                  <button
                    onClick={() => setPortraitIndex((p) => Math.max(0, p - 1))}
                    disabled={portraitIndex === 0}
                    className="text-xs text-gray-400 disabled:opacity-0 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Vorige
                  </button>
                  {!allPortraitsRated && (
                    <button
                      onClick={() => setPortraitIndex((p) => Math.min(p + 1, SCHWARTZ_PORTRAITS.length - 1))}
                      className="text-xs text-orange-500 font-medium flex items-center gap-1"
                    >
                      Overslaan <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {allPortraitsRated && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Alle portretten beoordeeld
                    </span>
                  )}
                </div>
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
            <><Loader2 className="w-5 h-5 animate-spin" /> Opslaan...</>
          ) : (
            <>{isLastStep ? "Profiel opslaan" : "Volgende"}<ChevronRight className="w-5 h-5" strokeWidth={2.5} /></>
          )}
        </motion.button>
      </div>
    </div>
  )
}
