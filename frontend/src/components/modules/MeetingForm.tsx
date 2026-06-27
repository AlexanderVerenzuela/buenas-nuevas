"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Image as ImageIcon, Edit2, Plus, ShieldAlert, X } from "lucide-react"
import { API_URL } from "../../lib/config"
import { getImageUrl, compressImage } from "../../lib/utils"
import { useApi } from "../../hooks/useApi"

function parsePhotos(photoUrl: string | null | undefined): string[] {
  if (!photoUrl) return [];
  if (photoUrl.startsWith('[') && photoUrl.endsWith(']')) {
    try {
      return JSON.parse(photoUrl);
    } catch {
      return [photoUrl];
    }
  }
  return [photoUrl];
}

export function MeetingForm({ onSubmit, initialData, isDropdownItem, forceOpen, onClose }: { 
  onSubmit: (data: any) => Promise<boolean>, 
  initialData?: any, 
  isDropdownItem?: boolean,
  forceOpen?: boolean,
  onClose?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  
  // Lista de fotos con ID único, URL de previsualización y Archivo (File) si es nuevo
  const [photosList, setPhotosList] = useState<{ id: string; url: string; file: File | null }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [meetingType, setMeetingType] = useState<string>(initialData?.type || "GENERAL")
  const [preachers, setPreachers] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
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
    
    if (open || forceOpen) {
      loadPreachers();
      setErrorMsg(null);
      if (initialData) {
        const parsed = parsePhotos(initialData.photoUrl);
        setPhotosList(parsed.map(url => ({ id: Math.random().toString(), url: getImageUrl(url), file: null })));
        setMeetingType(initialData.type || "GENERAL")
      } else {
        setPhotosList([])
        setMeetingType("GENERAL")
      }
    }
  }, [open, forceOpen, initialData])

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null)
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(),
        url: URL.createObjectURL(file),
        file
      }));
      setPhotosList(prev => [...prev, ...newPhotos]);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setErrorMsg(null)
    if (e.dataTransfer.files) {
      const newPhotos = Array.from(e.dataTransfer.files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          id: Math.random().toString(),
          url: URL.createObjectURL(file),
          file
        }));
      setPhotosList(prev => [...prev, ...newPhotos]);
    }
  }

  const handleRemovePhoto = (id: string) => {
    setPhotosList(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)
    
    const uploadedUrls: string[] = [];
    const backendBase = API_URL.replace('/api', '');

    // Procesar cada foto de la lista
    for (const photo of photosList) {
      if (photo.file) {
        // Subir foto nueva
        const imgData = new FormData();
        try {
          const compressedFile = await compressImage(photo.file, 800, 600, 0.8);
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
          
          if (!uploadRes.ok) {
            throw new Error(uploadJson.error || "No se pudo subir la imagen.");
          }
          
          if (uploadJson.url) {
            uploadedUrls.push(uploadJson.url);
          }
        } catch (err: any) {
          console.error("Error al subir imagen de reunión", err);
          setErrorMsg("Error al subir imagen: " + (err.message || "Por favor intente de nuevo."));
          setPending(false);
          return;
        }
      } else {
        // Mantener foto existente (limpiando prefijo del host local si está presente para guardar solo ruta relativa)
        let url = photo.url;
        if (url.startsWith(backendBase)) {
          url = url.replace(backendBase, '');
        }
        uploadedUrls.push(url);
      }
    }

    // Convertir el arreglo a JSON o dejar en null si está vacío
    const photoUrl = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;

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
        setPhotosList([])
      }
    }
    setPending(false)
  }

  const handleClose = () => {
    if (forceOpen !== undefined) {
      onClose?.();
    } else {
      setOpen(false);
    }
  }

  const dialogContent = (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl scrollbar-thin">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{initialData ? 'Editar Reunión' : 'Programar Nueva Reunión'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 py-4">
          
          {/* Portadas de la Reunión con soporte Drag and Drop y multi-fotos */}
          <div className="flex flex-col gap-3 p-4 border rounded-xl bg-muted/20">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">Fotos / Flyers de la Reunión</Label>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full min-h-24 p-3 rounded-xl border-2 border-dashed flex flex-col justify-center transition-all ${
                isDragging 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-border/50 bg-background/50"
              }`}
            >
              {photosList.length === 0 ? (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4 group">
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosSelect} />
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-foreground font-medium">Añadir fotos o flyers (Ej. Flyer + Foto final)</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Arrastra o haz clic para seleccionar</span>
                </label>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {photosList.map((photo) => (
                    <div key={photo.id} className="relative h-24 rounded-lg overflow-hidden border border-white/10 shadow-md group">
                      <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all cursor-pointer shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Botón para añadir más fotos */}
                  <label className="h-24 rounded-lg border-2 border-dashed border-border/50 bg-background/50 hover:bg-accent/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotosSelect} />
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">Añadir más</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs font-medium text-destructive">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={initialData?.title} placeholder="Ej. Culto de Jóvenes" required className="bg-background/50" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Reunión</Label>
            <select 
              name="type" 
              defaultValue={initialData?.type || "GENERAL"} 
              onChange={(e) => setMeetingType(e.target.value || "GENERAL")} 
              required
              className="flex h-8 w-full rounded-lg border border-input bg-background/50 px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900 dark:border-zinc-800 text-foreground"
            >
              <option value="GENERAL" className="dark:bg-zinc-950">Normal (Culto)</option>
              <option value="CINE" className="dark:bg-zinc-950">Cine</option>
              <option value="SALIDA_EVANGELISTICA" className="dark:bg-zinc-950">Salida Evangelística</option>
              <option value="OTRO" className="dark:bg-zinc-950">Otro</option>
            </select>
          </div>

          <div className={`grid gap-5 ${meetingType === "GENERAL" ? "" : "hidden"}`}>
            <div className="grid gap-2">
              <Label htmlFor="preacher">¿Quién predicó?</Label>
              <select 
                name="preacher" 
                defaultValue={initialData?.preacher || ""}
                className="flex h-8 w-full rounded-lg border border-input bg-background/50 px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900 dark:border-zinc-800 text-foreground"
              >
                <option value="" className="dark:bg-zinc-950">Ninguno / Por definir</option>
                {preachers.map((name) => (
                  <option key={name} value={name} className="dark:bg-zinc-950">{name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preachingTheme">Tema de prédica</Label>
              <Input 
                id="preachingTheme" 
                name="preachingTheme" 
                defaultValue={initialData?.preachingTheme || ""} 
                placeholder="Ej. Fe y Valentía" 
                required={meetingType === "GENERAL"} 
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meetingNotes">Notas / Programa de la Reunión</Label>
            <Textarea 
              id="meetingNotes" 
              name="meetingNotes" 
              defaultValue={initialData?.meetingNotes || ""} 
              placeholder="Detalles del programa (ej. quién está en la puerta, orden del día) o notas de la reunión..." 
              className="bg-background/50 min-h-[80px]"
            />
          </div>

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
          <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-6 cursor-pointer">
            {pending ? "Guardando..." : "Guardar Reunión"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  if (forceOpen !== undefined) {
    return (
      <Dialog open={forceOpen} onOpenChange={(val) => { if (!val) onClose?.(); }}>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isDropdownItem ? (
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3 text-sm font-normal text-foreground hover:bg-accent hover:text-accent-foreground rounded-md border-none cursor-pointer focus:bg-accent focus:text-accent-foreground" />
          ) : initialData ? (
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-8 px-2 cursor-pointer" />
          ) : (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl cursor-pointer" />
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
      {dialogContent}
    </Dialog>
  )
}
