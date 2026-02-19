export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfileEditPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { category: true } },
    },
  })

  if (!user) redirect("/login")

  const availability = user.availability
    ? (() => {
        try {
          return JSON.parse(user.availability)
        } catch {
          return []
        }
      })()
    : []

  const defaultValues = {
    name: user.name ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
    postcode: user.postcode ?? "",
    skills: user.skills.map((s) => s.skill.name),
    interests: user.interests.map((i) => i.category.name),
    availability,
    maxDistance: user.maxDistance ?? 25,
    image: user.image,
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profile"
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Profiel bewerken</h1>
      </div>

      <ProfileForm defaultValues={defaultValues} />
    </div>
  )
}
