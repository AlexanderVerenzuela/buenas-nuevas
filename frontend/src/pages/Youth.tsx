import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { YouthTableClient } from '../components/modules/YouthTableClient';
import { YouthForm } from '../components/modules/YouthForm';

export default function Youth() {
  const [youthList, setYouthList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  const fetchYouth = async () => {
    try {
      const data = await request('/youth');
      setYouthList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYouth();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await request(`/youth/${id}`, { method: 'DELETE' });
      setYouthList(prev => prev.filter((y: any) => y.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await request('/youth', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setYouthList([res.youth, ...youthList]);
      return {};
    } catch (error: any) {
      return { error: error.message || "Error al crear" };
    }
  }

  if (loading) return <div>Cargando jóvenes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Jóvenes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Administra el listado de personas de la juventud.</p>
        </div>
        <YouthForm onSubmit={handleCreate} />
      </div>

      <YouthTableClient initialData={youthList} onDelete={handleDelete} />
    </div>
  );
}
