import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ReportsPage() {
  // 1. Asistencia por reunión (Últimas 5)
  const recentMeetings = await prisma.meeting.findMany({
    orderBy: { date: "desc" },
    take: 5,
    include: {
      _count: { select: { attendances: { where: { status: "PRESENT" } } } }
    }
  })

  // 2. Jóvenes con racha de inasistencias (simplificado: faltaron a las últimas 2 registradas)
  // En un sistema real usaríamos una query SQL compleja o procesaríamos las asistencias. 
  // Aquí mostraremos los que están marcados como "INACTIVE" o "needsFollowUp"
  const inactiveOrAlertYouths = await prisma.youth.findMany({
    where: { 
      OR: [
        { status: "INACTIVE" },
        { needsFollowUp: true }
      ]
    },
    include: { leader: true }
  })

  // 3. Resumen de Seguimientos por Líder
  const leaderFollowUps = await prisma.leader.findMany({
    include: {
      _count: { select: { followUpsMade: true } }
    },
    orderBy: { firstName: 'asc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reportes</h2>
        <p className="text-sm text-muted-foreground">Métricas y análisis del ministerio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reporte: Asistencia por Reunión */}
        <Card>
          <CardHeader>
            <CardTitle>Asistencia: Últimas 5 Reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Asistentes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMeetings.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{m.date.toLocaleDateString()}</TableCell>
                    <TableCell>{m.title}</TableCell>
                    <TableCell className="text-right font-medium">{m._count.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Reporte: Trabajo de Líderes */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajo de Líderes (Seguimientos)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Líder</TableHead>
                  <TableHead className="text-right">Seguimientos Realizados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderFollowUps.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.firstName} {l.lastName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{l._count.followUpsMade}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jóvenes en Riesgo o Inactivos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joven</TableHead>
                <TableHead>Líder Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alerta Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveOrAlertYouths.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Ningún joven en riesgo.</TableCell>
                </TableRow>
              ) : (
                inactiveOrAlertYouths.map(y => (
                  <TableRow key={y.id}>
                    <TableCell className="font-medium">{y.firstName} {y.lastName}</TableCell>
                    <TableCell>{y.leader ? `${y.leader.firstName} ${y.leader.lastName}` : "-"}</TableCell>
                    <TableCell>
                      {y.status === "INACTIVE" ? <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge> : y.status}
                    </TableCell>
                    <TableCell>
                      {y.needsFollowUp ? <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-none">Urgente</Badge> : <span className="text-muted-foreground">Normal</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
