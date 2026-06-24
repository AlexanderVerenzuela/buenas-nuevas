import { getLeaders } from "@/actions/leaders"
import { LeaderForm } from "@/components/modules/LeaderForm"
import { LeadersTableClient } from "@/components/modules/LeadersTableClient"

export default async function LeadersPage() {
  const leaders = await getLeaders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Equipo de Liderazgo</h2>
          <p className="text-sm text-muted-foreground">Administra el equipo de liderazgo y sus grupos.</p>
        </div>
        <LeaderForm />
      </div>

      <LeadersTableClient initialData={leaders} />
    </div>
  )
}
