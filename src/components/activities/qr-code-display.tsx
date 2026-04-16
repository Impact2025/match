"use client"

import { useState } from "react"
import { QrCode, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// Simpele QR-code rendering via externe API (geen extra package nodig)
// We gebruiken de Google Charts QR API — alleen voor interne use
interface QRCodeDisplayProps {
  url: string
  activityTitle: string
}

export function QRCodeDisplay({ url, activityTitle }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  // Codeer de URL voor de QR-code via de gratis qrcode.io API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1a1a1a&margin=10`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link gekopieerd!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Kopiëren mislukt")
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-900">QR Check-in</h3>
      </div>

      <p className="text-xs text-gray-500">
        Toon deze QR-code bij aanvang. Vrijwilligers scannen hem met hun telefoon en zijn direct aanwezig.
      </p>

      {/* QR code afbeelding */}
      <div className="flex justify-center">
        <div className="border-2 border-gray-100 rounded-2xl p-3 bg-white inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt={`QR code voor ${activityTitle}`}
            width={180}
            height={180}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* URL tonen */}
      <div className="bg-gray-50 rounded-xl px-3 py-2">
        <p className="text-[10px] text-gray-400 mb-0.5">Check-in link</p>
        <p className="text-xs text-gray-600 font-mono break-all">{url}</p>
      </div>

      {/* Acties */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex-1 gap-1.5 text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Gekopieerd!" : "Kopieer link"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 text-xs"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            Test
          </a>
        </Button>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Vrijwilligers moeten ingelogd zijn om te checken in
      </p>
    </div>
  )
}
