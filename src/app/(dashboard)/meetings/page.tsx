import { getMeetings, deleteMeeting } from "@/actions/meetings"
import { MeetingForm } from "@/components/modules/MeetingForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

export default async function MeetingsPage() {
  const meetings = await getMeetings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reuniones</h2>
          <p className="text-sm text-muted-foreground">Programa y administra las reuniones de la juventud.</p>
        </div>
        <MeetingForm />
      </div>

      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md">
        <Table>
          <TableHeader>
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
              meetings.map((meeting) => {
                const sMap = statusMap[meeting.status as keyof typeof statusMap]
                return (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>
                      {typeMap[meeting.type as keyof typeof typeMap]}
                    </TableCell>
                    <TableCell>
                      {meeting.date.toLocaleDateString()} {meeting.time && `a las ${meeting.time}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={sMap.color}>
                        {sMap.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting._count.attendances} registros
                    </TableCell>
                    <TableCell className="text-right space-x-4">
                      <Link href={`/meetings/${meeting.id}/attendance`} className="text-sm text-blue-600 hover:underline">
                        Pasar Lista
                      </Link>
                      <form action={async () => {
                        "use server"
                        await deleteMeeting(meeting.id)
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
