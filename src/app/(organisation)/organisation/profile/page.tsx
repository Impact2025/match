"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Save, Loader2, LogOut, Camera } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { organisationSchema, type OrganisationFormData } from "@/validators"
import { CATEGORIES } from "@/config"

export default function OrgProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [org, setOrg] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrganisationFormData>({
    resolver: zodResolver(organisationSchema),
  })

  const descriptionValue = watch("description") ?? ""

  useEffect(() => {
    fetch("/api/organisations/me")
      .then((r) => r.json())
      .then((data) => {
        setOrg(data)
        setLogoUrl(data.logo ?? null)
        setSelectedCategories(data.categories?.map((c: any) => c.category.name) ?? [])
        reset({
          name: data.name ?? "",
          description: data.description ?? "",
          website: data.website ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
        })
      })
      .finally(() => setLoading(false))
  }, [reset])

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload?type=orgLogo", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload mislukt")
      const data = await res.json()
      setLogoUrl(data.url)
      // Direct opslaan in DB
      await fetch("/api/organisations/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: data.url }),
      })
      toast.success("Logo bijgewerkt!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Logo uploaden mislukt")
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  async function onSubmit(data: OrganisationFormData) {
    setSaving(true)
    try {
      const res = await fetch("/api/organisations/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, categories: selectedCategories, logo: logoUrl }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Fout bij opslaan")
        return
      }

      toast.success("Profiel opgeslagen!")
    } catch {
      toast.error("Er is iets misgegaan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={uploadingLogo}
            className="relative w-20 h-20 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 group"
            title="Logo wijzigen"
          >
            <Avatar className="w-20 h-20">
              <AvatarImage src={logoUrl ?? ""} alt={org?.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl font-bold">
                {org?.name?.charAt(0)?.toUpperCase() ?? "O"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingLogo
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />
              }
            </div>
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoSelect}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org?.name ?? "Organisatieprofiel"}</h1>
          <p className="text-gray-500 text-sm">
            {org?.status === "APPROVED" ? "✅ Geverifieerd" : org?.status === "PENDING_APPROVAL" ? "⏳ In behandeling" : "Niet geverifieerd"}
          </p>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={uploadingLogo}
            className="text-xs text-orange-500 hover:text-orange-600 mt-0.5"
          >
            {uploadingLogo ? "Uploaden..." : "Logo wijzigen"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Organisatiegegevens</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Naam *</Label>
            <Input id="name" {...register("name")} placeholder="Naam van de organisatie" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Beschrijving</Label>
              <span className="text-xs text-gray-400">{descriptionValue.length} tekens</span>
            </div>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Beschrijf jullie organisatie en missie..."
              rows={5}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contactgegevens</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="info@organisatie.nl"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input id="phone" {...register("phone")} placeholder="+31 20 123 4567" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="https://www.organisatie.nl"
            />
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" {...register("address")} placeholder="Straatnaam 10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Stad</Label>
              <Input id="city" {...register("city")} placeholder="Amsterdam" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Categorieën{" "}
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
              Profiel opslaan
            </>
          )}
        </Button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-3 flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 font-semibold py-4 rounded-2xl transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Uitloggen
      </button>
    </div>
  )
}
