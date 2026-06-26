"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Search, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { normalizeText, getImageUrl } from "@/lib/utils"

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

export function YouthTableClient({ initialData, onDelete }: { initialData: any[], onDelete: (id: string) => void }) {
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
    const sortableItems = [...filteredData]
    sortableItems.sort((a, b) => {
      const aIndex = defaultStatusOrder.indexOf(a.status)
      const bIndex = defaultStatusOrder.indexOf(b.status)
      if (aIndex < bIndex) return -1
      if (aIndex > bIndex) return 1
      
      // Same status -> sort alphabetically by full name
      const aName = normalizeText(`${a.firstName} ${a.lastName}`)
      const bName = normalizeText(`${b.firstName} ${b.lastName}`)
      return aName.localeCompare(bName)
    })
    return sortableItems
  }, [filteredData])

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
      </div>
      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
            <TableHead className="hidden md:table-cell">Cumpleaños</TableHead>
            <TableHead className="hidden lg:table-cell">Líder Asignado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No hay jóvenes registrados.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((youth) => {
              const badgeInfo = statusMap[youth.status as keyof typeof statusMap] || statusMap.VISITOR
              return (
                <TableRow key={youth.id}>
                  <TableCell className="font-medium text-foreground py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-white/10 flex-shrink-0">
                        {getImageUrl(youth.avatarUrl) ? (
                          <img src={getImageUrl(youth.avatarUrl)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 text-xs font-bold uppercase">
                            {youth.firstName[0]}
                            {youth.lastName ? youth.lastName[0] : ''}
                          </div>
                        )}
                      </div>
                      <Link to={`/youth/${youth.id}`} state={{ profile: youth }} className="hover:underline hover:text-primary transition-colors truncate block max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                        {youth.firstName} {youth.lastName}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={badgeInfo.color}>
                      {badgeInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{youth.phone || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{youth.birthDate ? youth.birthDate.split('T')[0].split('-').reverse().join('/') : "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {youth.leader ? `${youth.leader.firstName} ${youth.leader.lastName}` : <span className="text-muted-foreground">Sin asignar</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="h-7 w-7" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <Link to={`/youth/${youth.id}`} state={{ profile: youth }}>
                          <DropdownMenuItem className="cursor-pointer">
                            Ver Perfil
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          onClick={() => {
                            if(confirm("¿Estás seguro de eliminar a este joven?")) {
                              onDelete(youth.id)
                            }
                          }}
                          className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
