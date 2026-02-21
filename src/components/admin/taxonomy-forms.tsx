"use client"

import { useRef, useTransition } from "react"
import { Trash2, Loader2, Plus } from "lucide-react"
import {
  createCategory,
  deleteCategory,
  createSkill,
  deleteSkill,
} from "@/app/(admin)/admin/categories/actions"

/* ─── Delete buttons ─── */

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteCategory(id))}
      className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-40"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}

export function DeleteSkillButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteSkill(id))}
      className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-40"
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}

/* ─── Add category form ─── */

export function AddCategoryForm() {
  const [isPending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameRef.current?.value ?? ""
    const icon = iconRef.current?.value ?? ""
    const color = colorRef.current?.value ?? ""
    if (!name.trim()) return
    startTransition(async () => {
      await createCategory(name, icon, color)
      if (nameRef.current) nameRef.current.value = ""
      if (iconRef.current) iconRef.current.value = ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        ref={nameRef}
        type="text"
        placeholder="Naam categorie..."
        required
        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300"
      />
      <input
        ref={iconRef}
        type="text"
        placeholder="Emoji"
        className="w-16 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300 text-center"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-gray-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Toevoegen
      </button>
    </form>
  )
}

/* ─── Add skill form ─── */

export function AddSkillForm() {
  const [isPending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameRef.current?.value ?? ""
    if (!name.trim()) return
    startTransition(async () => {
      await createSkill(name)
      if (nameRef.current) nameRef.current.value = ""
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        ref={nameRef}
        type="text"
        placeholder="Naam vaardigheid..."
        required
        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-300"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-gray-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Toevoegen
      </button>
    </form>
  )
}
