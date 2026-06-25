import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await request('/reports');
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div>Cargando reportes...</div>;
  if (!data) return <div>Error al cargar reportes.</div>;

  const { recentMeetings, inactiveOrAlertYouths } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reportes</h2>
        <p className="text-sm text-muted-foreground">Métricas y análisis del ministerio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia: Últimas 5 Reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Asistentes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMeetings.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                    <TableCell>{m.title}</TableCell>
                    <TableCell className="text-right font-medium">{m._count.attendances}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle>Estadísticas del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">Resumen de actividad.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jóvenes en Riesgo o Inactivos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joven</TableHead>
                <TableHead>Líder Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alerta Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveOrAlertYouths.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Ningún joven en riesgo.</TableCell>
                </TableRow>
              ) : (
                inactiveOrAlertYouths.map((y: any) => (
                  <TableRow key={y.id}>
                    <TableCell className="font-medium">{y.firstName} {y.lastName}</TableCell>
                    <TableCell>{y.leader ? `${y.leader.firstName} ${y.leader.lastName}` : "-"}</TableCell>
                    <TableCell>
                      {y.status === "INACTIVE" ? <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge> : y.status}
                    </TableCell>
                    <TableCell>
                      {y.needsFollowUp ? <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-none">Urgente</Badge> : <span className="text-muted-foreground">Normal</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
