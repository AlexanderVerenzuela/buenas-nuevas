import { useState, useEffect, useMemo } from "react"
import { useApi } from "../hooks/useApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react"
import { getImageUrl } from "../lib/utils"

export default function AdminPasswords() {
  const { request } = useApi()
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Modal states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [modalSuccess, setModalSuccess] = useState("")

  const fetchUsers = async () => {
    try {
      const data = await request('/auth/users')
      setUsersList(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return usersList
    const query = searchQuery.toLowerCase()
    return usersList.filter(u => 
      u.name?.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    )
  }, [usersList, searchQuery])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError("")
    setModalSuccess("")

    if (newPassword !== confirmPassword) {
      setModalError("Las contraseñas no coinciden.")
      setModalLoading(false)
      return
    }

    if (newPassword.length < 4) {
      setModalError("La contraseña debe tener al menos 4 caracteres.")
      setModalLoading(false)
      return
    }

    try {
      await request(`/auth/users/${selectedUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      })

      setModalSuccess("La contraseña se ha actualizado correctamente.")
      setNewPassword("")
      setConfirmPassword("")
      
      // Auto close after 1.5 seconds
      setTimeout(() => {
        setSelectedUser(null)
        setModalSuccess("")
      }, 1500)
    } catch (err: any) {
      setModalError(err.message || "Error al actualizar la contraseña.")
    } finally {
      setModalLoading(false)
    }
  }

  if (loading) return <div>Cargando lista de accesos...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Administrar Claves de Acceso
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Como Administrador, puedes gestionar y restablecer las contraseñas de todos los líderes.</p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="w-full sm:max-w-sm relative">
          <Input 
            placeholder="Buscar usuario o correo..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Nombre de Usuario / Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No se encontraron accesos de usuario.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-white/10 flex-shrink-0">
                        {getImageUrl(u.avatarUrl) ? (
                          <img src={getImageUrl(u.avatarUrl)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 text-xs font-bold uppercase">
                            {u.name ? u.name[0] : (u.email ? u.email[0] : 'U')}
                          </div>
                        )}
                      </div>
                      <span>{u.name || "Sin Nombre"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}>
                      {u.role === 'ADMIN' ? 'Administrador' : 'Líder'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedUser(u)
                        setModalError("")
                        setModalSuccess("")
                        setNewPassword("")
                        setConfirmPassword("")
                        setShowPassword(false)
                      }}
                      className="bg-card hover:bg-primary hover:text-primary-foreground gap-1.5 transition-all text-xs"
                    >
                      <Lock className="w-3.5 h-3.5" /> Cambiar Clave
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Change Password Dialog Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[400px] border-border/50 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Reestablecer Clave
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Usuario Seleccionado</Label>
                <p className="text-sm font-semibold text-foreground bg-muted/20 border border-white/5 py-2 px-3 rounded-xl">
                  {selectedUser.name || selectedUser.email} ({selectedUser.email})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNewPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Input 
                    id="adminNewPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                    className="bg-background/50 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminConfirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input 
                    id="adminConfirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
                    required
                    className="bg-background/50 rounded-xl pr-10"
                  />
                </div>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs font-medium text-destructive">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs font-medium text-green-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)} className="text-xs">Cancelar</Button>
                <Button type="submit" disabled={modalLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-5 text-xs">
                  {modalLoading ? "Guardando..." : "Guardar Clave"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
