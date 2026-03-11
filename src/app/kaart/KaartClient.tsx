"use client"

import dynamic from "next/dynamic"
import type { KaartOrg } from "@/components/kaart/ImpactKaart"

const ImpactKaart = dynamic(() => import("@/components/kaart/ImpactKaart"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-100 rounded-xl"
      style={{ height: 500 }}
    >
      <p className="text-gray-400 text-sm">Kaart laden…</p>
    </div>
  ),
})

export function KaartClient({ orgs }: { orgs: KaartOrg[] }) {
  return <ImpactKaart orgs={orgs} />
}
