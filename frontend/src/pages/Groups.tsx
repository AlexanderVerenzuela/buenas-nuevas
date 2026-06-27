"use client"

import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { GroupForm } from '../components/modules/GroupForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, X } from "lucide-react"
import { getImageUrl } from '../lib/utils';

export default function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [allYouths, setAllYouths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningGroup, setAssigningGroup] = useState<any>(null);
  const [selectedYouthIds, setSelectedYouthIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingMembers, setPendingMembers] = useState(false);
  
  const { request } = useApi();

  const fetchInitialData = async () => {
    try {
      const [groupsData, leadersData, youthsData] = await Promise.all([
        request('/groups'),
        request('/leaders'),
        request('/youth')
      ]);
      setGroups(groupsData || []);
      setAllYouths(youthsData || []);
      
      // Filtrar líderes que no tienen un grupo asignado aún
      const assignedIds = (groupsData || []).map((g: any) => g.leaderId).filter(Boolean);
      const available = (leadersData || []).filter((l: any) => !assignedIds.includes(l.id));
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
    if(confirm("¿Estás seguro de eliminar este grupo de discipulado? Los jóvenes quedarán sin líder asignado.")) {
      try {
        await request(`/groups/${id}`, { method: 'DELETE' });
        // Recargar para sincronizar líderes disponibles
        await fetchInitialData();
      } catch (error) {
        alert("Error al eliminar grupo");
      }
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await request('/groups', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      // Recargar datos
      await fetchInitialData();
      return true;
    } catch (error) {
      alert("Error al crear grupo");
      return false;
    }
  }

  const handleOpenAssignModal = (group: any) => {
    setAssigningGroup(group);
    setSelectedYouthIds(group.members.map((m: any) => m.id));
    setSearchQuery("");
  };

  const toggleYouthSelection = (youthId: string) => {
    setSelectedYouthIds(prev => 
      prev.includes(youthId) 
        ? prev.filter(id => id !== youthId) 
        : [...prev, youthId]
    );
  };

  const handleSaveMembers = async () => {
    if (!assigningGroup) return;
    setPendingMembers(true);
    try {
      await request(`/groups/${assigningGroup.id}/members`, {
        method: 'PUT',
        body: JSON.stringify({ youthIds: selectedYouthIds })
      });
      setAssigningGroup(null);
      await fetchInitialData();
    } catch (error) {
      alert("Error al asignar jóvenes");
    } finally {
      setPendingMembers(false);
    }
  };

  // Filtrar la lista de jóvenes por búsqueda
  const filteredYouths = allYouths.filter(y => {
    const fullName = `${y.firstName} ${y.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

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
            Discipulado
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Asigna líderes de discipulado y administra qué jóvenes están bajo su acompañamiento.</p>
        </div>
        <GroupForm availableLeaders={leaders} onSubmit={handleCreate} />
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Líder Principal</TableHead>
              <TableHead>Jóvenes Asignados</TableHead>
              <TableHead className="w-[120px] text-center">Total Jóvenes</TableHead>
              <TableHead className="text-right w-[200px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No hay líderes de discipulado asignados.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group: any) => (
                <TableRow key={group.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Avatar del Líder */}
                      {group.leader?.avatarUrl || group.leader?.youthId ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-muted">
                          {/* Buscamos el avatar del líder vinculándolo con su perfil de joven si existe */}
                          {(() => {
                            const leaderYouth = allYouths.find(y => y.id === group.leader.youthId);
                            const avatar = leaderYouth?.avatarUrl || group.leader.avatarUrl;
                            return avatar ? (
                              <img src={getImageUrl(avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-bold uppercase text-xs">
                                {group.leader.firstName[0]}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase text-xs">
                          {group.leader ? group.leader.firstName[0] : "?"}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-foreground block">
                          {group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : "Sin líder"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Líder</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                      {group.members && group.members.length > 0 ? (
                        group.members.map((member: any) => (
                          <Badge key={member.id} variant="secondary" className="bg-muted/50 text-foreground border-white/5 py-0.5 px-2 text-xs">
                            {member.firstName} {member.lastName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Ningún joven asignado</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={group.members?.length > 0 ? "default" : "outline"} className="shadow-sm">
                      {group.members?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleOpenAssignModal(group)} 
                        className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1 bg-primary/10 hover:bg-primary/20 py-1 px-2.5 rounded-lg border border-primary/20 transition-all"
                      >
                        <Users className="w-3 h-3" /> Asignar Jóvenes
                      </button>
                      <button 
                        onClick={() => handleDelete(group.id)} 
                        className="text-xs font-medium text-red-400 hover:text-red-500 hover:bg-red-500/10 py-1 px-2.5 rounded-lg cursor-pointer transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para asignar jóvenes a un líder */}
      {assigningGroup && (
        <Dialog open={!!assigningGroup} onOpenChange={(open) => !open && setAssigningGroup(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[85vh] flex flex-col border-border/50 bg-card/95 backdrop-blur-xl rounded-2xl p-6 overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Asignar Jóvenes a {assigningGroup.leader ? `${assigningGroup.leader.firstName} ${assigningGroup.leader.lastName}` : "Líder"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Selecciona los jóvenes de los cuales este líder será mentor.</p>
            </DialogHeader>

            {/* Barra de búsqueda */}
            <div className="relative mt-4 flex-shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar joven por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 p-0.5 hover:bg-muted rounded-full">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Lista de jóvenes con scroll */}
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[40vh] my-4 pr-1 scrollbar-thin space-y-1">
              {filteredYouths.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No se encontraron jóvenes con ese nombre.
                </div>
              ) : (
                filteredYouths.map((youth) => {
                  const isSelected = selectedYouthIds.includes(youth.id);
                  return (
                    <div 
                      key={youth.id} 
                      onClick={() => toggleYouthSelection(youth.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/20 text-foreground' 
                          : 'bg-muted/10 border-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5 flex-shrink-0 bg-muted">
                          {youth.avatarUrl ? (
                            <img src={getImageUrl(youth.avatarUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-bold uppercase text-[10px]">
                              {youth.firstName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{youth.firstName} {youth.lastName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Estado: {youth.status}</p>
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-border bg-background'
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer con estadísticas y botones */}
            <DialogFooter className="flex-shrink-0 pt-2 border-t border-white/5 flex items-center justify-between sm:justify-between w-full">
              <div className="text-xs text-muted-foreground font-medium">
                {selectedYouthIds.length} {selectedYouthIds.length === 1 ? 'joven seleccionado' : 'jóvenes seleccionados'}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setAssigningGroup(null)}>Cancelar</Button>
                <Button 
                  type="button" 
                  disabled={pendingMembers} 
                  onClick={handleSaveMembers}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl cursor-pointer"
                >
                  {pendingMembers ? "Guardando..." : "Guardar Asignación"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
