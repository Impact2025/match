import type { User, Organisation, Vacancy, Match, Message, Conversation, Category, Skill, AdminLog, UserRole, UserStatus, VacancyStatus, MatchStatus, SwipeDir, OrgStatus, AdminAction } from "@prisma/client"

// Re-export Prisma types
export type { UserRole, UserStatus, VacancyStatus, MatchStatus, SwipeDir, OrgStatus, AdminAction }

// Extended types with relations
export type UserWithRelations = User & {
  organisation?: Organisation | null
  skills?: { skill: Skill }[]
  interests?: { category: Category }[]
}

export type VacancyWithOrg = Vacancy & {
  organisation: Organisation
  skills?: { skill: Skill }[]
  categories?: { category: Category }[]
}

export type MatchScore = {
  /** Weighted total [0–100] */
  total: number
  /** VFI cosine + interest overlap [0–100] */
  motivation: number
  /** Haversine distance score [0–100] */
  distance: number
  /** Skill overlap [0–100] */
  skill: number
  /** Vacancy freshness [0–100] */
  freshness: number
  /** Fairness multiplier [0.70–1.40] */
  fairnessWeight: number
  /** Dutch match highlights, e.g. "Sociaal gemotiveerd", "2 skills matchen" */
  highlights: string[]
}

export type VacancyWithOrgAndDistance = VacancyWithOrg & {
  distanceKm?: number | null
  matchScore?: MatchScore
}

export type MatchWithDetails = Match & {
  volunteer: User
  vacancy: VacancyWithOrg
  conversation?: Conversation | null
}

export type ConversationWithMessages = Conversation & {
  messages: MessageWithSender[]
  participants: { user: User }[]
}

export type MessageWithSender = Message & {
  sender: User
}

// Admin types
export type AdminLogWithAdmin = AdminLog & {
  admin: Pick<User, "id" | "name" | "email">
}

export type OrgWithAdmin = Organisation & {
  admin: Pick<User, "id" | "name" | "email">
  _count?: { vacancies: number }
}

export type UserForAdmin = Pick<User, "id" | "name" | "email" | "role" | "status" | "onboarded" | "createdAt"> & {
  _count?: { matchesAsVol: number; swipesGiven: number }
  organisation?: Pick<Organisation, "id" | "name" | "status"> | null
}

// UI/State types
export type SwipeAction = "like" | "dislike" | "super_like"

export type OnboardingStep =
  | "role"
  | "personal"
  | "skills"
  | "interests"
  | "location"
  | "complete"

export type DashboardTab = "swipe" | "matches" | "chat" | "profile"

// Form types
export type LoginFormData = {
  email: string
  password: string
}

export type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export type VacancyFormData = {
  title: string
  description: string
  location?: string
  city?: string
  postcode?: string
  remote: boolean
  hours?: number
  duration?: string
  skills: string[]
  categories: string[]
}

export type ProfileFormData = {
  name: string
  bio?: string
  location?: string
  postcode?: string
  skills: string[]
  interests: string[]
  availability: string[]
  maxDistance: number
}

export type VFIProfile = {
  waarden: number
  begrip: number
  sociaal: number
  loopbaan: number
  bescherming: number
  verbetering: number
}

export type MatchReason = "Goede zaak" | "Past bij mijn skills" | "Flexibele tijden" | "Dichtbij mij"

// API Response types
export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
