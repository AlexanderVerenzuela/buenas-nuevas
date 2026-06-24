import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SidebarNav } from "@/components/modules/SidebarNav"
import { logoutAction } from "@/actions/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex h-16 items-center">
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CRM Juventud</h2>
        </div>
        <SidebarNav />
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{session.user?.role?.toLowerCase()}</span>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <header className="h-16 border-b border-border bg-card flex items-center px-6 md:hidden">
          <span className="font-semibold text-foreground">CRM Juventud</span>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
