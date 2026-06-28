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
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { ArrowLeft, Trophy, TrendingUp, Shield, Medal, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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

  const selectedDivision = divisiones.find((d) => d.id === selectedDivisionId);
  const deporte = deportes.find((d) => d.id === deporteId);

  const equiposFiltrados = selectedDivisionId
    ? tabla.filter((e) => equiposMap[e.equipoId]?.divisionId === selectedDivisionId)
    : [];

  const equipoPrincipalId = selectedDivisionId
    ? Object.values(equiposMap).find((e) => e.divisionId === selectedDivisionId && e.esPrincipal)?.id
    : undefined;

  if (!deporte) {
    return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 w-full rounded-[var(--radius)]" /></div>;
  }

  const bannerSrc = selectedDivision?.bannerBase64 || deporte.bannerBase64;

  return (
    <div className="pb-8">
      {/* Hero Banner */}
      <div className={`relative ${bannerSrc || selectedDivision ? 'h-44 md:h-56' : 'h-28'} bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)] flex items-end`}>
        {(bannerSrc) && <img src={bannerSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-4">
          <Link href="/deportes" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mb-2 bg-black/20 px-2.5 py-1 rounded-[var(--radius-sm)] backdrop-blur-sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Todos los deportes
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <SportIcon sport={deporte.icono} size={24} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black font-display text-white uppercase tracking-wide drop-shadow-lg">{deporte.nombre}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Division Cards */}
        {divisiones.length > 0 && !selectedDivisionId && (
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Selecciona una división</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {divisiones.map((div) => {
                const principalTeamId = Object.values(equiposMap).find(e => e.divisionId === div.id && e.esPrincipal)?.id;
                const equiposCount = Object.values(equiposMap).filter(e => e.divisionId === div.id).length;
                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    className="text-left p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all group"
                  >
                    {div.bannerBase64 && (
                      <div className="h-16 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-[var(--radius)]">
                        <img src={div.bannerBase64} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{div.nombre}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Temporada {div.temporada}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{equiposCount} equipos</span>
                      <span>📅 {div.totalJornadas || 30} jornadas</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {div.ascensos > 0 && <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">↑ Ascenso: {div.ascensos}</span>}
                      {div.descensos > 0 && <span className="text-[10px] font-medium text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full">↓ Descenso: {div.descensos}</span>}
                      {div.tipoLiguilla !== 'none' && <span className="text-[10px] font-medium text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded-full">{div.tipoLiguilla === 'cuadrangular' ? '🏆 Cuadrangular' : '📊 Liguilla'}</span>}
                      {principalTeamId && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Division Detail */}
        {selectedDivision && (
          <>
            {/* Back + Title */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <button onClick={() => setSelectedDivisionId('')} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1 mb-1 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> {deporte.nombre} / Divisiones
                </button>
                <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
                  {selectedDivision.nombre}
                  <span className="text-xs font-normal text-[var(--text-muted)]">{selectedDivision.temporada}</span>
                </h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedDivision.ascensos > 0 && <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">↑ Asc {selectedDivision.ascensos}</span>}
                {selectedDivision.descensos > 0 && <span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-full">↓ Desc {selectedDivision.descensos}</span>}
                {selectedDivision.tipoLiguilla !== 'none' && <span className="text-xs font-medium text-sky-600 bg-sky-500/10 px-2 py-1 rounded-full">{selectedDivision.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}</span>}
                {selectedDivision.tipoPromocion === 'promocion' && <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">↕ Promoción ({selectedDivision.puestosPromocionDesde}-{selectedDivision.puestosPromocionHasta})</span>}
              </div>
            </div>

            {/* Standings + Scorers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5 text-[var(--accent)]" />
                  <h3 className="text-lg font-bold text-[var(--text)]">Tabla de Posiciones</h3>
                </div>
                {loadingPos ? <Loader size="sm" /> : equiposFiltrados.length ? (
                  <LeagueTable
                    equipos={equiposFiltrados}
                    ascensos={selectedDivision.ascensos}
                    descensos={selectedDivision.descensos}
                    liguillaDesde={selectedDivision.puestosLiguillaDesde}
                    liguillaHasta={selectedDivision.puestosLiguillaHasta}
                    tipoLiguilla={selectedDivision.tipoLiguilla}
                    promocionDesde={selectedDivision.puestosPromocionDesde}
                    promocionHasta={selectedDivision.puestosPromocionHasta}
                    equipoPrincipalId={equipoPrincipalId}
                  />
                ) : <EmptyState title="Sin datos" description="No hay partidos finalizados aún" />}
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                    <h3 className="text-lg font-bold text-[var(--text)]">Goleadores</h3>
                  </div>
                  {rankings.length ? <TopScorers rankings={rankings} statKey="goles" /> : <EmptyState title="Sin goleadores" />}
                </div>

                {/* Division Info Card */}
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                  <h4 className="text-sm font-bold text-[var(--text)] mb-2">Información del Torneo</h4>
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <p>📅 {selectedDivision.totalJornadas} jornadas</p>
                    {selectedDivision.ascensos > 0 && <p>⬆️ {selectedDivision.ascensos} ascienden directamente</p>}
                    {selectedDivision.tipoLiguilla !== 'none' && <p>🏆 {selectedDivision.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}: puestos {selectedDivision.puestosLiguillaDesde}-{selectedDivision.puestosLiguillaHasta}</p>}
                    {selectedDivision.tipoPromocion === 'promocion' && <p>↕️ Promoción: puestos {selectedDivision.puestosPromocionDesde}-{selectedDivision.puestosPromocionHasta}</p>}
                    {selectedDivision.descensos > 0 && <p>⬇️ {selectedDivision.descensos} descienden</p>}
                  </div>
                </div>

                {/* Malleco Highlight */}
                {equipoPrincipalId && (
                  <div className="rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/[0.08] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-yellow-600">Club Principal</span>
                    </div>
                    <p className="text-xs text-yellow-700/70">{equiposMap[equipoPrincipalId]?.nombre} es el club principal de la plataforma</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!divisiones.length && !selectedDivisionId && (
          <EmptyState title="Sin divisiones" description="No hay divisiones disponibles para este deporte" />
        )}
      </div>
    </div>
  );
}
