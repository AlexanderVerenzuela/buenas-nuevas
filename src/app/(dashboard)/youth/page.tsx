import { getYouth, deleteYouth } from "@/actions/youth"
import { YouthForm } from "@/components/modules/YouthForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { YouthTableClient } from "@/components/modules/YouthTableClient"

const statusMap = {
  VISITOR: { label: "Visita", color: "bg-accent text-muted-foreground" },
  NEW: { label: "Nuevo", color: "bg-blue-500/20 text-blue-400 border-none" },
  MEMBER: { label: "Miembro", color: "bg-green-500/20 text-green-400 border-none" },
  LEADER: { label: "Líder", color: "bg-purple-500/20 text-purple-400 border-none" },
  INACTIVE: { label: "Inactivo", color: "bg-red-500/20 text-red-400 border-none" },
  PREACHING: { label: "Prédica", color: "bg-cyan-500/20 text-cyan-400 border-none" },
  FAMILY: { label: "Familiar", color: "bg-yellow-500/20 text-yellow-400 border-none" },
}

export default async function YouthPage() {
  const youthList = await getYouth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Jóvenes</h2>
          <p className="text-sm text-muted-foreground">Administra el listado de personas de la juventud.</p>
        </div>
        <YouthForm />
      </div>

      <YouthTableClient initialData={youthList} />
    </div>
  )
}
