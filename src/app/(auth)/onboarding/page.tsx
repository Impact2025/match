"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CATEGORIES, SKILLS, AVAILABILITY_OPTIONS } from "@/config"

type Step = "role_confirm" | "personal" | "skills" | "interests" | "availability" | "complete"

const STEPS: Step[] = ["role_confirm", "personal", "skills", "interests", "availability", "complete"]
const STEP_LABELS = ["Start", "Profiel", "Vaardigheden", "Interesses", "Beschikbaarheid", "Klaar!"]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const step = STEPS[currentStep]
  const progress = ((currentStep) / (STEPS.length - 1)) * 100

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function toggleInterest(cat: string) {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function toggleAvailability(day: string) {
    setSelectedAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1)
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  async function complete() {
    setIsLoading(true)
    try {
      await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: selectedSkills,
          interests: selectedInterests,
          availability: selectedAvailability,
        }),
      })
      router.push("/swipe")
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 mb-3 shadow-md">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={i === currentStep ? "text-orange-600 font-semibold" : ""}
              >
                {label}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-5"
            >
              {step === "role_confirm" && (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">👋</div>
                    <h2 className="text-xl font-bold text-gray-900">Welkom!</h2>
                    <p className="text-gray-500 text-sm">
                      Laten we je profiel instellen. Dit duurt maar 2 minuten.
                    </p>
                  </div>
                  <Button
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Aan de slag <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}

              {step === "personal" && (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✏️</div>
                    <h2 className="text-xl font-bold text-gray-900">Over jou</h2>
                    <p className="text-gray-500 text-sm">
                      Je kunt dit later altijd aanpassen in je profiel.
                    </p>
                  </div>
                  <p className="text-sm text-center text-gray-400">
                    Profiel details worden binnenkort toegevoegd.
                  </p>
                </>
              )}

              {step === "skills" && (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">🛠️</div>
                    <h2 className="text-xl font-bold text-gray-900">Jouw vaardigheden</h2>
                    <p className="text-gray-500 text-sm">
                      Selecteer wat je kunt. We vinden betere matches voor je.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                          selectedSkills.includes(skill)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {selectedSkills.includes(skill) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {skill}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {selectedSkills.length} geselecteerd
                  </p>
                </>
              )}

              {step === "interests" && (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">❤️</div>
                    <h2 className="text-xl font-bold text-gray-900">Jouw interesses</h2>
                    <p className="text-gray-500 text-sm">
                      Waar wil jij je voor inzetten?
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => toggleInterest(cat.name)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedInterests.includes(cat.name)
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-medium text-gray-700 leading-tight">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    {selectedInterests.length} geselecteerd
                  </p>
                </>
              )}

              {step === "availability" && (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">📅</div>
                    <h2 className="text-xl font-bold text-gray-900">Beschikbaarheid</h2>
                    <p className="text-gray-500 text-sm">
                      Wanneer ben je beschikbaar voor vrijwilligerswerk?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleAvailability(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                          selectedAvailability.includes(opt.value)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "complete" && (
                <>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Alles klaar! 🎉</h2>
                    <p className="text-gray-500 text-sm">
                      Je profiel is ingesteld. Tijd om je eerste match te vinden!
                    </p>
                  </div>
                  <Button
                    onClick={complete}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {isLoading ? "Laden..." : "Naar mijn matches →"}
                  </Button>
                </>
              )}

              {/* Navigation */}
              {step !== "role_confirm" && step !== "complete" && (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Terug
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Volgende <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
