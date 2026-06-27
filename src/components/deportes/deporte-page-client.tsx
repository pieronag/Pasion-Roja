'use client';

import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { usePartidos } from '@/hooks/use-partidos';
import { useEstadisticas } from '@/hooks/use-estadisticas';
import { LeagueTable } from '@/components/posiciones/league-table';
import { TopScorers } from '@/components/estadisticas/top-scorers';
import { MatchCard } from '@/components/partidos/match-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { ArrowLeft, Trophy, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function DeportePageClient({ deporteId }: { deporteId: string }) {
  const { deportes } = useDeportes();
  const deporte = deportes.find((d) => d.id === deporteId);
  const { tabla, loading: loadingPos } = usePosiciones(deporteId);
  const { partidos, loading: loadingPart } = usePartidos({ deporteId, estado: 'programado', max: 5 });
  const { rankings } = useEstadisticas(deporteId, 'goles');

  if (!deporte) return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/deportes" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Todos los deportes
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{deporte.icono}</span>
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-display text-[var(--text)]">{deporte.nombre}</h1>
          <p className="text-[var(--text-secondary)] text-sm">Sistema de puntos: {deporte.sistemaPuntos.victoria}-{deporte.sistemaPuntos.empate}-{deporte.sistemaPuntos.derrota}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Tabla de Posiciones</h2>
          </div>
          {loadingPos ? <Loader size="sm" /> : tabla.length ? <LeagueTable equipos={tabla} /> : <EmptyState title="Sin datos" description="No hay partidos finalizados aún" />}
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Goleadores</h2>
            </div>
            {rankings.length ? <TopScorers rankings={rankings} statKey="goles" /> : <EmptyState title="Sin goleadores" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Próximos Partidos</h2>
            </div>
            {loadingPart ? <Loader size="sm" /> : partidos.length ? (
              <div className="space-y-2">{partidos.map((p) => <MatchCard key={p.id} partido={p} />)}</div>
            ) : <EmptyState title="Sin partidos" />}
          </div>
        </div>
      </div>
    </div>
  );
}
