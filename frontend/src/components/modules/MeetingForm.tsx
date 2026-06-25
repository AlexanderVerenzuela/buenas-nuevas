"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Upload, Image as ImageIcon, Edit2, Plus } from "lucide-react"
import { API_URL } from "../../lib/config"
import { getImageUrl, compressImage } from "../../lib/utils"
import { useApi } from "../../hooks/useApi"

export function MeetingForm({ onSubmit, initialData, isDropdownItem }: { onSubmit: (data: any) => Promise<boolean>, initialData?: any, isDropdownItem?: boolean }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl ? getImageUrl(initialData.photoUrl) : null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [meetingType, setMeetingType] = useState<string>(initialData?.type || "GENERAL")
  const [preachers, setPreachers] = useState<string[]>([])
  
  const { request } = useApi()

  useEffect(() => {
    async function loadPreachers() {
      try {
        const [leadersData, youthData] = await Promise.all([
          request('/leaders'),
          request('/youth')
        ]);
        
        const leaderNames = (leadersData || []).map((l: any) => `${l.firstName} ${l.lastName || ''}`.trim());
        const preachingYouthNames = (youthData || [])
          .filter((y: any) => y.status === 'PREACHING')
          .map((y: any) => `${y.firstName} ${y.lastName || ''}`.trim());
          
        const combined = Array.from(new Set([...leaderNames, ...preachingYouthNames])).sort();
        setPreachers(combined);
      } catch (err) {
        console.error("Error al cargar predicadores:", err);
      }
    }
    
    if (open) {
      loadPreachers();
      if (initialData) {
        setPhotoPreview(initialData?.photoUrl ? getImageUrl(initialData.photoUrl) : null)
        setPhotoFile(null)
        setMeetingType(initialData.type || "GENERAL")
      } else {
        setPhotoPreview(null)
        setPhotoFile(null)
        setMeetingType("GENERAL")
      }
    }
  }, [open, initialData])

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
    
    let photoUrl = initialData?.photoUrl || null;
    
    // Subir imagen de reunión si se seleccionó una nueva
    if (photoFile) {
      const imgData = new FormData();
      try {
        // Comprimir la imagen antes de subirla (máx 600x400 píxeles, 70% calidad)
        const compressedFile = await compressImage(photoFile, 600, 400, 0.7);
        imgData.append('image', compressedFile);
        
        const token = localStorage.getItem('token') || '';
        const tokenVal = token.replace(/['"]+/g, '');
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: imgData,
          headers: {
            'Authorization': `Bearer ${tokenVal}`
          }
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.url) {
           photoUrl = uploadJson.url;
        }
      } catch (err) {
        console.error("Error al subir imagen de reunión", err);
      }
    }

    const data = {
      title: formData.get("title"),
      type: formData.get("type"),
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      description: formData.get("description"),
      photoUrl,
      preacher: formData.get("preacher") || null,
      preachingTheme: formData.get("preachingTheme") || null,
      subType: formData.get("subType") || null,
      meetingNotes: formData.get("meetingNotes") || null,
    }
    const success = await onSubmit(data)
    if (success) {
      setOpen(false)
      if (!initialData) {
        setPhotoFile(null)
        setPhotoPreview(null)
      }
    }
    setPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isDropdownItem ? (
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-sm font-normal text-foreground hover:bg-accent hover:text-accent-foreground rounded-md border-none cursor-pointer focus:bg-accent focus:text-accent-foreground" />
          ) : initialData ? (
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-8 px-2" />
          ) : (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl" />
          )
        }
      >
        {isDropdownItem ? (
          <><Edit2 className="w-4 h-4" /> Editar</>
        ) : initialData ? (
          <><Edit2 className="w-4 h-4 mr-1" /> Editar</>
        ) : (
          <><Plus className="w-4 h-4 mr-2" /> Nueva Reunión</>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initialData ? 'Editar Reunión' : 'Programar Nueva Reunión'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            
            {/* Portada de la Reunión */}
            <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-muted/20">
              <label className="w-full h-36 rounded-xl border-2 border-dashed border-border/50 bg-background/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors relative group">
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2"><Upload className="w-4 h-4" /> Cambiar foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground font-medium">Añadir foto o flyer</span>
                    <span className="text-xs text-muted-foreground mt-1">Recomendado: 16:9</span>
                  </>
                )}
              </label>
              {photoPreview && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }} className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                  Quitar foto
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="Ej. Culto de Jóvenes" required className="bg-background/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Reunión</Label>
              <Select 
                name="type" 
                defaultValue={initialData?.type || "GENERAL"} 
                onValueChange={(val) => setMeetingType(val || "GENERAL")} 
                required
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">Normal (Culto)</SelectItem>
                  <SelectItem value="DISCIPLESHIP">Discipulado</SelectItem>
                  <SelectItem value="CELL_GROUP">Célula / Grupo Pequeño</SelectItem>
                  <SelectItem value="SPECIAL_EVENT">Especial (Actividad)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos condicionales según el tipo de reunión */}
            {meetingType === "GENERAL" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="preacher">¿Quién predicó?</Label>
                  <Input 
                    id="preacher" 
                    name="preacher" 
                    list="preachers-list" 
                    defaultValue={initialData?.preacher || ""} 
                    placeholder="Selecciona o escribe el nombre del predicador..." 
                    required 
                    className="bg-background/50 animate-in fade-in-50 duration-200"
                  />
                  <datalist id="preachers-list">
                    {preachers.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preachingTheme">Tema de prédica</Label>
                  <Input 
                    id="preachingTheme" 
                    name="preachingTheme" 
                    defaultValue={initialData?.preachingTheme || ""} 
                    placeholder="Ej. Fe y Valentía" 
                    required 
                    className="bg-background/50 animate-in fade-in-50 duration-200"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="subType">Tipo Especial</Label>
                  <Select name="subType" defaultValue={initialData?.subType || "cine"}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cine">Cine</SelectItem>
                      <SelectItem value="salida evangelistica">Salida Evangelística</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meetingNotes">Notas adicionales</Label>
                  <Textarea 
                    id="meetingNotes" 
                    name="meetingNotes" 
                    defaultValue={initialData?.meetingNotes || ""} 
                    placeholder="Detalles sobre el cine, lugar de salida, o notas generales..." 
                    className="bg-background/50 min-h-[80px] animate-in fade-in-50 duration-200"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ''} required className="bg-background/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" name="time" type="time" defaultValue={initialData?.time} required className="bg-background/50" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Lugar</Label>
              <Input id="location" name="location" defaultValue={initialData?.location} placeholder="Auditorio Principal" className="bg-background/50" />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-6">
              {pending ? "Guardando..." : "Guardar Reunión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
