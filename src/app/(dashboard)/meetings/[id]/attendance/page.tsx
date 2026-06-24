import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AttendanceTableClient } from "@/components/modules/AttendanceTableClient"

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const meeting = await prisma.meeting.findUnique({
    where: { id: resolvedParams.id },
  })

  if (!meeting) return <div>Reunión no encontrada</div>

  const youthList = await prisma.youth.findMany({
    orderBy: { firstName: "asc" },
    include: {
      attendances: {
        where: { meetingId: resolvedParams.id }
      },
      group: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pasar Lista: {meeting.title}</h2>
          <p className="text-sm text-muted-foreground">{meeting.date.toLocaleDateString()}</p>
        </div>
        <Link href="/meetings">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      <AttendanceTableClient meetingId={meeting.id} initialYouthList={youthList} />
    </div>
  )
}
