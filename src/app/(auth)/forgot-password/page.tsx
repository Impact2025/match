"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Heart, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBrand } from "@/components/gemeente-brand-provider"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { brand, brandAccent, name, tagline } = useBrand()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>()

  async function onSubmit(data: { email: string }) {
    setError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? "Er is iets misgegaan")
        return
      }
      setSent(true)
    } catch {
      setError("Er is iets misgegaan. Probeer het opnieuw.")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${brand}18 0%, ${brandAccent}10 100%)` }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${brand}, ${brandAccent})` }}
          >
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500 text-sm mt-1">{tagline ?? "Wachtwoord herstellen"}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Wachtwoord vergeten</CardTitle>
            <CardDescription>
              Vul je e-mailadres in en ontvang een resetlink.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">E-mail verzonden!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Als dit adres bekend is, ontvang je een resetlink. Controleer ook je spammap.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:underline"
                  style={{ color: brand }}
                >
                  Terug naar inloggen
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="jij@voorbeeld.nl"
                      className="pl-10"
                      {...register("email", { required: "E-mailadres is verplicht" })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full text-white hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(to right, ${brand}, ${brandAccent})` }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Resetlink versturen
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-medium hover:underline inline-flex items-center gap-1"
            style={{ color: brand }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
