'use client';

import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { useNoticias } from '@/hooks/use-noticias';
import { usePartidos } from '@/hooks/use-partidos';
import { useSponsors } from '@/hooks/use-sponsors';
import { useJugadores } from '@/hooks/use-jugadores';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, Shield, Users, Swords, Newspaper, HeartHandshake, TrendingUp, Activity, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const { deportes } = useDeportes();
  const { equipos } = useEquipos();
  const { jugadores } = useJugadores();
  const { noticias } = useNoticias(100);
  const { partidos } = usePartidos({ max: 100 });
  const { sponsors } = useSponsors();

  const enVivo = partidos.filter((p) => p.estado === 'en_vivo');
  const proximos = partidos.filter((p) => p.estado === 'programado');
  const finalizados = partidos.filter((p) => p.estado === 'finalizado');

  const metrics = [
    { label: 'Deportes', value: deportes.length, icon: Trophy, href: '/admin/deportes', gradient: 'from-orange-500 to-orange-600' },
    { label: 'Equipos', value: equipos.length, icon: Shield, href: '/admin/equipos', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Jugadores', value: jugadores.length, icon: Users, href: '/admin/jugadores', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Partidos', value: partidos.length, icon: Swords, href: '/admin/partidos', gradient: 'from-red-500 to-red-600' },
    { label: 'Noticias', value: noticias.length, icon: Newspaper, href: '/admin/noticias', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Sponsors', value: sponsors.length, icon: HeartHandshake, href: '/admin/sponsors', gradient: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">Panel de Control</h2>
        <p className="text-sm text-[var(--text-secondary)]">Bienvenido al panel de administración</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* En Vivo Alert */}
      {enVivo.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-[var(--radius)] bg-red-500/10 border border-red-500/20">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>
          <p className="text-sm font-medium text-[var(--text)]">{enVivo.length} partido(s) en vivo ahora — <Link href="/admin/partidos" className="text-[var(--accent)] hover:underline">Ir a partidos →</Link></p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Últimos Partidos */}
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Swords className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-sm font-semibold text-[var(--text)]">Últimos Partidos</h3></div>
              <Link href="/admin/partidos" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">Ver todos <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {partidos.slice(0, 5).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                      <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase w-14">Jornada</th>
                      <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Partido</th>
                      <th className="text-center p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Resultado</th>
                      <th className="text-center p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Estado</th>
                      <th className="text-right p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidos.slice(0, 5).map((p) => (
                      <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="p-3 text-sm font-mono text-[var(--text-muted)]">{p.jornada}</td>
                        <td className="p-3"><div className="flex items-center gap-2"><span className="text-sm font-medium text-[var(--text)]">{p.equipoLocalNombre}</span><span className="text-xs text-[var(--text-muted)]">vs</span><span className="text-sm font-medium text-[var(--text)]">{p.equipoVisitaNombre}</span></div></td>
                        <td className="p-3 text-center"><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorLocal}</span><span className="text-[var(--text-muted)] mx-0.5">-</span><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorVisita}</span></td>
                        <td className="p-3 text-center"><StatusBadge status={p.estado === 'en_vivo' ? 'error' : p.estado === 'finalizado' ? 'success' : 'neutral'} label={p.estado === 'en_vivo' ? 'En Vivo' : p.estado === 'finalizado' ? 'Finalizado' : 'Programado'} /></td>
                        <td className="p-3 text-right text-xs text-[var(--text-muted)]">{format(p.fecha, 'dd MMM', { locale: es })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">No hay partidos registrados</div>
            )}
          </CardContent>
        </Card>

        {/* Estado General */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-600" />
          <CardHeader>
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-sm font-semibold text-[var(--text)]">Estado General</h3></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm text-[var(--text)]">Finalizados</span></div>
              <span className="text-lg font-bold text-emerald-500">{finalizados.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-sm text-[var(--text)]">Programados</span></div>
              <span className="text-lg font-bold text-blue-500">{proximos.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-sm text-[var(--text)]">En Vivo</span></div>
              <span className="text-lg font-bold text-red-500">{enVivo.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
