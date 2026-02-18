import type { User, Organisation, Vacancy, Match, Message, Conversation, Category, Skill, UserRole, VacancyStatus, MatchStatus, SwipeDir } from "@prisma/client"

// Re-export Prisma types
export type { UserRole, VacancyStatus, MatchStatus, SwipeDir }

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
  skills: string[]
  interests: string[]
  availability: string[]
  maxDistance: number
}

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
