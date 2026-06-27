import { useState, useEffect, useMemo } from "react"
import { useApi } from "../hooks/useApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, ShieldAlert, CheckCircle2, Eye, EyeOff, Settings } from "lucide-react"
import { getImageUrl } from "../lib/utils"

export default function AdminPasswords() {
  const { request } = useApi()
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Modal states
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
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

    if (newPassword && newPassword !== confirmPassword) {
      setModalError("Las contraseñas no coinciden.")
      setModalLoading(false)
      return
    }

    if (newPassword && newPassword.length < 4) {
      setModalError("La contraseña debe tener al menos 4 caracteres.")
      setModalLoading(false)
      return
    }

    try {
      await request(`/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          username,
          password: newPassword || undefined
        })
      })

      setModalSuccess("Acceso actualizado correctamente.")
      setNewPassword("")
      setConfirmPassword("")
      fetchUsers()
      
      // Auto close after 1.5 seconds
      setTimeout(() => {
        setSelectedUser(null)
        setModalSuccess("")
      }, 1500)
    } catch (err: any) {
      setModalError(err.message || "Error al actualizar el acceso.")
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
        <p className="text-sm text-muted-foreground mt-1">Como Administrador, puedes gestionar los nombres de usuario y restablecer las contraseñas de todos los líderes.</p>
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

      {/* Mobile view: list of cards */}
      <div className="space-y-4 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm bg-card/40 border border-white/5 rounded-xl">
            No se encontraron accesos de usuario.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="p-4 rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-white/10 flex-shrink-0">
                  {getImageUrl(u.avatarUrl) ? (
                    <img src={getImageUrl(u.avatarUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 text-sm font-bold uppercase">
                      {u.name ? u.name[0] : (u.email ? u.email[0] : 'U')}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate text-foreground">{u.name || "Sin Nombre"}</h4>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]'}>
                  {u.role === 'ADMIN' ? 'Administrador' : 'Líder'}
                </Badge>
                <Badge variant="outline" className={u.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20 text-[10px]' : 'bg-red-500/10 text-red-400 border-red-500/20 text-[10px]'}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="border-t border-white/5 pt-3 mt-1 flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedUser(u)
                    setUsername(u.email)
                    setModalError("")
                    setModalSuccess("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setShowPassword(false)
                    setShowCurrentPassword(false)
                  }}
                  className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-200 text-xs w-full py-2.5 h-auto cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 rounded-xl font-medium"
                >
                  <Settings className="w-3.5 h-3.5" /> Editar Acceso
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view: table */}
      <div className="hidden md:block rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Nombre de Usuario</TableHead>
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
                    <button 
                      onClick={() => {
                        setSelectedUser(u)
                        setUsername(u.email)
                        setModalError("")
                        setModalSuccess("")
                        setNewPassword("")
                        setConfirmPassword("")
                        setShowPassword(false)
                        setShowCurrentPassword(false)
                      }}
                      className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-200 text-xs cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium"
                    >
                      <Settings className="w-3.5 h-3.5" /> Editar Acceso
                    </button>
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
                <Settings className="w-5 h-5 text-primary" /> Editar Acceso de Líder
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Nombre Completo</Label>
                <p className="text-sm font-semibold text-foreground bg-muted/20 border border-white/5 py-2 px-3 rounded-xl">
                  {selectedUser.name || "Sin Nombre"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminUsername">Nombre de Usuario (Para Login)</Label>
                <Input 
                  id="adminUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. alexander"
                  required
                  className="bg-background/50 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Show current plain text password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contraseña Actual</Label>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showCurrentPassword ? "Ocultar" : "Ver"}</span>
                  </button>
                </div>
                <Input 
                  type={showCurrentPassword ? "text" : "password"}
                  value={selectedUser.plainPassword || "123456"}
                  readOnly
                  className="bg-muted/30 border border-white/5 rounded-xl font-mono text-xs cursor-default select-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminNewPassword">Nueva Contraseña (Opcional)</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? "Ocultar" : "Ver"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="adminNewPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Dejar en blanco para no cambiar"
                    className="bg-background/50 rounded-xl pr-10"
                  />
                </div>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <Label htmlFor="adminConfirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input 
                    id="adminConfirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
                    required
                    className="bg-background/50 rounded-xl"
                  />
                </div>
              )}

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
                  {modalLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
