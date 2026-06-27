import { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function Profile() {
  const { user } = useAuth()
  const { request } = useApi()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.")
      setLoading(false)
      return
    }

    if (newPassword.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.")
      setLoading(false)
      return
    }

    try {
      await request('/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      })

      setSuccess("Tu contraseña ha sido actualizada correctamente.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Mi Perfil
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Administra tu información de cuenta y seguridad.</p>
      </div>

      <Card className="border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Nombre</Label>
              <div className="text-sm font-medium text-foreground py-2 px-3 bg-muted/20 border border-white/5 rounded-xl">
                {user?.name || "Sin Nombre"}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Usuario / Correo</Label>
              <div className="text-sm font-medium text-foreground py-2 px-3 bg-muted/20 border border-white/5 rounded-xl">
                {user?.email}
              </div>
            </div>

            <hr className="border-white/5 my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                </button>
              </div>
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
                className="bg-background/50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                className="bg-background/50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                required
                className="bg-background/50 rounded-xl"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm font-medium text-destructive">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm font-medium text-green-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl">
              {loading ? "Guardando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
