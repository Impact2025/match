export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SwipeDeck } from "@/components/swipe/swipe-deck"
import { ProfileCompleteness } from "@/components/swipe/profile-completeness"

function computeCompleteness(user: {
  bio: string | null
  location: string | null
  postcode: string | null
  image: string | null
  availability: string | null
  motivationProfile: string | null
  skills: unknown[]
  interests: unknown[]
}): { percent: number; missing: string[] } {
  const fields: { label: string; ok: boolean }[] = [
    { label: "bio", ok: !!user.bio },
    { label: "locatie", ok: !!(user.location || user.postcode) },
    { label: "profielfoto", ok: !!user.image },
    { label: "beschikbaarheid", ok: !!user.availability },
    { label: "vaardigheden", ok: user.skills.length > 0 },
    { label: "interesses", ok: user.interests.length > 0 },
    { label: "motivatieprofiel", ok: !!user.motivationProfile },
  ]
  const done = fields.filter((f) => f.ok).length
  const missing = fields.filter((f) => !f.ok).map((f) => f.label)
  return { percent: Math.round((done / fields.length) * 100), missing }
}

export default async function SwipePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      bio: true,
      location: true,
      postcode: true,
      image: true,
      availability: true,
      motivationProfile: true,
      skills: { select: { skillId: true } },
      interests: { select: { categoryId: true } },
    },
  })

  const { percent, missing } = user
    ? computeCompleteness(user)
    : { percent: 0, missing: ["profiel"] }

  return (
    <div className="min-h-[calc(100svh-8.5rem)] bg-gray-50 flex flex-col items-center px-4 pt-3 pb-4 gap-3">
      <div className="w-full max-w-sm">
        <ProfileCompleteness percent={percent} missing={missing} />
      </div>
      <div className="w-full max-w-sm flex-1">
        <SwipeDeck />
      </div>
    </div>
  )
}
