'use client';

import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { useNoticias } from '@/hooks/use-noticias';
import { usePartidos } from '@/hooks/use-partidos';
import { useSponsors } from '@/hooks/use-sponsors';
import { useJugadores } from '@/hooks/use-jugadores';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, Shield, Users, Swords, Newspaper, HeartHandshake, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { deportes } = useDeportes();
  const { equipos } = useEquipos();
  const { jugadores } = useJugadores();
  const { noticias } = useNoticias(100);
  const { partidos } = usePartidos({ max: 100 });
  const { sponsors } = useSponsors();

  const enVivo = partidos.filter((p) => p.estado === 'en_vivo').length;
  const proximos = partidos.filter((p) => p.estado === 'programado').length;
  const finalizados = partidos.filter((p) => p.estado === 'finalizado').length;

  const metrics = [
    { label: 'Deportes', value: deportes.length, icon: Trophy, href: '/admin/deportes', color: 'from-orange-500 to-orange-600' },
    { label: 'Equipos', value: equipos.length, icon: Shield, href: '/admin/equipos', color: 'from-blue-500 to-blue-600' },
    { label: 'Jugadores', value: jugadores.length, icon: Users, href: '/admin/jugadores', color: 'from-green-500 to-green-600' },
    { label: 'Partidos', value: partidos.length, icon: Swords, href: '/admin/partidos', color: 'from-red-500 to-red-600' },
    { label: 'Noticias', value: noticias.length, icon: Newspaper, href: '/admin/noticias', color: 'from-purple-500 to-purple-600' },
    { label: 'Sponsors', value: sponsors.length, icon: HeartHandshake, href: '/admin/sponsors', color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Panel de Control</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Bienvenido al panel de administración de Pasión Roja</p>
      </div>

      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.href} className="block">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-all overflow-hidden group">
                <div className={`bg-gradient-to-r ${m.color} p-3 flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--text)]">{m.value}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-sm font-semibold text-[var(--text)]">Estado de Partidos</h3></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-sm font-medium text-[var(--text)]">🔴 En Vivo</span>
              <span className="text-lg font-bold text-red-500">{enVivo}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm font-medium text-[var(--text)]">📅 Próximos</span>
              <span className="text-lg font-bold text-blue-500">{proximos}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-sm font-medium text-[var(--text)]">✅ Finalizados</span>
              <span className="text-lg font-bold text-green-500">{finalizados}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[var(--accent)]" /><h3 className="text-sm font-semibold text-[var(--text)]">Acceso Rápido</h3></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nuevo Equipo', href: '/admin/equipos', icon: Shield },
                { label: 'Nuevo Jugador', href: '/admin/jugadores', icon: Users },
                { label: 'Nuevo Partido', href: '/admin/partidos', icon: Swords },
                { label: 'Nueva Noticia', href: '/admin/noticias', icon: Newspaper },
                { label: 'Nuevo Sponsor', href: '/admin/sponsors', icon: HeartHandshake },
                { label: 'Nuevo Programa', href: '/admin/programacion', icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {enVivo > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <p className="text-sm font-medium text-[var(--text)]">{enVivo} partido(s) en vivo — <Link href="/admin/partidos" className="text-[var(--accent)] hover:underline">Ir a partidos</Link></p>
        </div>
      )}
    </div>
  );
}
