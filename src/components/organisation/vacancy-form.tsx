"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, Loader2, MapPin, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"
import { vacancySchema, type VacancyFormData } from "@/validators"
import { SKILLS, CATEGORIES } from "@/config"

interface VacancyFormProps {
  defaultValues?: Partial<VacancyFormData & { id?: string; imageUrl?: string | null }>
  mode?: "create" | "edit"
}

export function VacancyForm({ defaultValues, mode = "create" }: VacancyFormProps) {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultValues?.skills ?? [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultValues?.categories ?? []
  )
  const [remote, setRemote] = useState(defaultValues?.remote ?? false)
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValues?.imageUrl ?? null)
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
  } = useForm<VacancyFormData>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      location: defaultValues?.location ?? "",
      city: defaultValues?.city ?? "",
      postcode: defaultValues?.postcode ?? "",
      remote: defaultValues?.remote ?? false,
      hours: defaultValues?.hours,
      duration: defaultValues?.duration ?? "",
      skills: defaultValues?.skills ?? [],
      categories: defaultValues?.categories ?? [],
    },
  })

  const descriptionValue = watch("description") ?? ""
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
            setValue("city", data.city, { shouldDirty: true })
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

  function toggleSkill(skill: string) {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter((x) => x !== skill)
      : [...selectedSkills, skill]
    setSelectedSkills(next)
    setValue("skills", next)
  }

  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((x) => x !== cat)
      : [...selectedCategories, cat]
    setSelectedCategories(next)
    setValue("categories", next, { shouldValidate: true })
  }

  async function onSubmit(data: VacancyFormData) {
    if (selectedCategories.length === 0) {
      toast.error("Selecteer minimaal één categorie")
      return
    }

    setSaving(true)
    try {
      const url =
        mode === "edit" && defaultValues?.id
          ? `/api/vacancies/${defaultValues.id}`
          : "/api/vacancies"
      const method = mode === "edit" ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          remote,
          skills: selectedSkills,
          categories: selectedCategories,
          imageUrl: imageUrl ?? null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij opslaan")
        return
      }

      toast.success(mode === "create" ? "Vacature aangemaakt!" : "Vacature bijgewerkt!")
      router.push("/organisation/vacancies")
      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basisinformatie</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Titel *</Label>
          <Input id="title" {...register("title")} placeholder="Bijv. Tuinvrijwilliger gezocht" />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Beschrijving *</Label>
            <span className="text-xs text-gray-400">{descriptionValue.length}/5000</span>
          </div>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Beschrijf de vrijwilligersfunctie, verwachtingen en wat je te bieden hebt..."
            rows={6}
            maxLength={5000}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Locatie</h2>

        <div className="flex items-center justify-between">
          <div>
            <Label>Remote mogelijk</Label>
            <p className="text-xs text-gray-500">Vrijwilliger kan thuiswerken</p>
          </div>
          <Switch checked={remote} onCheckedChange={setRemote} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">Stad</Label>
            <Input id="city" {...register("city")} placeholder="Amsterdam" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Adres / Locatie</Label>
            <Input id="location" {...register("location")} placeholder="Bijv. Museumplein 10" />
          </div>
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
      </section>

      {/* Details */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hours">Uren per week</Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={80}
              {...register("hours", { valueAsNumber: true })}
              placeholder="4"
            />
            {errors.hours && <p className="text-xs text-red-500">{errors.hours.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duur</Label>
            <Input
              id="duration"
              {...register("duration")}
              placeholder="3 maanden, doorlopend, ..."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Categorieën *{" "}
          <span className="text-sm font-normal text-gray-500">
            ({selectedCategories.length} geselecteerd)
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => toggleCategory(cat.name)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                selectedCategories.includes(cat.name)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
        {errors.categories && (
          <p className="text-xs text-red-500">{errors.categories.message}</p>
        )}
      </section>

      {/* Skills */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Gevraagde vaardigheden{" "}
          <span className="text-sm font-normal text-gray-500">
            ({selectedSkills.length} geselecteerd)
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
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

      {/* Image upload */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Afbeelding</h2>
        <p className="text-sm text-gray-500">Optioneel — voeg een afbeelding toe aan je vacature.</p>

        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Vacature afbeelding" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3">
            <ImageIcon className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">Max. 8MB, JPG/PNG/WebP</p>
            <UploadButton<OurFileRouter, "vacancyImage">
              endpoint="vacancyImage"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  setImageUrl(res[0].url)
                  toast.success("Afbeelding geüpload!")
                }
              }}
              onUploadError={(err) => {
                toast.error(`Upload mislukt: ${err.message}`)
              }}
              appearance={{
                button:
                  "bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors",
                allowedContent: "hidden",
              }}
              content={{ button: "Afbeelding uploaden" }}
            />
          </div>
        )}
      </section>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Opslaan...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {mode === "create" ? "Vacature aanmaken" : "Wijzigingen opslaan"}
          </>
        )}
      </Button>
    </form>
  )
}
