"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Heart, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FormData = {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const password = watch("password")

  async function onSubmit(data: FormData) {
    setError(null)
    if (!token) {
      setError("Ongeldige resetlink. Vraag een nieuwe aan.")
      return
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Er is iets misgegaan")
        return
      }
      setDone(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vrijwilligersmatch</h1>
          <p className="text-gray-500 text-sm mt-1">Maak impact, vind je match</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Nieuw wachtwoord</CardTitle>
            <CardDescription>Kies een nieuw wachtwoord voor je account.</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div>
                  <p className="font-semibold text-gray-900">Ongeldige link</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Deze resetlink is ongeldig. Vraag een nieuwe aan.
                  </p>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-600 hover:underline font-medium"
                >
                  Nieuwe resetlink aanvragen
                </Link>
              </div>
            ) : done ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">Wachtwoord gewijzigd!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Je wordt automatisch doorgestuurd naar inloggen...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Nieuw wachtwoord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimaal 8 tekens"
                      className="pl-10"
                      {...register("password", {
                        required: "Wachtwoord is verplicht",
                        minLength: { value: 8, message: "Minimaal 8 tekens" },
                        pattern: {
                          value: /[A-Z]/,
                          message: "Moet een hoofdletter bevatten",
                        },
                      })}
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
                      placeholder="Herhaal wachtwoord"
                      className="pl-10"
                      {...register("confirmPassword", {
                        required: "Bevestig je wachtwoord",
                        validate: (v) => v === password || "Wachtwoorden komen niet overeen",
                      })}
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
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Wachtwoord opslaan
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
