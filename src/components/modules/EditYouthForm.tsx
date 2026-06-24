"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { updateYouthInfo } from "@/actions/youth"
import { Edit3 } from "lucide-react"

export function EditYouthForm({ youth }: { youth: any }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    await updateYouthInfo(youth.id, formData)
    setPending(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="bg-card hover:bg-accent hover:text-accent-foreground gap-2" />}>
        <Edit3 className="h-4 w-4" /> Editar Perfil
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Datos del Joven</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input id="firstName" name="firstName" defaultValue={youth.firstName} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" defaultValue={youth.lastName} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono / WP</Label>
                <Input id="phone" name="phone" defaultValue={youth.phone || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select name="status" defaultValue={youth.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISITOR">Visita</SelectItem>
                    <SelectItem value="NEW">Nuevo</SelectItem>
                    <SelectItem value="MEMBER">Miembro</SelectItem>
                    <SelectItem value="LEADER">Líder</SelectItem>
                    <SelectItem value="PREACHING">Prédica</SelectItem>
                    <SelectItem value="FAMILY">Familiar</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input 
                id="birthDate" 
                name="birthDate" 
                type="date" 
                defaultValue={youth.birthDate ? new Date(youth.birthDate).toISOString().split('T')[0] : ""} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
