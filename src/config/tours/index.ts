import { volunteerTour } from "./volunteer"
import { organisationTour } from "./organisation"
import { gemeenteTour } from "./gemeente"
import { adminTour } from "./admin"
import { websiteTour } from "./website"
import type { TourId, TourConfig } from "@/components/onboarding/tour/types"

export const TOURS: Record<TourId, TourConfig> = {
  volunteer: volunteerTour,
  organisation: organisationTour,
  gemeente: gemeenteTour,
  admin: adminTour,
  website: websiteTour,
}

export { volunteerTour, organisationTour, gemeenteTour, adminTour, websiteTour }
