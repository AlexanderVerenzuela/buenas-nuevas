"use client"

// import removed; useActionState not needed
import { loginAction } from "@/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const formAction = loginAction

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background relative overflow-hidden">
      {/* Luces de fondo sutiles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10" />

      <Card className="w-full max-w-md bg-card/60 backdrop-blur-2xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Bienvenido</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="admin@iglesia.com" required className="bg-black/50 border-white/10 text-white focus:border-primary/50" />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input id="password" name="password" type="password" required className="bg-black/50 border-white/10 text-white focus:border-primary/50" />
            </div>
            
            {/* Error handling removed; adjust as needed */}
            
            <button 
              type="submit" 
              className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] mt-4"
            >
              {pending ? "Autenticando..." : "Iniciar Sesión"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
