"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/youth", label: "Jóvenes" },
  { href: "/leaders", label: "Líderes" },
  { href: "/groups", label: "Grupos" },
  { href: "/meetings", label: "Reuniones" },
  { href: "/follow-ups", label: "Seguimientos" },
  { href: "/reports", label: "Reportes" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map((item) => {
        // Active when path matches href strictly, or starts with it (for child routes like /youth/123)
        // Exception: "/" should only match exactly "/"
        const isActive = item.href === "/" 
          ? pathname === "/" 
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
