'use client';

import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
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

  if (!deporte) return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 w-full rounded-[var(--radius)]" /></div>;

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className={`relative ${deporte.bannerBase64 ? 'h-48 md:h-64' : 'h-32'} bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)] flex items-end`}>
        {deporte.bannerBase64 && (
          <img src={deporte.bannerBase64} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-4 md:pb-6">
          <Link href="/deportes" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-2 bg-black/20 px-3 py-1 rounded-[var(--radius-sm)] backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" /> Todos los deportes
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <SportIcon sport={deporte.icono} size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-wide drop-shadow-lg">{deporte.nombre}</h1>
              <p className="text-white/70 text-sm">Sistema de puntos: {deporte.sistemaPuntos.victoria}-{deporte.sistemaPuntos.empate}-{deporte.sistemaPuntos.derrota}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3"><Trophy className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Tabla de Posiciones</h2></div>
            {loadingPos ? <Loader size="sm" /> : tabla.length ? <LeagueTable equipos={tabla} /> : <EmptyState title="Sin datos" description="No hay partidos finalizados aún" />}
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Goleadores</h2></div>
              {rankings.length ? <TopScorers rankings={rankings} statKey="goles" /> : <EmptyState title="Sin goleadores" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3"><Calendar className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Próximos Partidos</h2></div>
              {loadingPart ? <Loader size="sm" /> : partidos.length ? (
                <div className="space-y-2">{partidos.map((p) => <MatchCard key={p.id} partido={p} />)}</div>
              ) : <EmptyState title="Sin partidos" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
