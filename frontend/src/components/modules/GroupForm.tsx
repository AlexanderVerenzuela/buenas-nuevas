"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

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
      leaderId: formData.get("leaderId"),
    }
    const success = await onSubmit(data)
    if (success) {
      setOpen(false)
    }
    setPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl cursor-pointer" />}>
        <Plus className="w-4 h-4 mr-2" /> Asignar Líder
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[400px] border-border/50 bg-card/95 backdrop-blur-xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Asignar Líder de Discipulado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="leaderId" className="text-sm font-medium">Líder de Discipulado</Label>
              <Select name="leaderId" required>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecciona un líder" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
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
              <p className="text-xs text-muted-foreground mt-1">El líder se encargará de realizar el acompañamiento y discipulado a los jóvenes que le asignes.</p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending || availableLeaders.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl cursor-pointer">
              {pending ? "Guardando..." : "Asignar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
