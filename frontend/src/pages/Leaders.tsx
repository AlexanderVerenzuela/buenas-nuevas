import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { YouthTableClient } from '../components/modules/YouthTableClient';
import { YouthForm } from '../components/modules/YouthForm';

export default function Leaders() {
  const [leadersList, setLeadersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  const fetchLeaders = async () => {
    try {
      // Traemos a todos los jóvenes y filtramos a los líderes
      const data = await request('/youth');
      setLeadersList(data.filter((y: any) => y.status === 'LEADER'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await request(`/youth/${id}`, { method: 'DELETE' });
      setLeadersList(prev => prev.filter((y: any) => y.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleCreate = async (data: any) => {
    try {
      // Forzamos el estado a Líder si lo registran desde aquí
      const res = await request('/youth', {
        method: 'POST',
        body: JSON.stringify({ ...data, status: 'LEADER' })
      });
      setLeadersList([res.youth, ...leadersList]);
      return {};
    } catch (error: any) {
      return { error: error.message || "Error al crear" };
    }
  }

  if (loading) return <div className="text-muted-foreground p-8">Cargando líderes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Líderes</h2>
          <p className="text-sm text-muted-foreground">Listado de jóvenes con cargo de liderazgo.</p>
        </div>
        <YouthForm onSubmit={handleCreate} />
      </div>

      <YouthTableClient initialData={leadersList} onDelete={handleDelete} />
    </div>
  );
}
