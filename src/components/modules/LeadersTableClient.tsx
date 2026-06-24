"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteLeader } from "@/actions/leaders"
import { ArrowUpDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { normalizeText } from "@/lib/utils"
import { EditLeaderForm } from "@/components/modules/EditLeaderForm"

export function LeadersTableClient({ initialData }: { initialData: any[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    if (!searchQuery) return initialData
    const lowerQuery = normalizeText(searchQuery)
    return initialData.filter(leader => {
      const fullName = normalizeText(`${leader.firstName} ${leader.lastName}`)
      const phone = leader.phone || ""
      return fullName.includes(lowerQuery) || phone.includes(lowerQuery)
    })
  }, [initialData, searchQuery])

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || ""
        let bValue = b[sortConfig.key] || ""

        if (sortConfig.key === 'name') {
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
        } else if (sortConfig.key === 'group') {
          aValue = a.discipleshipGroup ? a.discipleshipGroup.name : 'Z'
          bValue = b.discipleshipGroup ? b.discipleshipGroup.name : 'Z'
        } else if (sortConfig.key === 'youthCount') {
          aValue = a._count.assignedYouth
          bValue = b._count.assignedYouth
        } else if (sortConfig.key === 'birthDate') {
          aValue = a.birthDate ? new Date(a.birthDate).getTime() : 0
          bValue = b.birthDate ? new Date(b.birthDate).getTime() : 0
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const normA = normalizeText(aValue)
          const normB = normalizeText(bValue)
          const comparison = normA.localeCompare(normB)
          return sortConfig.direction === 'asc' ? comparison : -comparison
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [filteredData, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <div className="w-full sm:max-w-sm relative">
          <Input 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="rounded-md border border-border bg-card/50 backdrop-blur-md">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('name')}>
              <div className="flex items-center gap-2">Nombre <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('group')}>
              <div className="flex items-center gap-2">Grupo de Discipulado <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('youthCount')}>
              <div className="flex items-center gap-2">Jóvenes a Cargo <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('birthDate')}>
              <div className="flex items-center gap-2">Cumpleaños <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('isActive')}>
              <div className="flex items-center gap-2">Estado <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No hay líderes registrados.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((leader) => (
              <TableRow key={leader.id}>
                <TableCell className="font-medium">
                  {leader.firstName} {leader.lastName}
                </TableCell>
                <TableCell>
                  {leader.discipleshipGroup ? leader.discipleshipGroup.name : <span className="text-muted-foreground">Sin grupo</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{leader._count.assignedYouth} jóvenes</Badge>
                </TableCell>
                <TableCell>{leader.phone || "-"}</TableCell>
                <TableCell>{leader.birthDate ? new Date(leader.birthDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : "-"}</TableCell>
                <TableCell>
                  {leader.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  <EditLeaderForm leader={leader} />
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100" onClick={async () => {
                    if (confirm("¿Estás seguro de eliminar a este líder?")) {
                      await deleteLeader(leader.id)
                    }
                  }}>
                    Eliminar
                  </Button>
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
