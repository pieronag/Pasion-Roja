'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { usePosiciones } from '@/hooks/use-posiciones';
import { useEstadisticas } from '@/hooks/use-estadisticas';
import { SportIcon } from '@/components/shared/sport-icons';
import { LeagueTable } from '@/components/posiciones/league-table';
import { TopScorers } from '@/components/estadisticas/top-scorers';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Division } from '@/types/division';

export function DeportePageClient({ deporteId }: { deporteId: string }) {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const { tabla, loading: loadingPos } = usePosiciones(deporteId);
  const { rankings } = useEstadisticas(deporteId, 'goles');
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'divisiones'), where('deporteId', '==', deporteId));
    const unsub = onSnapshot(q, (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, [deporteId]);

  useEffect(() => {
    if (!selectedDivisionId && divisiones.length > 0) {
      setSelectedDivisionId(divisiones[0].id);
    }
  }, [divisiones, selectedDivisionId]);

  const selectedDivision = divisiones.find((d) => d.id === selectedDivisionId);

  const equiposFiltrados = selectedDivisionId
    ? tabla.filter((e) => {
        const equipo = equiposMap[e.equipoId];
        return equipo?.divisionId === selectedDivisionId;
      })
    : [];

  const equipoPrincipalId = selectedDivisionId
    ? Object.values(equiposMap).find((e) => e.divisionId === selectedDivisionId && e.esPrincipal)?.id
    : undefined;

  const deporte = deportes.find((d) => d.id === deporteId);

  if (!deporte) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  const bannerSrc = selectedDivision?.bannerBase64 || deporte.bannerBase64;

  return (
    <div className="pb-8">
      <div className={`relative ${bannerSrc ? 'h-48 md:h-64' : 'h-32'} bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)] flex items-end`}>
        {bannerSrc && (
          <img src={bannerSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-4 md:pb-6">
          <Link href="/deportes" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-2 bg-black/20 px-3 py-1 rounded-[var(--radius-sm)] backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" /> Todos los deportes
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <SportIcon sport={deporte.icono} size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-wide drop-shadow-lg">{deporte.nombre}</h1>
              {divisiones.length > 1 && (
                <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
                  <SelectTrigger className="w-64 mt-1 bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Seleccionar división" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisiones.map((div) => (
                      <SelectItem key={div.id} value={div.id}>{div.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Tabla de Posiciones</h2>
            </div>
            {loadingPos ? (
              <Loader size="sm" />
            ) : equiposFiltrados.length ? (
              <LeagueTable
                equipos={equiposFiltrados}
                ascensos={selectedDivision?.ascensos}
                descensos={selectedDivision?.descensos}
                liguillaDesde={selectedDivision?.puestosLiguillaDesde}
                liguillaHasta={selectedDivision?.puestosLiguillaHasta}
                tipoLiguilla={selectedDivision?.tipoLiguilla}
                promocionDesde={selectedDivision?.puestosPromocionDesde}
                promocionHasta={selectedDivision?.puestosPromocionHasta}
                equipoPrincipalId={equipoPrincipalId}
              />
            ) : (
              <EmptyState title="Sin datos" description="No hay partidos finalizados aún" />
            )}
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-lg font-bold text-[var(--text)]">Goleadores</h2>
              </div>
              {rankings.length ? <TopScorers rankings={rankings} statKey="goles" /> : <EmptyState title="Sin goleadores" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
