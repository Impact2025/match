"use client"

import { useRef, useState, useTransition } from "react"
import { Trash2, Loader2, Plus, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  createCategory,
  deleteCategory,
  updateCategory,
  createSkill,
  deleteSkill,
  updateSkill,
} from "@/app/(admin)/admin/categories/actions"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

/* ─── Delete buttons ─── */

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCategory(id)
        toast.success("Categorie verwijderd")
      } catch {
        toast.error("Verwijderen mislukt — controleer of er geen koppelingen zijn.")
      }
    })
  }

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => setConfirm(true)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-40"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Categorie verwijderen"
        description="Deze actie kan niet ongedaan worden gemaakt. Items met koppelingen kunnen niet worden verwijderd."
        confirmLabel="Verwijderen"
        confirmVariant="destructive"
        onConfirm={() => { setConfirm(false); handleDelete() }}
        loading={isPending}
      />
    </>
  )
}

export function DeleteSkillButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSkill(id)
        toast.success("Vaardigheid verwijderd")
      } catch {
        toast.error("Verwijderen mislukt — controleer of er geen koppelingen zijn.")
      }
    })
  }

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => setConfirm(true)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-40"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Vaardigheid verwijderen"
        description="Deze actie kan niet ongedaan worden gemaakt. Items met koppelingen kunnen niet worden verwijderd."
        confirmLabel="Verwijderen"
        confirmVariant="destructive"
        onConfirm={() => { setConfirm(false); handleDelete() }}
        loading={isPending}
      />
    </>
  )
}

/* ─── Edit category inline ─── */

export function EditCategoryForm({ id, currentName }: { id: string; currentName: string }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const name = inputRef.current?.value ?? ""
    if (!name.trim() || name.trim() === currentName) { setEditing(false); return }
    startTransition(async () => {
      try {
        await updateCategory(id, name)
        toast.success("Categorie bijgewerkt")
        setEditing(false)
      } catch {
        toast.error("Bijwerken mislukt")
      }
    })
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-1">
      <input
        ref={inputRef}
        defaultValue={currentName}
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false) }}
        className="flex-1 bg-white border border-orange-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none min-w-0"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors disabled:opacity-40"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

/* ─── Edit skill inline ─── */

export function EditSkillForm({ id, currentName }: { id: string; currentName: string }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const name = inputRef.current?.value ?? ""
    if (!name.trim() || name.trim() === currentName) { setEditing(false); return }
    startTransition(async () => {
      try {
        await updateSkill(id, name)
        toast.success("Vaardigheid bijgewerkt")
        setEditing(false)
      } catch {
        toast.error("Bijwerken mislukt")
      }
    })
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-1">
      <input
        ref={inputRef}
        defaultValue={currentName}
        autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false) }}
        className="flex-1 bg-white border border-orange-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none min-w-0"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors disabled:opacity-40"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
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
      try {
        await createCategory(name, icon, color)
        if (nameRef.current) nameRef.current.value = ""
        if (iconRef.current) iconRef.current.value = ""
        toast.success("Categorie toegevoegd")
      } catch {
        toast.error("Toevoegen mislukt")
      }
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
        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
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
      try {
        await createSkill(name)
        if (nameRef.current) nameRef.current.value = ""
        toast.success("Vaardigheid toegevoegd")
      } catch {
        toast.error("Toevoegen mislukt")
      }
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
        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Toevoegen
      </button>
    </form>
  )
}
