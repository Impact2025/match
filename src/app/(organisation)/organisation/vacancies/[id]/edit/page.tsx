export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { VacancyForm } from "@/components/organisation/vacancy-form"

export default async function EditVacancyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vacancy = await prisma.vacancy.findUnique({
    where: { id },
    include: {
      organisation: true,
      skills: { include: { skill: true } },
      categories: { include: { category: true } },
    },
  })

  if (!vacancy) notFound()
  if (vacancy.organisation.adminId !== session.user.id) redirect("/organisation/vacancies")

  const defaultValues = {
    id: vacancy.id,
    title: vacancy.title,
    description: vacancy.description,
    location: vacancy.location ?? "",
    city: vacancy.city ?? "",
    remote: vacancy.remote,
    hours: vacancy.hours ?? undefined,
    duration: vacancy.duration ?? "",
    skills: vacancy.skills.map((s) => s.skill.name),
    categories: vacancy.categories.map((c) => c.category.name),
    imageUrl: vacancy.imageUrl,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/organisation/vacancies"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vacature bewerken</h1>
          <p className="text-gray-500 text-sm mt-0.5">{vacancy.title}</p>
        </div>
      </div>
      <VacancyForm mode="edit" defaultValues={defaultValues} />
    </div>
  )
}
