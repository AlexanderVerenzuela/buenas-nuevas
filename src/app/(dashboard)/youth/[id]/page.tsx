import { getYouthById, updateYouthNotes } from "@/actions/youth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Calendar, Phone, ArrowLeft, Save, Activity, CheckCircle2, XCircle } from "lucide-react"
import { EditYouthForm } from "@/components/modules/EditYouthForm"

export default async function YouthProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const youth = await getYouthById(resolvedParams.id)
  
  if (!youth) {
    notFound()
  }

  const statusColor = {
    VISITOR: "bg-accent text-muted-foreground",
    NEW: "bg-blue-500/20 text-blue-400 border-none",
    MEMBER: "bg-green-500/20 text-green-400 border-none",
    LEADER: "bg-purple-500/20 text-purple-400 border-none",
    INACTIVE: "bg-red-500/20 text-red-400 border-none",
    COMMISSION: "bg-orange-500/20 text-orange-400 border-none",
    PREACHING: "bg-cyan-500/20 text-cyan-400 border-none",
    FAMILY: "bg-yellow-500/20 text-yellow-400 border-none",
  }

  const statusLabel = {
    VISITOR: "Visita",
    NEW: "Nuevo",
    MEMBER: "Miembro",
    LEADER: "Líder",
    INACTIVE: "Inactivo",
    COMMISSION: "Comisión",
    PREACHING: "Prédica",
    FAMILY: "Familiar",
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/youth">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-card/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {youth.firstName} {youth.lastName}
              <Badge className={statusColor[youth.status] || "bg-accent"}>
                {statusLabel[youth.status] || youth.status}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Perfil del joven registrado desde {youth.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <EditYouthForm youth={youth} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna Izquierda: Info Personal */}
        <div className="space-y-6 md:col-span-1">
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {youth.phone ? (
                  <a href={`https://wa.me/51${youth.phone.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    {youth.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Sin teléfono</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {youth.birthDate ? (
                  <span>{youth.birthDate.toLocaleDateString()}</span>
                ) : (
                  <span className="text-muted-foreground">Sin cumpleaños</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle className="text-lg">Notas y Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateYouthNotes.bind(null, youth.id)} className="space-y-4">
                <textarea 
                  name="notes"
                  defaultValue={youth.observations || ""}
                  rows={4}
                  className="w-full rounded-md bg-accent/30 border border-white/5 p-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  placeholder="Escribe observaciones aquí..."
                />
                <Button type="submit" size="sm" className="w-full gap-2">
                  <Save className="h-4 w-4" /> Guardar Notas
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Actividad */}
        <div className="space-y-6 md:col-span-2">
          {/* Asistencias Recientes */}
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Asistencias Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {youth.attendances.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay registros de asistencia.</p>
              ) : (
                <ul className="space-y-3 mt-4">
                  {youth.attendances.map(att => (
                    <li key={att.id} className="flex justify-between items-center bg-accent/30 border border-white/5 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{att.meeting.title}</span>
                        <span className="text-xs text-muted-foreground">{att.meeting.date.toLocaleDateString()}</span>
                      </div>
                      <div>
                        {att.status === 'PRESENT' ? (
                          <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded-md text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Asistió
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded-md text-xs font-medium">
                            <XCircle className="h-3 w-3" /> Faltó
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Seguimientos Pastorales */}
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Últimos Seguimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {youth.followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay seguimientos registrados.</p>
              ) : (
                <ul className="space-y-4 mt-4">
                  {youth.followUps.map(fu => (
                    <li key={fu.id} className="border-l-2 border-primary/50 pl-4 py-1 relative">
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary" />
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-muted-foreground">{fu.createdAt.toLocaleDateString()}</span>
                        <Badge variant="outline" className="text-[10px] h-4 bg-accent">{fu.type}</Badge>
                      </div>
                      <p className="text-sm text-foreground mt-1">{fu.notes}</p>
                      <p className="text-xs text-muted-foreground mt-2">Por: {fu.leader.firstName}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
