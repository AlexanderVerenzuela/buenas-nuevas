"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Users, Users2, CalendarDays, FileBarChart, Gift, LucideIcon, X, LogOut, Key, Settings } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/youth", label: "Jóvenes", icon: Users },
  { href: "/groups", label: "Discipulado", icon: Users2 },
  { href: "/meetings", label: "Reuniones", icon: CalendarDays },
  { href: "/reports", label: "Reportes", icon: FileBarChart },
  { href: "/birthdays", label: "Cumpleaños", icon: Gift },
]

export function SidebarNav({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = useLocation().pathname
  const { user, logout } = useAuth()

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a0a0b]/95 lg:bg-card/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex h-20 items-center justify-between px-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white text-sm">BN</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Buenas Nuevas
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Principal</p>
        <nav className="space-y-1.5">
        {navItems.map((item: NavItem) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href)
            
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group relative overflow-hidden ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl"></div>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              )}
              
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/passwords"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group relative overflow-hidden ${
              pathname === "/admin/passwords" ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            {pathname === "/admin/passwords" && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl"></div>
            )}
            {pathname === "/admin/passwords" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            )}
            <Settings className="w-5 h-5 relative z-10 transition-colors group-hover:text-blue-400" />
            <span className="relative z-10">Administrar Claves</span>
          </Link>
        )}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/5 bg-black/10 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="font-bold text-white text-xs uppercase">
                {user?.name ? user.name[0] : (user?.email ? user.email[0] : 'U')}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{user?.name || user?.email}</p>
              <p className="text-[10px] text-muted-foreground">{user?.role === 'ADMIN' ? 'Administrador' : 'Líder'}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()} 
            title="Cerrar Sesión"
            className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <Link 
          to="/profile" 
          onClick={onClose}
          className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs border border-white/5 text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-center"
        >
          <Key className="w-3.5 h-3.5" /> Mi Perfil / Clave
        </Link>
      </div>
    </aside>
  )
}
