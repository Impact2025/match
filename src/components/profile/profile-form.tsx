"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Save, Upload, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { profileSchema, type ProfileFormData } from "@/validators"
import { SKILLS, CATEGORIES, AVAILABILITY_OPTIONS } from "@/config"

interface ProfileFormProps {
  defaultValues: ProfileFormData & { image?: string | null }
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultValues.skills ?? [])
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    defaultValues.interests ?? []
  )
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    defaultValues.availability ?? []
  )
  const [maxDistance, setMaxDistance] = useState(defaultValues.maxDistance ?? 25)
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [detectedCity, setDetectedCity] = useState<string | null>(null)
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const bioValue = watch("bio") ?? ""
  const postcodeValue = watch("postcode") ?? ""

  useEffect(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)

    const isValid = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postcodeValue)
    if (!isValid) {
      setDetectedCity(null)
      return
    }

    setGeocoding(true)
    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?postcode=${encodeURIComponent(postcodeValue)}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data?.city) {
            setDetectedCity(data.city)
            setValue("location", data.city, { shouldDirty: true })
          }
        }
      } finally {
        setGeocoding(false)
      }
    }, 800)

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
  }, [postcodeValue, setValue])

  async function onSubmit(data: ProfileFormData) {
    setSaving(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          skills: selectedSkills,
          interests: selectedInterests,
          availability: selectedAvailability,
          maxDistance,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij opslaan")
        return
      }

      toast.success("Profiel opgeslagen!")
    } catch {
      toast.error("Fout bij opslaan")
    } finally {
      setSaving(false)
    }
  }

  function toggle<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic info */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Persoonlijke informatie</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" {...register("name")} placeholder="Jouw naam" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Locatie</Label>
          <Input id="location" {...register("location")} placeholder="Amsterdam, Utrecht, ..." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="postcode">Postcode</Label>
          <div className="relative">
            <Input
              id="postcode"
              {...register("postcode")}
              placeholder="1234 AB"
              maxLength={7}
              className="pr-8"
            />
            {geocoding && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          {errors.postcode && (
            <p className="text-xs text-red-500">{errors.postcode.message}</p>
          )}
          {!errors.postcode && detectedCity && !geocoding && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Gevonden: {detectedCity}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio</Label>
            <span className="text-xs text-gray-400">{bioValue.length}/500</span>
          </div>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Vertel iets over jezelf en waarom je vrijwilligerswerk wilt doen..."
            rows={4}
            maxLength={500}
          />
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Vaardigheden</h2>
        <p className="text-sm text-gray-500">{selectedSkills.length} geselecteerd</p>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(selectedSkills, skill, setSelectedSkills)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                selectedSkills.includes(skill)
                  ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Interesses</h2>
        <p className="text-sm text-gray-500">{selectedInterests.length} geselecteerd</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => toggle(selectedInterests, cat.name, setSelectedInterests)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                selectedInterests.includes(cat.name)
                  ? "border-orange-500 bg-orange-500 text-white font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Availability */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Beschikbaarheid</h2>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(selectedAvailability, opt.value, setSelectedAvailability)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                selectedAvailability.includes(opt.value)
                  ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Max distance */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Maximale afstand</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Maximaal {maxDistance === 200 ? "200+" : maxDistance} km van jouw locatie
            </span>
          </div>
          <Slider
            min={1}
            max={200}
            step={1}
            value={[maxDistance]}
            onValueChange={([v]) => setMaxDistance(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 km</span>
            <span>200+ km</span>
          </div>
          <p className="text-xs text-gray-400">
            Vul je postcode in om vacatures op afstand te filteren.
          </p>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-70"
      >
        <Save className="w-4 h-4" />
        {saving ? "Opslaan..." : "Profiel opslaan"}
      </button>
    </form>
  )
}
