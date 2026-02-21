"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  ScrollText,
  Heart,
  LogOut,
  ChevronRight,
  Briefcase,
  Tag,
  Settings,
  BarChart2,
  Sliders,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}

const BASE_NAV_ITEMS: Omit<NavItem, "badge">[] = [
  { href: "/admin/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/organisations", icon: Building2,        label: "Organisaties" },
  { href: "/admin/users",         icon: Users,            label: "Gebruikers" },
  { href: "/admin/vacancies",     icon: Briefcase,        label: "Vacatures" },
  { href: "/admin/categories",    icon: Tag,              label: "Categorieën" },
  { href: "/admin/analytics",     icon: BarChart2,        label: "AI Analytics" },
  { href: "/admin/scoring",       icon: Sliders,          label: "Scoring" },
  { href: "/admin/logs",          icon: ScrollText,        label: "Audit Log" },
  { href: "/admin/settings",      icon: Settings,         label: "Instellingen" },
]

interface AdminSidebarProps {
  adminName: string
  pendingCount?: number
}

export function AdminSidebar({ adminName, pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = BASE_NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.href === "/admin/organisations" && pendingCount > 0 ? pendingCount : undefined,
  }))

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
        <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Heart className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <div className="leading-none">
          <p className="text-gray-900 text-sm font-semibold tracking-tight">Vrijwilligers</p>
          <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-orange-50 text-orange-500"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              <span className="flex-1">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {isActive && !badge && (
                <ChevronRight className="w-3.5 h-3.5 text-orange-500/50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-500 text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-600 text-xs font-medium truncate">{adminName}</p>
            <p className="text-gray-300 text-[10px] uppercase tracking-widest">Admin</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Uitloggen</span>
        </button>
      </div>
    </aside>
  )
}
