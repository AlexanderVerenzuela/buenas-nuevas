"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"


export function LeaderForm({ onSubmit }: { onSubmit: (data: any) => Promise<boolean> }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      email: formData.get("email")
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
        Registrar Líder
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Líder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono / WP</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
              <Input id="email" name="email" type="email" />
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
