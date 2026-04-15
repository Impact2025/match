"use client"

import { createContext, useContext } from "react"

export interface BrandValue {
  brand: string       // primary hex, e.g. "#7c3aed"
  brandAccent: string // accent hex
  name: string        // platform / gemeente display name
  tagline: string | null
}

const defaults: BrandValue = {
  brand: "#f97316",
  brandAccent: "#fb923c",
  name: "Vrijwilligersmatch",
  tagline: null,
}

const BrandContext = createContext<BrandValue>(defaults)

export function GemeenteBrandProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: BrandValue
}) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrand(): BrandValue {
  return useContext(BrandContext)
}
