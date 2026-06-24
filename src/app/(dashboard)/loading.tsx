import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse font-medium">Cargando...</p>
    </div>
  )
}
