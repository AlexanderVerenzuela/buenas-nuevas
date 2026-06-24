"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { createMeeting } from "@/actions/meetings"

export function MeetingForm() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    await createMeeting(formData)
    setPending(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        Nueva Reunión
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Programar Nueva Reunión</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Ej. Culto de Jóvenes" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Reunión</Label>
              <Select name="type" defaultValue="GENERAL" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="DISCIPLESHIP">Discipulado</SelectItem>
                  <SelectItem value="CELL_GROUP">Célula / Grupo Pequeño</SelectItem>
                  <SelectItem value="SPECIAL_EVENT">Evento Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" name="time" type="time" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Lugar</Label>
              <Input id="location" name="location" placeholder="Auditorio Principal" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
