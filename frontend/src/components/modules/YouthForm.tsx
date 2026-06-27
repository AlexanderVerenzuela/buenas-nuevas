"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"


export function YouthForm({ onSubmit }: { onSubmit: (data: any) => Promise<{ error?: string }> }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      status: formData.get("status")
    }
    const result = await onSubmit(data)
    
    if (result?.error) {
      setErrorMsg(result.error)
      setPending(false)
      return
    }

    setPending(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        Registrar Joven
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Joven</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {errorMsg && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm">
                {errorMsg}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono / WP</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado Inicial</Label>
                <Select name="status" required items={[
                  { value: "VISITOR", label: "Visita" },
                  { value: "NEW", label: "Nuevo" },
                  { value: "MEMBER", label: "Miembro" },
                  { value: "LEADER", label: "Líder" },
                  { value: "PREACHING", label: "Prédica" },
                  { value: "FAMILY", label: "Familiar" }
                ]}>
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
                  </SelectContent>
                </Select>
              </div>
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
