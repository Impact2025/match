"use client"

import { createContext, useContext } from "react"

export interface GemeenteColor {
  primaryColor: string
  accentColor: string
}

const DEFAULT: GemeenteColor = {
  primaryColor: "#f97316",
  accentColor: "#f59e0b",
}

const GemeenteColorContext = createContext<GemeenteColor>(DEFAULT)

export function GemeenteColorProvider({
  primaryColor,
  accentColor,
  children,
}: GemeenteColor & { children: React.ReactNode }) {
  return (
    <GemeenteColorContext.Provider value={{ primaryColor, accentColor }}>
      {children}
    </GemeenteColorContext.Provider>
  )
}

export function useGemeenteColor(): GemeenteColor {
  return useContext(GemeenteColorContext)
}
