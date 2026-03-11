"use client"

/**
 * ImpactKaart — interactieve Leaflet-kaart met organisatiemarkers.
 *
 * Importeer altijd via dynamic():
 *   const ImpactKaart = dynamic(() => import('@/components/kaart/ImpactKaart'), { ssr: false })
 */

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import type { Map as LeafletMap } from "leaflet"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KaartOrg {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  lat: number
  lng: number
  categories: string[]
  handprint: {
    waarde: number
    sroiWaarde: number
    retentieScore: number
    totalHours: number
    dominantMotivatie: string | null
  } | null
}

interface Props {
  orgs: KaartOrg[]
  center?: [number, number]
  zoom?: number
}

// ── Marker color ──────────────────────────────────────────────────────────────

function markerColor(retentieScore: number): string {
  if (retentieScore >= 70) return "#22c55e"
  if (retentieScore >= 40) return "#f97316"
  return "#ef4444"
}

function formatEur(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")} mln`
  if (n >= 1_000) return `€${Math.round(n / 1_000).toLocaleString("nl")}.000`
  return `€${n.toLocaleString("nl-NL")}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImpactKaart({
  orgs,
  center = [52.3874, 4.6462], // Haarlem
  zoom = 12,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [totalWaarde] = useState(() =>
    orgs.reduce((s, o) => s + (o.handprint?.waarde ?? 0), 0),
  )

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic Leaflet import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl:       "/leaflet/marker-icon.png",
        shadowUrl:     "/leaflet/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      // OpenStreetMap tiles (geen API key nodig)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Markers per organisatie
      for (const org of orgs) {
        const score = org.handprint?.retentieScore ?? 0
        const color = markerColor(score)

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 22px; height: 22px; border-radius: 50%;
            background: ${color}; border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -14],
        })

        const popupContent = `
          <div style="min-width:200px; font-family:system-ui,sans-serif; font-size:13px">
            <p style="font-weight:700; font-size:15px; margin:0 0 4px">${org.name}</p>
            ${org.city ? `<p style="color:#6b7280; margin:0 0 8px">${org.city}</p>` : ""}
            ${org.categories.length > 0
              ? `<p style="color:#6b7280; margin:0 0 8px; font-size:12px">${org.categories.join(" · ")}</p>`
              : ""}
            ${org.handprint
              ? `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:10px">
                <div style="background:#f9fafb; padding:6px 8px; border-radius:8px">
                  <p style="font-size:11px; color:#9ca3af; margin:0">Waarde</p>
                  <p style="font-weight:700; margin:0">${formatEur(org.handprint.waarde)}</p>
                </div>
                <div style="background:#f9fafb; padding:6px 8px; border-radius:8px">
                  <p style="font-size:11px; color:#9ca3af; margin:0">Retentie</p>
                  <p style="font-weight:700; margin:0; color:${color}">${Math.round(org.handprint.retentieScore)}%</p>
                </div>
              </div>`
              : ""}
            <a href="/organisaties/${org.slug}"
               style="display:block; text-align:center; background:#7c3aed; color:white;
                      padding:6px 12px; border-radius:8px; text-decoration:none; font-weight:600; font-size:12px">
              Bekijk profiel →
            </a>
          </div>
        `

        L.marker([org.lat, org.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 260 })
      }

      // Legenda rechtsonder
      const legend = (L.control as any)({ position: "bottomright" })
      legend.onAdd = () => {
        const div = L.DomUtil.create("div")
        div.innerHTML = `
          <div style="background:white; padding:10px 14px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.15); font-size:12px; font-family:system-ui,sans-serif">
            <p style="font-weight:700; margin:0 0 8px; color:#111827">Retentiescore</p>
            ${[
              ["#22c55e", "≥ 70%  Uitstekend"],
              ["#f97316", "40–70%  Gemiddeld"],
              ["#ef4444", "< 40%  Aandacht nodig"],
            ].map(([c, l]) => `
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px">
                <div style="width:12px;height:12px;border-radius:50%;background:${c}"></div>
                <span style="color:#374151">${l}</span>
              </div>`).join("")}
          </div>
        `
        return div
      }
      legend.addTo(map)
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      {/* Totaalwaarde teller linksonder */}
      {totalWaarde > 0 && (
        <div className="absolute bottom-4 left-4 z-[999] bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-gray-100 text-sm">
          <p className="text-gray-500 text-xs">Totale maatschappelijke waarde in beeld</p>
          <p className="font-bold text-gray-900 text-base tabular-nums">{formatEur(totalWaarde)}</p>
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "500px" }} />
    </div>
  )
}
