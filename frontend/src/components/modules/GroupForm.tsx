"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"


interface Leader {
  id: string
  firstName: string
  lastName: string
}

export function GroupForm({ availableLeaders, onSubmit }: { availableLeaders: Leader[], onSubmit: (data: any) => Promise<boolean> }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      leaderId: formData.get("leaderId"),
      meetingDay: formData.get("meetingDay"),
      meetingTime: formData.get("meetingTime"),
      location: formData.get("location")
    }
    const success = await onSubmit(data)
    if (success) {
      setOpen(false)
    }
    setPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        Crear Grupo
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Grupo</Label>
              <Input id="name" name="name" placeholder="Ej. Raíces" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leaderId">Líder Asignado</Label>
              <Select name="leaderId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un líder" />
                </SelectTrigger>
                <SelectContent>
                  {availableLeaders.length === 0 ? (
                    <SelectItem value="none" disabled>No hay líderes disponibles</SelectItem>
                  ) : (
                    availableLeaders.map(leader => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.firstName} {leader.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="meetingDay">Día</Label>
                <Select name="meetingDay">
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meetingTime">Hora</Label>
                <Input id="meetingTime" name="meetingTime" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Lugar</Label>
              <Input id="location" name="location" placeholder="Casa de..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending || availableLeaders.length === 0}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
