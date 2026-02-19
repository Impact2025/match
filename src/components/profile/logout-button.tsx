"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 font-semibold py-4 rounded-2xl transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Uitloggen
    </button>
  )
}
