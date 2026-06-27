import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, Save, Briefcase, GraduationCap, CalendarDays, Phone, ZoomIn, X } from 'lucide-react';
import { EditYouthForm } from '../components/modules/EditYouthForm';
import { getImageUrl } from '../lib/utils';

function calculateAge(birthDateString: string) {
  if (!birthDateString) return null;
  const today = new Date();
  const birthDate = new Date(birthDateString.split('T')[0] + 'T12:00:00Z');
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const statusMap = {
  VISITOR: { label: "Visita", color: "bg-accent text-muted-foreground" },
  NEW: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-none" },
  MEMBER: { label: "Miembro", color: "bg-green-500/20 text-green-400 border-none" },
  LEADER: { label: "Líder", color: "bg-purple-500/20 text-purple-400 border-none" },
  INACTIVE: { label: "Inactivo", color: "bg-red-500/20 text-red-400 border-none" },
  PREACHING: { label: "Prédica", color: "bg-cyan-500/20 text-cyan-400 border-none" },
  FAMILY: { label: "Familiar", color: "bg-yellow-500/20 text-yellow-400 border-none" },
}

export default function YouthProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { request } = useApi();
  const [profile, setProfile] = useState<any>(location.state?.profile || null);
  const [loading, setLoading] = useState(!location.state?.profile);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await request(`/youth/${id}`);
        setProfile(data);
        setNotes(data.observations || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await request(`/youth/${id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      // La caché global ya se limpia sola en useApi por ser PATCH
      alert("Notas guardadas correctamente");
    } catch (error) {
      alert("Error al guardar notas");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Cargando perfil...</div>;
  if (!profile) return <div className="p-8 text-red-500">No se encontró el perfil.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Premium Header */}
      <div className="relative rounded-2xl overflow-hidden bg-card border shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="px-6 pb-6 relative">
          <Link to="/youth" className="absolute top-4 right-4 z-10">
            <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-background/80 backdrop-blur">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
            <div className="w-28 h-28 rounded-2xl border-4 border-background shadow-lg overflow-hidden bg-muted flex-shrink-0 z-10 group relative aspect-square">
              {getImageUrl(profile.avatarUrl) ? (
                <Dialog>
                  <DialogTrigger render={<div className="cursor-pointer w-full h-full relative block" />}>
                    <img src={getImageUrl(profile.avatarUrl)} alt="Avatar" className="w-full h-full object-cover aspect-square transition-transform group-hover:scale-105 duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </DialogTrigger>
                  <DialogContent showCloseButton={false} className="fixed inset-0 translate-x-0 translate-y-0 max-w-none w-screen h-screen bg-black/90 flex items-center justify-center p-4 rounded-none border-none ring-0 focus-visible:ring-0 cursor-zoom-out z-[9999]">
                    <DialogClose className="w-full h-full flex items-center justify-center relative outline-none cursor-zoom-out">
                      <div className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer shadow-lg z-50">
                        <X className="w-5 h-5" />
                      </div>
                      <img src={getImageUrl(profile.avatarUrl)} alt="Avatar Zoom" className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/5 cursor-zoom-out" />
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
                  <span className="text-3xl font-bold uppercase">
                    {profile.firstName[0]}
                    {profile.lastName ? profile.lastName[0] : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge variant="secondary" className={`text-sm px-3 py-1 shadow-sm ${statusMap[profile.status as keyof typeof statusMap]?.color || statusMap.VISITOR.color}`}>
                  {statusMap[profile.status as keyof typeof statusMap]?.label || profile.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                Miembro desde {new Date(profile.createdAt).getFullYear()}
                {profile.leader && (
                  <>• <span className="text-primary font-medium">Líder: {profile.leader.firstName} {profile.leader.lastName}</span></>
                )}
              </p>
            </div>

            <div className="pb-2">
              <EditYouthForm youth={profile} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Info Personal */}
        <div className="space-y-6 md:col-span-1">
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">Detalles Personales</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Teléfono / WhatsApp</p>
                  <p className="font-medium">{profile.phone || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><CalendarDays className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Nacimiento</p>
                  <p className="font-medium">
                    {profile.birthDate ? profile.birthDate.split('T')[0].split('-').reverse().join('/') : 'No registrado'}
                    {profile.birthDate && <span className="text-muted-foreground ml-1">({calculateAge(profile.birthDate)} años)</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><GraduationCap className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Estudios</p>
                  <p className="font-medium">{profile.isStudying ? (profile.career || 'Estudiando') : 'No estudia actualmente'}</p>
                  {profile.studyCenter && <p className="text-xs text-muted-foreground">{profile.studyCenter}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Briefcase className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Trabajo</p>
                  <p className="font-medium">{profile.isWorking ? (profile.occupation || 'Trabajando') : 'No trabaja actualmente'}</p>
                  {profile.workplace && <p className="text-xs text-muted-foreground">{profile.workplace}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Notas y Asistencia */}
        <div className="space-y-6 md:col-span-2">

          {/* Notas y Observaciones */}
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">Notas y Observaciones del Líder</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Escribe detalles importantes, peticiones de oración, o seguimiento aquí..."
                className="min-h-[120px] resize-y bg-background border-muted"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveNotes} disabled={savingNotes} className="bg-primary/90 hover:bg-primary shadow-sm flex items-center gap-2">
                  <Save className="w-4 h-4" /> {savingNotes ? 'Guardando...' : 'Guardar Notas'}
                </Button>
              </div>
            </div>
          </div>

          {/* Historial de Asistencia */}
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">Últimas Asistencias</h3>
            {profile.attendances && profile.attendances.length > 0 ? (
              <div className="grid gap-3">
                {profile.attendances.map((att: any) => (
                  <div key={att.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${att.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-sm">{att.meeting.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {new Date(att.meeting.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={att.status === 'PRESENT' ? 'default' : 'destructive'} className="shadow-sm">{att.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                No hay registros de asistencia para este joven.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
