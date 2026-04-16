"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Save, Loader2, MapPin, ImageIcon, X, Globe, Video,
  Calendar, Users, Infinity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  activitySchema,
  type ActivityFormData,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
} from "@/validators"
import { SKILLS, CATEGORIES } from "@/config"

const TYPE_ICONS: Record<typeof ACTIVITY_TYPES[number], string> = {
  BIJEENKOMST: "🤝",
  WORKSHOP: "🛠️",
  CURSUS: "📚",
  EVENEMENT: "🎉",
  INLOOPSPREEKUUR: "🚪",
}

interface ActivityFormProps {
  defaultValues?: Partial<ActivityFormData & { id?: string; imageUrl?: string | null }>
  mode?: "create" | "edit"
}

export function ActivityForm({ defaultValues, mode = "create" }: ActivityFormProps) {
  const router = useRouter()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultValues?.skills ?? [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultValues?.categories ?? [])
  const [online, setOnline] = useState(defaultValues?.online ?? false)
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(defaultValues?.maxCapacity == null)
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValues?.imageUrl ?? null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      type: defaultValues?.type ?? "BIJEENKOMST",
      startDateTime: defaultValues?.startDateTime ?? "",
      endDateTime: defaultValues?.endDateTime ?? "",
      online: defaultValues?.online ?? false,
      meetUrl: defaultValues?.meetUrl ?? "",
      location: defaultValues?.location ?? "",
      address: defaultValues?.address ?? "",
      city: defaultValues?.city ?? "",
      postcode: defaultValues?.postcode ?? "",
      maxCapacity: defaultValues?.maxCapacity,
      waitlistEnabled: defaultValues?.waitlistEnabled ?? true,
      skills: defaultValues?.skills ?? [],
      categories: defaultValues?.categories ?? [],
    },
  })

  const selectedType = watch("type")
  const descriptionValue = watch("description") ?? ""

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload?type=vacancyImage", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload mislukt")
      const data = await res.json()
      setImageUrl(data.url)
      toast.success("Afbeelding geüpload!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload mislukt")
    } finally {
      setUploadingImage(false)
    }
  }

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
    setValue("categories", next)
  }

  async function onSubmit(data: ActivityFormData) {
    setSaving(true)
    try {
      const url =
        mode === "edit" && defaultValues?.id
          ? `/api/activities/${defaultValues.id}`
          : "/api/activities"
      const method = mode === "edit" ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          online,
          maxCapacity: unlimitedCapacity ? undefined : data.maxCapacity,
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

      toast.success(mode === "create" ? "Activiteit aangemaakt!" : "Activiteit bijgewerkt!")
      router.push("/organisation/activities")
      router.refresh()
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Basisinformatie */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basisinformatie</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Naam van de activiteit *</Label>
          <Input id="title" {...register("title")} placeholder="Bijv. Workshop tuinieren voor beginners" />
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
            placeholder="Vertel wat vrijwilligers kunnen verwachten, wat de activiteit inhoudt en voor wie het bedoeld is..."
            rows={5}
            maxLength={5000}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Type activiteit</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("type", type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                  selectedType === type
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{TYPE_ICONS[type]}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">
                  {ACTIVITY_TYPE_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Datum & tijd */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          Datum & tijd
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDateTime">Start *</Label>
            <Input
              id="startDateTime"
              type="datetime-local"
              {...register("startDateTime")}
            />
            {errors.startDateTime && <p className="text-xs text-red-500">{errors.startDateTime.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDateTime">Einde *</Label>
            <Input
              id="endDateTime"
              type="datetime-local"
              {...register("endDateTime")}
            />
            {errors.endDateTime && <p className="text-xs text-red-500">{errors.endDateTime.message}</p>}
          </div>
        </div>
      </section>

      {/* Locatie */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          Locatie
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gray-400" />
              Online activiteit
            </Label>
            <p className="text-xs text-gray-500">Deelnemers nemen online deel</p>
          </div>
          <Switch
            checked={online}
            onCheckedChange={(v) => {
              setOnline(v)
              setValue("online", v)
            }}
          />
        </div>

        {online ? (
          <div className="space-y-1.5">
            <Label htmlFor="meetUrl" className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Vergaderlink
            </Label>
            <Input id="meetUrl" {...register("meetUrl")} placeholder="https://meet.google.com/..." />
            {errors.meetUrl && <p className="text-xs text-red-500">{errors.meetUrl.message}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Naam locatie</Label>
              <Input id="location" {...register("location")} placeholder="Bijv. Dorpshuis De Wiel" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Adres</Label>
                <Input id="address" {...register("address")} placeholder="Herenweg 121" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Stad</Label>
                <Input id="city" {...register("city")} placeholder="Heemstede" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" {...register("postcode")} placeholder="2102 AB" maxLength={7} />
              {errors.postcode && <p className="text-xs text-red-500">{errors.postcode.message}</p>}
            </div>
          </div>
        )}
      </section>

      {/* Capaciteit */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          Capaciteit
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <Label className="flex items-center gap-2">
              <Infinity className="w-4 h-4 text-gray-400" />
              Onbeperkt aantal plaatsen
            </Label>
            <p className="text-xs text-gray-500">Geen maximum aan deelnemers</p>
          </div>
          <Switch checked={unlimitedCapacity} onCheckedChange={setUnlimitedCapacity} />
        </div>

        {!unlimitedCapacity && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxCapacity">Maximum deelnemers</Label>
              <Input
                id="maxCapacity"
                type="number"
                min={1}
                {...register("maxCapacity", { valueAsNumber: true })}
                placeholder="20"
              />
              {errors.maxCapacity && <p className="text-xs text-red-500">{errors.maxCapacity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">Wachtlijst</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={watch("waitlistEnabled")}
                  onCheckedChange={(v) => setValue("waitlistEnabled", v)}
                />
                <span className="text-sm text-gray-500">
                  {watch("waitlistEnabled") ? "Wachtlijst ingeschakeld" : "Geen wachtlijst"}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categorieën */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Categorieën{" "}
          <span className="text-sm font-normal text-gray-500">({selectedCategories.length} geselecteerd)</span>
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
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Vaardigheden */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Gevraagde vaardigheden{" "}
          <span className="text-sm font-normal text-gray-500">({selectedSkills.length} geselecteerd)</span>
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

      {/* Afbeelding */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Afbeelding</h2>
        <p className="text-sm text-gray-500">Optioneel — voeg een omslagfoto toe aan je activiteit.</p>

        {imageUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Activiteit afbeelding" className="w-full h-full object-cover" />
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
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              disabled={uploadingImage}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadingImage ? "Uploaden..." : "Afbeelding uploaden"}
            </button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
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
            {mode === "create" ? "Activiteit aanmaken" : "Wijzigingen opslaan"}
          </>
        )}
      </Button>
    </form>
  )
}
