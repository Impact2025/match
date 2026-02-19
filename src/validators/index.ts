import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
    email: z.string().email("Ongeldig e-mailadres"),
    password: z
      .string()
      .min(8, "Wachtwoord moet minimaal 8 tekens zijn")
      .regex(/[A-Z]/, "Wachtwoord moet een hoofdletter bevatten")
      .regex(/[0-9]/, "Wachtwoord moet een cijfer bevatten"),
    confirmPassword: z.string(),
    role: z.enum(["VOLUNTEER", "ORGANISATION"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  })

const postcodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{3}\s?[A-Z]{2}$/i, "Ongeldige postcode")
  .optional()
  .or(z.literal(""))

export const vacancySchema = z.object({
  title: z.string().min(5, "Titel moet minimaal 5 tekens zijn").max(100),
  description: z
    .string()
    .min(50, "Beschrijving moet minimaal 50 tekens zijn")
    .max(5000),
  location: z.string().optional(),
  city: z.string().optional(),
  postcode: postcodeSchema,
  remote: z.boolean().default(false),
  hours: z.number().min(1).max(80).optional(),
  duration: z.string().optional(),
  skills: z.array(z.string()).default([]),
  categories: z.array(z.string()).min(1, "Selecteer minimaal één categorie"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
  bio: z.string().max(500, "Bio mag maximaal 500 tekens zijn").optional(),
  location: z.string().optional(),
  postcode: postcodeSchema,
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  availability: z.array(z.string()).default([]),
  maxDistance: z.number().min(1).max(200).default(25),
})

export const messageSchema = z.object({
  content: z.string().min(1, "Bericht mag niet leeg zijn").max(2000),
})

export const organisationSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
  description: z.string().min(50, "Beschrijving moet minimaal 50 tekens zijn").optional(),
  website: z.string().url("Ongeldige URL").optional().or(z.literal("")),
  email: z.string().email("Ongeldig e-mailadres").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: postcodeSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type VacancyFormData = z.infer<typeof vacancySchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type OrganisationFormData = z.infer<typeof organisationSchema>

export const VFI_KEYS = ["waarden", "begrip", "sociaal", "loopbaan", "bescherming", "verbetering"] as const

export const vfiSchema = z.object({
  waarden: z.number().int().min(1).max(5),
  begrip: z.number().int().min(1).max(5),
  sociaal: z.number().int().min(1).max(5),
  loopbaan: z.number().int().min(1).max(5),
  bescherming: z.number().int().min(1).max(5),
  verbetering: z.number().int().min(1).max(5),
})

export type VFIData = z.infer<typeof vfiSchema>

export const MATCH_REASONS = ["Goede zaak", "Past bij mijn skills", "Flexibele tijden", "Dichtbij mij"] as const
export type MatchReason = typeof MATCH_REASONS[number]
