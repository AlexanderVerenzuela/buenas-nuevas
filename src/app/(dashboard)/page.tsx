import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const session = await auth()

  // 1. Asistentes Última Reunión
  const lastMeeting = await prisma.meeting.findFirst({
    orderBy: { date: "desc" },
    include: { _count: { select: { attendances: { where: { status: "PRESENT" } } } } }
  })
  
  // 2. Nuevos del Mes
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const newYouths = await prisma.youth.count({
    where: { 
      status: "NEW",
      createdAt: { gte: startOfMonth }
    }
  })

  // 3. Seguimientos Pendientes (o urgentes)
  const pendingFollowUps = await prisma.followUp.count({
    where: { status: "PENDING" }
  })
  
  // 4. Jóvenes Activos totales
  const activeYouths = await prisma.youth.count({
    where: { isActive: true }
  })

  // 5. Requieren Seguimiento Urgente (jóvenes marcados)
  const urgentYouths = await prisma.youth.findMany({
    where: { needsFollowUp: true },
    select: { id: true, firstName: true, lastName: true },
    take: 5
  })

  // 6. Actividad Reciente (últimos 5 seguimientos)
  const recentFollowUps = await prisma.followUp.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { youth: true, leader: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Hola, {session?.user?.name || "Usuario"}! 👋</h1>
        <p className="text-muted-foreground">Este es un resumen del estado de tu ministerio juvenil.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Reunión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{lastMeeting?._count.attendances || 0}</div>
            <p className="text-xs text-muted-foreground truncate">{lastMeeting?.title || "Sin datos"}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{newYouths}</div>
            <p className="text-xs text-muted-foreground">Jóvenes con estado Nuevo</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seguimientos Pend.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jóvenes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeYouths}</div>
            <p className="text-xs text-muted-foreground">En todo el sistema</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle>Requieren Seguimiento Urgente</CardTitle>
          </CardHeader>
          <CardContent>
            {urgentYouths.length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-8">No hay jóvenes con alerta prioritaria.</p>
            ) : (
              <ul className="space-y-3">
                {urgentYouths.map(y => (
                  <li key={y.id} className="flex justify-between items-center bg-accent/30 border border-white/5 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="font-medium text-sm text-foreground">{y.firstName} {y.lastName}</span>
                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-none">Alerta</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle>Actividad Pastoral Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFollowUps.length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-8">No hay seguimientos recientes.</p>
            ) : (
              <ul className="space-y-4">
                {recentFollowUps.map(fu => (
                  <li key={fu.id} className="border-b border-border/50 pb-3 last:border-0 hover:bg-accent/10 p-2 rounded-lg transition-colors -mx-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-foreground">{fu.youth.firstName} {fu.youth.lastName}</span>
                      <span className="text-xs text-muted-foreground">{fu.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80">Atendido por: <span className="text-foreground/80 font-medium">{fu.leader.firstName}</span></p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
