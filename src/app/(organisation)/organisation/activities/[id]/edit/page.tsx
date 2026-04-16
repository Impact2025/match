export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ActivityForm } from "@/components/activities/activity-form"

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organisation.findUnique({ where: { adminId: session.user.id } })
  if (!org) redirect("/onboarding")

  const activity = await prisma.groupActivity.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      categories: { include: { category: true } },
    },
  })

  if (!activity || activity.organisationId !== org.id) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/organisation/activities"
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activiteit bewerken</h1>
          <p className="text-gray-500 text-sm truncate max-w-xs">{activity.title}</p>
        </div>
      </div>
      <ActivityForm
        mode="edit"
        defaultValues={{
          id: activity.id,
          title: activity.title,
          description: activity.description,
          type: activity.type,
          startDateTime: toDatetimeLocal(activity.startDateTime),
          endDateTime: toDatetimeLocal(activity.endDateTime),
          online: activity.online,
          meetUrl: activity.meetUrl ?? "",
          location: activity.location ?? "",
          address: activity.address ?? "",
          city: activity.city ?? "",
          postcode: activity.postcode ?? "",
          maxCapacity: activity.maxCapacity ?? undefined,
          waitlistEnabled: activity.waitlistEnabled,
          imageUrl: activity.imageUrl,
          skills: activity.skills.map((s) => s.skill.name),
          categories: activity.categories.map((c) => c.category.name),
        }}
      />
    </div>
  )
}
