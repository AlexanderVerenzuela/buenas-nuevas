import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { MeetingForm } from '../components/modules/MeetingForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, CalendarDays, MapPin, Users, Mic, BookOpen, Clapperboard, Footprints, Sparkles } from "lucide-react"
import { getImageUrl } from '../lib/utils';

const typeMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  GENERAL: { label: "Normal (Culto)", icon: <Mic className="w-3.5 h-3.5" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  DISCIPLESHIP: { label: "Discipulado", icon: <BookOpen className="w-3.5 h-3.5" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  CELL_GROUP: { label: "Célula", icon: <Users className="w-3.5 h-3.5" />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  SPECIAL_EVENT: { label: "Evento Especial", icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  CAMP: { label: "Campamento", icon: <Footprints className="w-3.5 h-3.5" />, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
}

const subTypeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  cine: { label: "Cine", icon: <Clapperboard className="w-3 h-3" /> },
  "salida evangelistica": { label: "Salida Evangelística", icon: <Footprints className="w-3 h-3" /> },
  otro: { label: "Otro", icon: <Sparkles className="w-3 h-3" /> },
}

const statusMap: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Programada", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  COMPLETED: { label: "Completada", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  const fetchMeetings = async () => {
    try {
      const data = await request('/meetings');
      setMeetings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar esta reunión?")) {
      try {
        await request(`/meetings/${id}`, { method: 'DELETE' });
        setMeetings(prev => prev.filter((m: any) => m.id !== id));
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await request('/meetings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setMeetings([res.meeting, ...meetings]);
      return true;
    } catch (error) {
      alert("Error al crear reunión");
      return false;
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const res = await request(`/meetings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setMeetings(meetings.map(m => m.id === id ? { ...m, ...res.meeting } : m));
      return true;
    } catch (error) {
      alert("Error al actualizar reunión");
      return false;
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Reuniones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Programa y administra las reuniones de la juventud.</p>
        </div>
        <MeetingForm onSubmit={handleCreate} />
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Reunión</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No hay reuniones programadas.
                </TableCell>
              </TableRow>
            ) : (
              meetings.map((meeting: any) => {
                const sMap = statusMap[meeting.status as keyof typeof statusMap] || statusMap.SCHEDULED
                const tMap = typeMap[meeting.type as keyof typeof typeMap] || typeMap.GENERAL
                return (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {meeting.photoUrl && (
                          <img 
                            src={getImageUrl(meeting.photoUrl)} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          {meeting.location && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {meeting.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${tMap.color} gap-1 text-xs`}>
                        {tMap.icon} {tMap.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(meeting.date).toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                      {meeting.time && <div className="text-xs text-muted-foreground ml-5">{meeting.time}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {meeting.preacher && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mic className="w-3 h-3 text-blue-400" />
                            <span>{meeting.preacher}</span>
                          </div>
                        )}
                        {meeting.preachingTheme && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BookOpen className="w-3 h-3 text-purple-400" />
                            <span className="truncate max-w-[150px]">{meeting.preachingTheme}</span>
                          </div>
                        )}
                        {meeting.subType && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {subTypeMap[meeting.subType]?.icon || <Sparkles className="w-3 h-3" />}
                            <span>{subTypeMap[meeting.subType]?.label || meeting.subType}</span>
                          </div>
                        )}
                        {!meeting.preacher && !meeting.preachingTheme && !meeting.subType && (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className={sMap.color}>
                          {sMap.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {meeting._count?.attendances || 0} asistencias
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/meetings/${meeting.id}/attendance`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs bg-card">Pasar Lista</Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="h-7 w-7" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 p-1">
                            <MeetingForm isDropdownItem onSubmit={(data) => handleEdit(meeting.id, data)} initialData={meeting} />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(meeting.id)} 
                              className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-3">
        {meetings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl">
            No hay reuniones programadas.
          </div>
        ) : (
          meetings.map((meeting: any) => {
            const sMap = statusMap[meeting.status as keyof typeof statusMap] || statusMap.SCHEDULED
            const tMap = typeMap[meeting.type as keyof typeof typeMap] || typeMap.GENERAL
            return (
              <div key={meeting.id} className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden">
                {/* Photo banner */}
                {meeting.photoUrl && (
                  <img 
                    src={getImageUrl(meeting.photoUrl)} 
                    alt="" 
                    className="w-full h-28 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                
                <div className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">{meeting.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`${tMap.color} gap-1 text-[11px]`}>
                          {tMap.icon} {tMap.label}
                        </Badge>
                        <Badge variant="outline" className={`${sMap.color} text-[11px]`}>
                          {sMap.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="h-8 w-8 flex-shrink-0" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 p-1">
                        <MeetingForm isDropdownItem onSubmit={(data) => handleEdit(meeting.id, data)} initialData={meeting} />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(meeting.id)} 
                          className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-primary/60" />
                      <span>{new Date(meeting.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span>
                      {meeting.time && <span className="text-muted-foreground/60">• {meeting.time}</span>}
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}
                    {meeting.preacher && (
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate">{meeting.preacher}</span>
                      </div>
                    )}
                    {meeting.preachingTheme && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{meeting.preachingTheme}</span>
                      </div>
                    )}
                    {meeting.subType && (
                      <div className="flex items-center gap-1.5">
                        {subTypeMap[meeting.subType]?.icon || <Sparkles className="w-3.5 h-3.5" />}
                        <span>{subTypeMap[meeting.subType]?.label || meeting.subType}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary/60" />
                      <span>{meeting._count?.attendances || 0} asistencias</span>
                    </div>
                  </div>

                  {/* Meeting notes */}
                  {meeting.meetingNotes && (
                    <p className="text-xs text-muted-foreground/80 bg-muted/20 rounded-lg p-2 line-clamp-2">
                      {meeting.meetingNotes}
                    </p>
                  )}

                  {/* Actions */}
                  <Link to={`/meetings/${meeting.id}/attendance`} className="block">
                    <Button variant="outline" size="sm" className="w-full h-9 text-xs bg-card">
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Pasar Lista
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
