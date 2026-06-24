"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Save } from "lucide-react"
import { AttendanceStatus } from "@prisma/client"
import { bulkSaveAttendance } from "@/actions/attendance"
import { normalizeText } from "@/lib/utils"

export function AttendanceTableClient({ 
  meetingId, 
  initialYouthList 
}: { 
  meetingId: string, 
  initialYouthList: any[] 
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [pending, setPending] = useState(false)
  
  // Estado local para inmediatez.
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const initialState: Record<string, AttendanceStatus> = {}
    initialYouthList.forEach(youth => {
      const att = youth.attendances[0]
      if (att) {
        initialState[youth.id] = att.status as AttendanceStatus
      }
    })
    return initialState
  })

  const filteredYouthList = useMemo(() => {
    if (!searchQuery) return initialYouthList
    const lowerQuery = normalizeText(searchQuery)
    return initialYouthList.filter(youth => {
      const fullName = normalizeText(`${youth.firstName} ${youth.lastName}`)
      return fullName.includes(lowerQuery)
    })
  }, [initialYouthList, searchQuery])

  const handleMark = (youthId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [youthId]: status
    }))
  }

  const handleBulkSave = async () => {
    try {
      setPending(true)
      const attendanceArray = Object.entries(localAttendance).map(([youthId, status]) => ({
        youthId,
        status
      }))
      
      await bulkSaveAttendance(meetingId, attendanceArray)
      
      // Actualizar estado local para reflejar que todos los no marcados ahora son Faltó
      const updatedState = { ...localAttendance }
      initialYouthList.forEach(youth => {
        if (!updatedState[youth.id]) {
          updatedState[youth.id] = AttendanceStatus.ABSENT
        }
      })
      setLocalAttendance(updatedState)
    } catch (error) {
      console.error(error)
      alert("Hubo un error al guardar. Asegúrate de haber reiniciado tu servidor (npm run dev) si te pedí hacerlo anteriormente.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:max-w-sm relative">
          <Input 
            placeholder="Buscar joven por nombre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={handleBulkSave} disabled={pending} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2">
          <Save className="h-4 w-4" />
          {pending ? "Guardando..." : "Guardar Asistencia"}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joven</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Estado Actual</TableHead>
              <TableHead className="text-right">Marcar Asistencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredYouthList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No se encontraron jóvenes con ese nombre.
                </TableCell>
              </TableRow>
            ) : (
              filteredYouthList.map((youth) => {
                const status = localAttendance[youth.id]
                
                return (
                  <TableRow key={youth.id}>
                    <TableCell className="font-medium">{youth.firstName} {youth.lastName}</TableCell>
                    <TableCell>{youth.group?.name || "-"}</TableCell>
                    <TableCell>
                      {status ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                          status === 'ABSENT' ? 'bg-red-500/20 text-red-400' : 
                          'bg-accent text-muted-foreground'
                        }`}>
                          {status === 'PRESENT' ? 'Asistió' : 
                           status === 'ABSENT' ? 'Faltó' : status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No registrado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant={status === 'PRESENT' ? 'default' : 'outline'} 
                        className={status === 'PRESENT' ? "bg-green-600 hover:bg-green-700 text-white" : "hover:bg-green-50"}
                        onClick={() => handleMark(youth.id, AttendanceStatus.PRESENT)}
                      >
                        Presente
                      </Button>
                      <Button 
                        size="sm" 
                        variant={status === 'ABSENT' ? 'default' : 'outline'} 
                        className={status === 'ABSENT' ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-red-50"}
                        onClick={() => handleMark(youth.id, AttendanceStatus.ABSENT)}
                      >
                        Faltó
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
