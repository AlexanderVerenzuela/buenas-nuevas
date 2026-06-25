import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { MeetingForm } from '../components/modules/MeetingForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

const typeMap = {
  GENERAL: "General",
  DISCIPLESHIP: "Discipulado",
  CELL_GROUP: "Célula",
  SPECIAL_EVENT: "Evento Especial",
  CAMP: "Campamento",
}

const statusMap = {
  SCHEDULED: { label: "Programada", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completada", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-800" },
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

  if (loading) return <div>Cargando reuniones...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Reuniones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Programa y administra las reuniones de la juventud.</p>
        </div>
        <MeetingForm onSubmit={handleCreate} />
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asistencias</TableHead>
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
                return (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>
                      {typeMap[meeting.type as keyof typeof typeMap]}
                    </TableCell>
                    <TableCell>
                      {new Date(meeting.date).toLocaleDateString()} {meeting.time && `a las ${meeting.time}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={sMap.color}>
                        {sMap.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting._count?.attendances || 0} registros
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/meetings/${meeting.id}/attendance`}>
                        <Button variant="outline" size="sm" className="bg-card hover:bg-accent">Pasar Lista</Button>
                      </Link>
                      <MeetingForm onSubmit={(data) => handleEdit(meeting.id, data)} initialData={meeting} />
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(meeting.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
