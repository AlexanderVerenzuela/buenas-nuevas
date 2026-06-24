"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { updateLeaderInfo } from "@/actions/leaders"
import { Edit3 } from "lucide-react"

export function EditLeaderForm({ leader }: { leader: any }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    await updateLeaderInfo(leader.id, formData)
    setPending(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="bg-card hover:bg-accent hover:text-accent-foreground gap-2" />}>
        <Edit3 className="h-4 w-4" /> Editar
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Datos del Líder</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input id="firstName" name="firstName" defaultValue={leader.firstName} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" defaultValue={leader.lastName} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono / WP</Label>
                <Input id="phone" name="phone" defaultValue={leader.phone || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select name="isActive" defaultValue={leader.isActive ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
              <Input id="email" name="email" type="email" defaultValue={leader.email || ""} />
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
