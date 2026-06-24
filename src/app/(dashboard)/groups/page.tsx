import { getGroups, deleteGroup } from "@/actions/groups"
import { prisma } from "@/lib/prisma"
import { GroupForm } from "@/components/modules/GroupForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function GroupsPage() {
  const groups = await getGroups()
  
  // Fetch líderes sin grupo asignado (para simplificar, traemos todos y dejamos que el usuario decida)
  // En un caso real, el líder tiene una restricción @unique en DiscipleshipGroup.leaderId 
  // por lo que debemos traer solo los líderes que no tengan grupo actualmente.
  const availableLeaders = await prisma.leader.findMany({
    where: { discipleshipGroup: null },
    select: { id: true, firstName: true, lastName: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Grupos de Discipulado</h2>
          <p className="text-sm text-muted-foreground">Administra los grupos pequeños y sus líderes.</p>
        </div>
        <GroupForm availableLeaders={availableLeaders} />
      </div>

      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Grupo</TableHead>
              <TableHead>Líder Principal</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Miembros</TableHead>
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
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    {group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : "Sin líder"}
                  </TableCell>
                  <TableCell>
                    {group.meetingDay && group.meetingTime 
                      ? `${group.meetingDay} - ${group.meetingTime}` 
                      : "-"}
                  </TableCell>
                  <TableCell>{group.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{group._count.members} jóvenes</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={async () => {
                      "use server"
                      await deleteGroup(group.id)
                    }}>
                      <button type="submit" className="text-sm text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </form>
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
