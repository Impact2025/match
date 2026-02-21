import { prisma } from "@/lib/prisma"
import { Tag, Wrench } from "lucide-react"
import {
  AddCategoryForm,
  AddSkillForm,
  DeleteCategoryButton,
  DeleteSkillButton,
  EditCategoryForm,
  EditSkillForm,
} from "@/components/admin/taxonomy-forms"

export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const [categories, skills] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { vacancyCategories: true, userInterests: true } },
      },
    }),
    prisma.skill.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { vacancySkills: true, userSkills: true } },
      },
    }),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Taxonomie</h1>
        <p className="text-gray-400 text-sm mt-1">
          Beheer categorieën en vaardigheden die gebruikt worden in vacatures en gebruikersprofielen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Categories ── */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold text-sm">Categorieën</h2>
              <p className="text-gray-400 text-xs">{categories.length} totaal</p>
            </div>
          </div>

          <AddCategoryForm />

          <div className="mt-4 space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-gray-300 text-sm text-center py-8">Nog geen categorieën</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-3 h-3 text-gray-300" />
                  </span>
                  <span className="flex-1 text-sm text-gray-600 truncate">{cat.name}</span>
                  <span className="text-xs text-gray-300 tabular-nums whitespace-nowrap">
                    {cat._count.vacancyCategories}v · {cat._count.userInterests}u
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <EditCategoryForm id={cat.id} currentName={cat.name} />
                    <DeleteCategoryButton id={cat.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold text-sm">Vaardigheden</h2>
              <p className="text-gray-400 text-xs">{skills.length} totaal</p>
            </div>
          </div>

          <AddSkillForm />

          <div className="mt-4 space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
            {skills.length === 0 ? (
              <p className="text-gray-300 text-sm text-center py-8">Nog geen vaardigheden</p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-3 h-3 text-blue-600/50" />
                  </span>
                  <span className="flex-1 text-sm text-gray-600 truncate">{skill.name}</span>
                  <span className="text-xs text-gray-300 tabular-nums whitespace-nowrap">
                    {skill._count.vacancySkills}v · {skill._count.userSkills}u
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <EditSkillForm id={skill.id} currentName={skill.name} />
                    <DeleteSkillButton id={skill.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Usage note */}
      <p className="text-gray-300 text-xs text-center">
        Items met gekoppelde vacatures of gebruikers kunnen niet worden verwijderd — verwijder eerst de koppelingen.
      </p>
    </div>
  )
}
