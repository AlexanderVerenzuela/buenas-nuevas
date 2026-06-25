"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useApi } from "../../hooks/useApi"
import { Edit3, Upload, Image as ImageIcon } from "lucide-react"

export function EditYouthForm({ youth }: { youth: any }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const { request, clearCache } = useApi()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState(youth.avatarUrl || null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
      }
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0])
      setPhotoPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    
    let avatarUrl = youth.avatarUrl;
    
    if (photoFile) {
      const imgData = new FormData();
      imgData.append('image', photoFile);
      try {
        const token = localStorage.getItem('token') || '';
        const tokenVal = token.replace(/['"]+/g, ''); // en caso que esté como string JSON
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: imgData,
          headers: {
            'Authorization': `Bearer ${tokenVal}`
          }
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.url) {
           avatarUrl = uploadJson.url;
        }
      } catch (err) {
        console.error("Error al subir imagen", err);
      }
    }

    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      status: formData.get("status"),
      birthDate: formData.get("birthDate"),
      isStudying: formData.get("isStudying") === 'on',
      career: formData.get("career"),
      studyCenter: formData.get("studyCenter"),
      isWorking: formData.get("isWorking") === 'on',
      workplace: formData.get("workplace"),
      occupation: formData.get("occupation"),
      avatarUrl
    }
    
    try {
      await request(`/youth/${youth.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      clearCache();
      window.location.reload()
    } catch (error) {
      alert("Error al actualizar")
    }
    setPending(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="bg-card hover:bg-accent hover:text-accent-foreground gap-2" />}>
        <Edit3 className="h-4 w-4" /> Editar Perfil
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Datos del Joven</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            
            {/* Foto de Perfil */}
            <div 
              className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-muted-foreground/25 bg-muted/10'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center relative group">
                {photoPreview ? (
                  <img src={photoPreview.startsWith('http') || photoPreview.startsWith('blob:') ? photoPreview : `http://localhost:5000${photoPreview}`} alt="Preview" className="w-full h-full aspect-square object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
                {isDragging && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary animate-bounce" />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Arrastra una imagen aquí o</p>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="bg-card hover:bg-accent">
                  <Upload className="w-4 h-4 mr-2" /> Examinar archivos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombres</Label>
                <Input id="firstName" name="firstName" defaultValue={youth.firstName} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" name="lastName" defaultValue={youth.lastName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono / WP</Label>
                <Input id="phone" name="phone" defaultValue={youth.phone || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select name="status" defaultValue={youth.status}>
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
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
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input id="birthDate" name="birthDate" type="date" defaultValue={youth.birthDate ? new Date(youth.birthDate).toISOString().split('T')[0] : ""} />
              </div>
            </div>

            {/* Estudios y Trabajo */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="col-span-2 flex items-center gap-2 mb-2">
                <input type="checkbox" id="isStudying" name="isStudying" defaultChecked={youth.isStudying} className="rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="isStudying" className="font-semibold text-base">¿Está estudiando?</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="career">Carrera / Grado</Label>
                <Input id="career" name="career" defaultValue={youth.career || ""} placeholder="Ej. Ingeniería de Sistemas" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studyCenter">Centro de Estudios</Label>
                <Input id="studyCenter" name="studyCenter" defaultValue={youth.studyCenter || ""} placeholder="Ej. Universidad Mayor" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="col-span-2 flex items-center gap-2 mb-2">
                <input type="checkbox" id="isWorking" name="isWorking" defaultChecked={youth.isWorking} className="rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="isWorking" className="font-semibold text-base">¿Está trabajando?</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="occupation">Ocupación / Cargo</Label>
                <Input id="occupation" name="occupation" defaultValue={youth.occupation || ""} placeholder="Ej. Vendedor" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workplace">Lugar de Trabajo</Label>
                <Input id="workplace" name="workplace" defaultValue={youth.workplace || ""} placeholder="Ej. Tienda Centro" />
              </div>
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
