import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { GroupForm } from '../components/modules/GroupForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  const fetchInitialData = async () => {
    try {
      const [groupsData, leadersData] = await Promise.all([
        request('/groups'),
        request('/leaders')
      ]);
      setGroups(groupsData);
      
      // Filtrar líderes disponibles (los que no están asignados en el frontend para simplificar)
      // Idealmente el backend filtraría esto.
      const assignedIds = groupsData.map((g: any) => g.leaderId).filter(Boolean);
      const available = leadersData.filter((l: any) => !assignedIds.includes(l.id));
      setLeaders(available);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (id: string) => {
    if(confirm("¿Estás seguro de eliminar este grupo?")) {
      try {
        await request(`/groups/${id}`, { method: 'DELETE' });
        setGroups(prev => prev.filter((g: any) => g.id !== id));
      } catch (error) {
        alert("Error al eliminar grupo");
      }
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await request('/groups', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setGroups([res.group, ...groups]);
      // Remove leader from available leaders
      setLeaders(prev => prev.filter((l: any) => l.id !== data.leaderId));
      return true;
    } catch (error) {
      alert("Error al crear grupo");
      return false;
    }
  }

  if (loading) return <div>Cargando grupos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Grupos de Discipulado</h2>
          <p className="text-sm text-muted-foreground">Administra los grupos pequeños y sus líderes.</p>
        </div>
        <GroupForm availableLeaders={leaders} onSubmit={handleCreate} />
      </div>

      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Grupo</TableHead>
              <TableHead>Líder Principal</TableHead>
              <TableHead className="hidden sm:table-cell">Horario</TableHead>
              <TableHead className="hidden md:table-cell">Lugar</TableHead>
              <TableHead className="hidden lg:table-cell">Miembros</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No hay grupos registrados.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group: any) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    {group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : "Sin líder"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {group.meetingDay && group.meetingTime 
                      ? `${group.meetingDay} - ${group.meetingTime}` 
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{group.location || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{group._count?.members || 0} jóvenes</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => handleDelete(group.id)} className="text-sm text-red-600 hover:underline cursor-pointer">
                      Eliminar
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
