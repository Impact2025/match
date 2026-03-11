export interface TourStep {
  id: string
  /** data-tour-id value of the target element */
  target: string
  title: string
  content: string
  placement: "top" | "bottom" | "left" | "right"
  /** Extra padding around the spotlight (default 8) */
  spotlightPadding?: number
  scrollIntoView?: boolean
}

export type TourId = "volunteer" | "organisation" | "gemeente" | "admin"

export interface TourConfig {
  id: TourId
  welcomeTitle: string
  welcomeSubtitle: string
  welcomeEmoji: string
  /** Hex colour used as accent in WelcomeModal and tooltip buttons */
  accentColor: string
  steps: TourStep[]
}
