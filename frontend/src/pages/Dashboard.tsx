import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function Dashboard() {
  const [stats, setStats] = useState({ youth: 0, leaders: 0, groups: 0, meetings: 0 });
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  useEffect(() => {
    async function loadStats() {
      try {
        const [youthRes, groupsRes, meetingsRes] = await Promise.all([
          request('/youth'),
          request('/groups'),
          request('/meetings')
        ]);
        
        setStats({
          youth: youthRes.length,
          leaders: youthRes.filter((y: any) => y.status === 'LEADER').length,
          groups: groupsRes.length,
          meetings: meetingsRes.length
        });
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel Principal</h2>
        <p className="text-muted-foreground mt-2">
          Bienvenido al sistema de administración.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium">Total Jóvenes</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "..." : stats.youth}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium">Líderes Activos</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "..." : stats.leaders}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium">Grupos Pequeños</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "..." : stats.groups}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium">Reuniones Registradas</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "..." : stats.meetings}</p>
        </div>
      </div>
    </div>
  )
}
