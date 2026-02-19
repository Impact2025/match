"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Heart, User, Mail, Lock, Building2, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { registerSchema, type RegisterFormData } from "@/validators"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<"VOLUNTEER" | "ORGANISATION">("VOLUNTEER")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "VOLUNTEER" },
  })

  function selectRole(role: "VOLUNTEER" | "ORGANISATION") {
    setSelectedRole(role)
    setValue("role", role)
  }

  async function onSubmit(data: RegisterFormData) {
    setError(null)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error ?? "Registratie mislukt")
        return
      }

      // Log automatisch in na registratie zodat de sessie (incl. role) beschikbaar is
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push("/login")
        return
      }

      router.push("/onboarding")
    } catch {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vrijwilligersmatch</h1>
          <p className="text-gray-500 text-sm mt-1">Maak impact, vind je match</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Account aanmaken</CardTitle>
            <CardDescription>Begin gratis — geen creditcard nodig</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Role selector */}
              <div className="space-y-2">
                <Label>Ik ben een...</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectRole("VOLUNTEER")}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      selectedRole === "VOLUNTEER"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <User
                      className={`w-5 h-5 mb-1 ${
                        selectedRole === "VOLUNTEER" ? "text-orange-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedRole === "VOLUNTEER" ? "text-orange-700" : "text-gray-600"
                      }`}
                    >
                      Vrijwilliger
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRole("ORGANISATION")}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      selectedRole === "ORGANISATION"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Building2
                      className={`w-5 h-5 mb-1 ${
                        selectedRole === "ORGANISATION" ? "text-orange-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedRole === "ORGANISATION" ? "text-orange-700" : "text-gray-600"
                      }`}
                    >
                      Organisatie
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {selectedRole === "VOLUNTEER" ? "Volledige naam" : "Naam organisatie"}
                </Label>
                <div className="relative">
                  {selectedRole === "VOLUNTEER" ? (
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  ) : (
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <Input
                    id="name"
                    type="text"
                    placeholder={selectedRole === "VOLUNTEER" ? "Jan de Vries" : "Stichting XYZ"}
                    className="pl-10"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jij@voorbeeld.nl"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimaal 8 tekens"
                    className="pl-10"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Wachtwoord bevestigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Account aanmaken
              </Button>

              <p className="text-xs text-center text-gray-500">
                Door te registreren ga je akkoord met onze{" "}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  Gebruiksvoorwaarden
                </Link>{" "}
                en{" "}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  Privacybeleid
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Al een account?{" "}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
