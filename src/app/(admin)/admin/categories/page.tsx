import { prisma } from "@/lib/prisma"
import { Tag, Wrench } from "lucide-react"
import {
  AddCategoryForm,
  AddSkillForm,
  DeleteCategoryButton,
  DeleteSkillButton,
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Taxonomie</h1>
        <p className="text-white/40 text-sm mt-1">
          Beheer categorieën en vaardigheden die gebruikt worden in vacatures en gebruikersprofielen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Categories ── */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Categorieën</h2>
              <p className="text-white/30 text-xs">{categories.length} totaal</p>
            </div>
          </div>

          <AddCategoryForm />

          <div className="mt-4 space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-8">Nog geen categorieën</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.025] group transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center">
                    <Tag className="w-3 h-3 text-white/20" />
                  </span>
                  <span className="flex-1 text-sm text-white/70">{cat.name}</span>
                  <span className="text-xs text-white/25 tabular-nums">
                    {cat._count.vacancyCategories}v · {cat._count.userInterests}u
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteCategoryButton id={cat.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Vaardigheden</h2>
              <p className="text-white/30 text-xs">{skills.length} totaal</p>
            </div>
          </div>

          <AddSkillForm />

          <div className="mt-4 space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
            {skills.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-8">Nog geen vaardigheden</p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.025] group transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-3 h-3 text-blue-400/50" />
                  </span>
                  <span className="flex-1 text-sm text-white/70">{skill.name}</span>
                  <span className="text-xs text-white/25 tabular-nums">
                    {skill._count.vacancySkills}v · {skill._count.userSkills}u
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteSkillButton id={skill.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Usage note */}
      <p className="text-white/20 text-xs text-center">
        Items met gekoppelde vacatures of gebruikers kunnen niet worden verwijderd — verwijder eerst de koppelingen.
      </p>
    </div>
  )
}
