import { getFollowUps, deleteFollowUp } from "@/actions/followUps"
import { prisma } from "@/lib/prisma"
import { FollowUpForm } from "@/components/modules/FollowUpForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const typeMap = {
  CALL: "Llamada",
  IN_PERSON: "Presencial",
  WHATSAPP: "WhatsApp",
  COUNSELING: "Consejería",
  VISIT: "Visita",
  PRAYER: "Oración",
  OTHER: "Otro"
}

const priorityMap = {
  LOW: { label: "Baja", color: "bg-accent text-muted-foreground" },
  MEDIUM: { label: "Media", color: "bg-yellow-500/20 text-yellow-400" },
  HIGH: { label: "Alta", color: "bg-red-500/20 text-red-400" },
}

export default async function FollowUpsPage() {
  const followUps = await getFollowUps()
  
  const rawYouth = await prisma.youth.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: 'asc' }})
  const youthList = rawYouth.map(y => ({ id: y.id, name: `${y.firstName} ${y.lastName}` }))
  
  const rawLeaders = await prisma.leader.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: 'asc' }})
  const leaderList = rawLeaders.map(l => ({ id: l.id, name: `${l.firstName} ${l.lastName}` }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Seguimientos</h2>
          <p className="text-sm text-muted-foreground">Historial de cuidado pastoral y discipulado.</p>
        </div>
        <FollowUpForm youthList={youthList} leaderList={leaderList} />
      </div>

      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Joven</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followUps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No hay seguimientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              followUps.map((fu) => {
                const pMap = priorityMap[fu.priority as keyof typeof priorityMap]
                return (
                  <TableRow key={fu.id}>
                    <TableCell className="whitespace-nowrap">{fu.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{fu.youth.firstName} {fu.youth.lastName}</TableCell>
                    <TableCell>{fu.leader.firstName} {fu.leader.lastName}</TableCell>
                    <TableCell>{typeMap[fu.type as keyof typeof typeMap]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={pMap.color}>
                        {pMap.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={fu.notes}>
                      {fu.notes}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={async () => {
                        "use server"
                        await deleteFollowUp(fu.id)
                      }} className="inline">
                        <button type="submit" className="text-sm text-red-600 hover:underline">
                          Eliminar
                        </button>
                      </form>
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
