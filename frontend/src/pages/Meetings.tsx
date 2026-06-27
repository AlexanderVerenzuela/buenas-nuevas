import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { MeetingForm } from '../components/modules/MeetingForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Trash2, CalendarDays, MapPin, Users, Mic, BookOpen, Clapperboard, Footprints, Sparkles, Edit2, ZoomIn, X } from "lucide-react"
import { getImageUrl } from '../lib/utils';

const typeMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  GENERAL: { label: "Normal (Culto)", icon: <Mic className="w-3.5 h-3.5" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  CINE: { label: "Cine", icon: <Clapperboard className="w-3.5 h-3.5" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  SALIDA_EVANGELISTICA: { label: "Salida Evangelística", icon: <Footprints className="w-3.5 h-3.5" />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  OTRO: { label: "Otro", icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
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
  COMPLETED: { label: "Finalizada", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

function getFirstPhoto(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('[') && photoUrl.endsWith(']')) {
    try {
      const arr = JSON.parse(photoUrl);
      return arr[0] || null;
    } catch {
      return photoUrl;
    }
  }
  return photoUrl;
}

function getAllPhotos(photoUrl: string | null | undefined): string[] {
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

const getMeetingStatus = (meeting: any) => {
  if (meeting.status === 'CANCELLED') return 'CANCELLED';
  const meetingDate = new Date(meeting.date);
  if (meeting.time) {
    const [hours, minutes] = meeting.time.split(':');
    meetingDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
  } else {
    meetingDate.setHours(23, 59, 59, 999);
  }
  const isPassed = meetingDate.getTime() < Date.now();
  return isPassed ? 'COMPLETED' : 'SCHEDULED';
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const handleViewDetails = async (meeting: any) => {
    setSelectedMeeting(meeting);
    setLoadingAttendance(true);
    try {
      const data = await request(`/meetings/${meeting.id}/attendance`);
      setAttendanceList(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAttendance(false);
    }
  };

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
                const currentStatus = getMeetingStatus(meeting)
                const sMap = statusMap[currentStatus] || statusMap.SCHEDULED
                const tMap = typeMap[meeting.type as keyof typeof typeMap] || typeMap.GENERAL
                return (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFirstPhoto(meeting.photoUrl) && (
                          <img 
                            src={getImageUrl(getFirstPhoto(meeting.photoUrl))} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleViewDetails(meeting)}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <div>
                          <div className="font-medium cursor-pointer hover:underline text-primary transition-colors" onClick={() => handleViewDetails(meeting)}>{meeting.title}</div>
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
                      <Badge variant="outline" className={sMap.color}>
                        {sMap.label}
                      </Badge>
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
                            <DropdownMenuItem
                              onClick={() => setEditingMeeting(meeting)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
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
            const currentStatus = getMeetingStatus(meeting)
            const sMap = statusMap[currentStatus] || statusMap.SCHEDULED
            const tMap = typeMap[meeting.type as keyof typeof typeMap] || typeMap.GENERAL
            return (
              <div key={meeting.id} className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden animate-in fade-in duration-200">
                {/* Photo banner */}
                {getFirstPhoto(meeting.photoUrl) && (
                  <img 
                    src={getImageUrl(getFirstPhoto(meeting.photoUrl))} 
                    alt="" 
                    className="w-full h-28 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleViewDetails(meeting)}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                
                <div className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate cursor-pointer hover:underline text-primary" onClick={() => handleViewDetails(meeting)}>{meeting.title}</h3>
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
                        <DropdownMenuItem
                          onClick={() => setEditingMeeting(meeting)}
                          className="cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
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
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground" onClick={() => handleViewDetails(meeting)}>
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      <CalendarDays className="w-3.5 h-3.5 text-primary/60" />
                      <span>{new Date(meeting.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span>
                      {meeting.time && <span className="text-muted-foreground/60">• {meeting.time}</span>}
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        <MapPin className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}
                    {meeting.preacher && (
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        <Mic className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate">{meeting.preacher}</span>
                      </div>
                    )}
                    {meeting.preachingTheme && (
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{meeting.preachingTheme}</span>
                      </div>
                    )}
                    {meeting.subType && (
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        {subTypeMap[meeting.subType]?.icon || <Sparkles className="w-3.5 h-3.5" />}
                        <span>{subTypeMap[meeting.subType]?.label || meeting.subType}</span>
                      </div>
                    )}
                  </div>

                  {/* Meeting notes */}
                  {meeting.meetingNotes && (
                    <p className="text-xs text-muted-foreground/80 bg-muted/20 rounded-lg p-2 line-clamp-2 cursor-pointer" onClick={() => handleViewDetails(meeting)}>
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

      {/* Visual, non-editable meeting details and attendance statistics Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl scrollbar-thin p-6">
          {selectedMeeting && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                 {getAllPhotos(selectedMeeting.photoUrl).length > 0 && (
                   <div className={`grid gap-3 ${getAllPhotos(selectedMeeting.photoUrl).length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                     {getAllPhotos(selectedMeeting.photoUrl).map((photo, index) => (
                       <div 
                         key={index}
                         onClick={() => setZoomedPhoto(photo)}
                         className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg border border-white/10 cursor-pointer group"
                       >
                         <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                           <ZoomIn className="w-5 h-5 text-white" />
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{selectedMeeting.title}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">Detalles de la reunión y resumen de asistencia</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-white/5 bg-muted/10 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">Fecha y Hora</div>
                      <div>{new Date(selectedMeeting.date).toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
                      {selectedMeeting.time && <div className="text-xs text-muted-foreground">{selectedMeeting.time}</div>}
                    </div>
                  </div>
                  {selectedMeeting.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-semibold text-foreground">Lugar</div>
                        <div>{selectedMeeting.location}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Tipo de Reunión</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={`${typeMap[selectedMeeting.type]?.color || 'bg-muted/50'} gap-1 text-xs`}>
                        {typeMap[selectedMeeting.type]?.icon || <Sparkles className="w-3.5 h-3.5" />} {typeMap[selectedMeeting.type]?.label || selectedMeeting.type}
                      </Badge>
                    </div>
                  </div>
                  {selectedMeeting.preacher && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mic className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-xs font-semibold text-foreground">Predicador</div>
                        <div>{selectedMeeting.preacher}</div>
                      </div>
                    </div>
                  )}
                  {selectedMeeting.preachingTheme && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-xs font-semibold text-foreground">Tema</div>
                        <div>{selectedMeeting.preachingTheme}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedMeeting.meetingNotes && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground">Notas de la Reunión</h4>
                  <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                    {selectedMeeting.meetingNotes}
                  </p>
                </div>
              )}

              {/* Attendance section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-base font-semibold text-foreground flex items-center justify-between">
                  <span>Asistencia</span>
                  {loadingAttendance && <span className="text-xs font-normal text-muted-foreground animate-pulse">Cargando lista...</span>}
                </h4>

                {!loadingAttendance && (
                  <>
                    {(() => {
                      const present = attendanceList.filter(y => y.attendances[0]?.status === 'PRESENT');
                      const absent = attendanceList.filter(y => y.attendances[0]?.status !== 'PRESENT');
                      const presentLeaders = present.filter(y => y.status === 'LEADER').length;
                      const presentYouths = present.filter(y => y.status !== 'LEADER').length;

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                              <div className="text-2xl font-bold text-green-400">{presentLeaders}</div>
                              <div className="text-[10px] sm:text-xs text-green-400/80 font-medium">Líderes</div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                              <div className="text-2xl font-bold text-blue-400">{presentYouths}</div>
                              <div className="text-[10px] sm:text-xs text-blue-400/80 font-medium">Jóvenes</div>
                            </div>
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                              <div className="text-2xl font-bold text-primary">{present.length}</div>
                              <div className="text-[10px] sm:text-xs text-primary/80 font-medium">Total Asistió</div>
                            </div>
                          </div>

                          {/* Columns */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Attended list */}
                            <div className="border border-white/5 bg-card/30 rounded-xl p-3">
                              <div className="text-xs font-semibold text-green-400 border-b border-white/5 pb-1.5 mb-2 flex justify-between">
                                <span>ASISTIERON</span>
                                <span className="bg-green-500/20 px-1.5 py-0.5 rounded text-[10px]">{present.length}</span>
                              </div>
                              <div className="max-h-[160px] overflow-y-auto scrollbar-thin text-xs space-y-1.5 pr-1">
                                {present.length === 0 ? (
                                  <div className="text-muted-foreground/50 py-4 text-center">Nadie registrado</div>
                                ) : (
                                  present.map(y => (
                                    <div key={y.id} className="py-1 px-1.5 hover:bg-white/5 rounded text-muted-foreground flex items-center justify-between">
                                      <span>{y.firstName} {y.lastName}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Absent list */}
                            <div className="border border-white/5 bg-card/30 rounded-xl p-3">
                              <div className="text-xs font-semibold text-red-400 border-b border-white/5 pb-1.5 mb-2 flex justify-between">
                                <span>FALTARON</span>
                                <span className="bg-red-500/20 px-1.5 py-0.5 rounded text-[10px]">{absent.length}</span>
                              </div>
                              <div className="max-h-[160px] overflow-y-auto scrollbar-thin text-xs space-y-1.5 pr-1">
                                {absent.length === 0 ? (
                                  <div className="text-muted-foreground/50 py-4 text-center">Nadie registrado</div>
                                ) : (
                                  absent.map(y => (
                                    <div key={y.id} className="py-1 px-1.5 hover:bg-white/5 rounded text-muted-foreground">
                                      {y.firstName} {y.lastName}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Standalone edit form - rendered outside DropdownMenu to avoid focus-trap conflicts */}
      {editingMeeting && (
        <MeetingForm
          initialData={editingMeeting}
          forceOpen
          onClose={() => setEditingMeeting(null)}
          onSubmit={async (data) => {
            const ok = await handleEdit(editingMeeting.id, data);
            if (ok) setEditingMeeting(null);
            return ok;
          }}
        />
      )}
      {zoomedPhoto && (
        <div 
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center cursor-zoom-out p-4 animate-in fade-in duration-200"
        >
          <div className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer shadow-lg z-50">
            <X className="w-5 h-5" />
          </div>
          <img 
            src={getImageUrl(zoomedPhoto)} 
            alt="Zoomed" 
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/5 cursor-zoom-out" 
          />
        </div>
      )}
    </div>
  )
}
