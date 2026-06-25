"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowUpDown, Settings, ArrowUp, ArrowDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { normalizeText } from "@/lib/utils"

const statusMap = {
  VISITOR: { label: "Visita", color: "bg-accent text-muted-foreground" },
  NEW: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-none" },
  MEMBER: { label: "Miembro", color: "bg-green-500/20 text-green-400 border-none" },
  LEADER: { label: "Líder", color: "bg-purple-500/20 text-purple-400 border-none" },
  INACTIVE: { label: "Inactivo", color: "bg-red-500/20 text-red-400 border-none" },
  PREACHING: { label: "Prédica", color: "bg-cyan-500/20 text-cyan-400 border-none" },
  FAMILY: { label: "Familiar", color: "bg-yellow-500/20 text-yellow-400 border-none" },
}

const defaultStatusOrder = ["LEADER", "FAMILY", "MEMBER", "NEW", "VISITOR", "PREACHING", "INACTIVE"]

export function StatusOrderConfig({ order, setOrder }: { order: string[], setOrder: (o: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...order]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setOrder(newOrder)
  }
  const moveDown = (index: number) => {
    if (index === order.length - 1) return
    const newOrder = [...order]
    ;[newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]]
    setOrder(newOrder)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2 mb-4 bg-card" />}>
        <Settings className="h-4 w-4" /> Configurar Orden de Estados
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prioridad de Estados</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <p className="text-sm text-muted-foreground mb-4">Usa las flechas para ordenar qué estado tiene mayor prioridad en la tabla.</p>
          {order.map((statusKey, index) => {
            const info = statusMap[statusKey as keyof typeof statusMap]
            if (!info) return null
            return (
              <div key={statusKey} className="flex items-center justify-between p-2 border rounded-md">
                <Badge variant="secondary" className={info.color}>{info.label}</Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === order.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function YouthTableClient({ initialData, onDelete }: { initialData: any[], onDelete: (id: string) => void }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'status', direction: 'asc' })
  const [statusOrder, setStatusOrder] = useState<string[]>(defaultStatusOrder)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    if (!searchQuery) return initialData
    const lowerQuery = normalizeText(searchQuery)
    return initialData.filter(youth => {
      const fullName = normalizeText(`${youth.firstName} ${youth.lastName}`)
      const phone = youth.phone || ""
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
        } else if (sortConfig.key === 'leader') {
          aValue = a.leader ? `${a.leader.firstName} ${a.leader.lastName}` : 'Z' // Send empty to bottom
          bValue = b.leader ? `${b.leader.firstName} ${b.leader.lastName}` : 'Z'
        } else if (sortConfig.key === 'birthDate') {
          aValue = a.birthDate ? new Date(a.birthDate).getTime() : 0
          bValue = b.birthDate ? new Date(b.birthDate).getTime() : 0
        }

        if (sortConfig.key === 'status') {
          const aIndex = statusOrder.indexOf(a.status)
          const bIndex = statusOrder.indexOf(b.status)
          if (aIndex < bIndex) return sortConfig.direction === 'asc' ? -1 : 1
          if (aIndex > bIndex) return sortConfig.direction === 'asc' ? 1 : -1
          return 0
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
  }, [filteredData, sortConfig, statusOrder])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full sm:max-w-sm relative">
          <Input 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <StatusOrderConfig order={statusOrder} setOrder={setStatusOrder} />
      </div>
      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('name')}>
              <div className="flex items-center gap-2">Nombre Completo <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('status')}>
              <div className="flex items-center gap-2">Estado <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('birthDate')}>
              <div className="flex items-center gap-2">Cumpleaños <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => requestSort('leader')}>
              <div className="flex items-center gap-2">Líder Asignado <ArrowUpDown className="h-4 w-4" /></div>
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No hay jóvenes registrados.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((youth) => {
              const badgeInfo = statusMap[youth.status as keyof typeof statusMap] || statusMap.VISITOR
              return (
                <TableRow key={youth.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link to={`/youth/${youth.id}`} state={{ profile: youth }} className="hover:underline hover:text-primary transition-colors">
                      {youth.firstName} {youth.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={badgeInfo.color}>
                      {badgeInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{youth.phone || "-"}</TableCell>
                  <TableCell>{youth.birthDate ? new Date(youth.birthDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : "-"}</TableCell>
                  <TableCell>
                    {youth.leader ? `${youth.leader.firstName} ${youth.leader.lastName}` : <span className="text-muted-foreground">Sin asignar</span>}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Link to={`/youth/${youth.id}`} state={{ profile: youth }}>
                      <Button variant="outline" size="sm" className="bg-card hover:bg-accent hover:text-accent-foreground">Ver Perfil</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100" onClick={() => {
                      if(confirm("¿Estás seguro de eliminar a este joven?")) {
                        onDelete(youth.id)
                      }
                    }}>
                      Eliminar
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
