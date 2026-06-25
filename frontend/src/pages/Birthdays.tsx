import { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { Gift, CalendarDays, User, Cake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

function getNextBirthdayInfo(dateStr: string) {
  const [yyyy, mm, dd] = dateStr.split('T')[0].split('-');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bMonth = parseInt(mm) - 1;
  const bDay = parseInt(dd);

  let nextBday = new Date(today.getFullYear(), bMonth, bDay);
  let isToday = false;

  if (nextBday.getTime() === today.getTime()) {
    isToday = true;
  } else if (nextBday < today) {
    nextBday = new Date(today.getFullYear() + 1, bMonth, bDay);
  }

  const diffTime = nextBday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return { nextBday, diffDays, isToday, bMonth, bDay, originalYear: parseInt(yyyy) };
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Birthdays() {
  const [youthList, setYouthList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await request('/youth');
        setYouthList(data);
      } catch (error) {
        console.error("Error loading youth:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const birthdays = useMemo(() => {
    const withDates = youthList.filter(y => y.birthDate).map(y => {
      const info = getNextBirthdayInfo(y.birthDate);
      return { ...y, ...info };
    });

    // Sort by days remaining
    return withDates.sort((a, b) => a.diffDays - b.diffDays);
  }, [youthList]);

  const todayBirthdays = birthdays.filter(b => b.isToday);
  const upcomingBirthdays = birthdays.filter(b => !b.isToday && b.diffDays <= 30);
  const laterBirthdays = birthdays.filter(b => !b.isToday && b.diffDays > 30);

  // Group later birthdays by month (relative to now)
  const groupedLater = laterBirthdays.reduce((acc, curr) => {
    const month = curr.nextBday.getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {} as Record<number, typeof laterBirthdays>);

  if (loading) return <div className="p-8 text-muted-foreground">Cargando calendario...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary" /> Calendario de Cumpleaños
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Descubre quiénes están de fiesta próximamente.</p>
      </div>

      {/* Cumpleañeros de Hoy */}
      {todayBirthdays.length > 0 && (
        <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 shadow-lg shadow-primary/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cake className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 relative z-10">
            <Cake className="w-5 h-5" /> ¡Feliz Cumpleaños Hoy!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {todayBirthdays.map(b => (
              <BirthdayCard key={b.id} person={b} highlight />
            ))}
          </div>
        </div>
      )}

      {/* Próximos 30 días */}
      {upcomingBirthdays.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-white/10 pb-2">
            <CalendarDays className="w-5 h-5 text-blue-400" /> Próximos 30 días
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBirthdays.map(b => (
              <BirthdayCard key={b.id} person={b} />
            ))}
          </div>
        </div>
      )}

      {/* Resto del Año (Agrupado por Mes) */}
      <div className="space-y-8 mt-12">
        <h3 className="text-lg font-semibold text-foreground border-b border-white/10 pb-2">Más adelante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(groupedLater).sort((a, b) => {
            // Sort months starting from current month
            const currentMonth = new Date().getMonth();
            const aM = parseInt(a);
            const bM = parseInt(b);
            const aRel = aM >= currentMonth ? aM - currentMonth : aM + 12 - currentMonth;
            const bRel = bM >= currentMonth ? bM - currentMonth : bM + 12 - currentMonth;
            return aRel - bRel;
          }).map(monthKey => {
            const m = parseInt(monthKey);
            return (
              <div key={m} className="bg-card/30 border border-white/5 rounded-xl p-5 shadow-sm">
                <h4 className="font-medium text-lg text-primary mb-4">{months[m]}</h4>
                <div className="space-y-3">
                  {groupedLater[m].map(b => (
                    <div key={b.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-white/10">
                          {b.avatarUrl ? (
                            <img src={b.avatarUrl.startsWith('http') ? b.avatarUrl : `http://localhost:5000${b.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Link to={`/youth/${b.id}`} state={{ profile: b }} className="font-medium text-sm hover:underline hover:text-primary transition-colors">
                            {b.firstName} {b.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{b.bDay} de {months[b.bMonth]}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-background/50">Faltan {b.diffDays} días</Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function BirthdayCard({ person, highlight = false }: { person: any, highlight?: boolean }) {
  const ageTurns = new Date().getFullYear() - person.originalYear + (person.isToday || person.diffDays < 0 ? 0 : 1);
  // Wait, if it's today, they turn the age. If it's upcoming, they will turn the age.
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${highlight ? 'bg-background shadow-md' : 'bg-card border border-white/5 shadow-sm hover:shadow-md'}`}>
      <div className="w-14 h-14 rounded-full border-2 border-background shadow-sm overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
        {person.avatarUrl ? (
          <img src={person.avatarUrl.startsWith('http') ? person.avatarUrl : `http://localhost:5000${person.avatarUrl}`} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link to={`/youth/${person.id}`} state={{ profile: person }} className="font-bold text-foreground hover:underline hover:text-primary truncate block">
          {person.firstName} {person.lastName}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={highlight ? 'default' : 'secondary'} className={`text-xs ${highlight ? 'bg-primary text-primary-foreground' : 'bg-blue-500/10 text-blue-400'}`}>
            {person.isToday ? '¡Hoy!' : `En ${person.diffDays} días`}
          </Badge>
          <span className="text-xs text-muted-foreground">{person.bDay} {months[person.bMonth].slice(0,3)}</span>
        </div>
      </div>
    </div>
  );
}
