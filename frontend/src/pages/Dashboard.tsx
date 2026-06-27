import { Link } from 'react-router-dom';
import { Users, Users2, CalendarDays, Gift, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const shortcuts = [
    {
      title: "Jóvenes",
      description: "Administra y registra los jóvenes de la iglesia.",
      href: "/youth",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400",
      iconBg: "bg-blue-500/20"
    },
    {
      title: "Discipulado",
      description: "Organiza las mentorías y los jóvenes a cargo de cada líder.",
      href: "/groups",
      icon: Users2,
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 text-purple-400",
      iconBg: "bg-purple-500/20"
    },
    {
      title: "Reuniones",
      description: "Registra la asistencia y fotos de cada reunión semanal.",
      href: "/meetings",
      icon: CalendarDays,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400",
      iconBg: "bg-emerald-500/20"
    },
    {
      title: "Cumpleaños",
      description: "Mira quiénes celebran este mes y programa felicitaciones.",
      href: "/birthdays",
      icon: Gift,
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 text-amber-400",
      iconBg: "bg-amber-500/20"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/40 via-card/50 to-purple-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" /> Portal de Buenas Nuevas
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ¡Hola, {user?.name || "de nuevo"}!
            </h2>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-lg border border-white/5 p-3 rounded-xl shadow-xl flex-shrink-0 w-fit">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-medium">Estado General</span>
              <span className="text-xs font-bold text-emerald-400">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 mb-1">Accesos Rápidos</h3>
          <p className="text-xs text-muted-foreground px-1">Navega a las diferentes herramientas del panel de administración.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link 
                key={shortcut.title} 
                to={shortcut.href}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border bg-gradient-to-br ${shortcut.color} backdrop-blur-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${shortcut.iconBg} flex items-center justify-center text-current shadow-inner`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-white/15 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 space-y-1">
                  <h4 className="text-lg font-bold text-foreground group-hover:text-white transition-colors">
                    {shortcut.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {shortcut.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
