import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-5">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-gray-600 font-medium" : "text-gray-400"}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
