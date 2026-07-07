'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit as fLimit } from 'firebase/firestore';
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
import { ArrowLeft, Trophy, TrendingUp, Shield, Medal, Star, ChevronRight, CalendarDays, ArrowUp, ArrowDown, ListChecks, Swords, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Division } from '@/types/division';
import type { Partido } from '@/types/partido';

export function DeportePageClient({ deporteId }: { deporteId: string }) {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const { tabla, loading: loadingPos } = usePosiciones(deporteId);
  const { rankings } = useEstadisticas(deporteId, 'goles');
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [partidosDivision, setPartidosDivision] = useState<Partido[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'divisiones'), where('deporteId', '==', deporteId));
    const unsub = onSnapshot(q, (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, [deporteId]);

  // Load partidos for selected division
  useEffect(() => {
    if (!selectedDivisionId) { setPartidosDivision([]); return; }
    const equipoIds = new Set(Object.values(equiposMap).filter(e => e.divisionId === selectedDivisionId).map(e => e.id));
    if (!equipoIds.size) return;
    const q = query(collection(db, 'partidos'), orderBy('fecha', 'asc'), fLimit(100));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      setPartidosDivision(all.filter(p => equipoIds.has(p.equipoLocalId) || equipoIds.has(p.equipoVisitaId)));
    }, () => {});
    return () => unsub();
  }, [selectedDivisionId, equiposMap]);

  const selectedDivision = divisiones.find((d) => d.id === selectedDivisionId);
  const deporte = deportes.find((d) => d.id === deporteId);

  const equiposFiltrados = selectedDivisionId
    ? tabla.filter((e) => equiposMap[e.equipoId]?.divisionId === selectedDivisionId)
    : [];

  const equipoPrincipalId = selectedDivisionId
    ? Object.values(equiposMap).find((e) => e.divisionId === selectedDivisionId && e.esPrincipal)?.id
    : undefined;

  const proximaJornada = (() => {
    const progs = partidosDivision.filter(p => p.estado === 'programado' && p.fecha > Date.now());
    if (!progs.length) return null;
    const minFecha = Math.min(...progs.map(p => p.fecha));
    const jornadaNum = progs.find(p => p.fecha === minFecha)?.jornada;
    return {
      jornada: jornadaNum,
      partidos: progs.filter(p => p.jornada === jornadaNum).sort((a, b) => a.fecha - b.fecha),
    };
  })();

  const getLogo = (id: string) => equiposMap[id]?.logoBase64;
  const getColor = (id: string) => equiposMap[id]?.colorPrimario;

  if (!deporte) {
    return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 w-full rounded-[var(--radius)]" /></div>;
  }

  const bannerSrc = selectedDivision?.bannerBase64 || deporte.bannerBase64;

  return (
    <div className="pb-8">
      {/* Hero Banner - 1200x400 (3:1 ratio) */}
      <div className={`relative ${bannerSrc || selectedDivision ? 'h-48 md:h-64' : 'h-28'} bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)] overflow-hidden`}>
        {bannerSrc && (
          <img src={bannerSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full h-full flex flex-col justify-end pb-4 md:pb-6">
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
            <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[var(--accent)]" /> Divisiones Disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {divisiones.map((div) => {
                const principalTeamId = Object.values(equiposMap).find(e => e.divisionId === div.id && e.esPrincipal)?.id;
                const equiposCount = Object.values(equiposMap).filter(e => e.divisionId === div.id).length;
                const equiposConPartidos = [...new Set(tabla.filter(e => equiposMap[e.equipoId]?.divisionId === div.id).map(e => e.equipoId))].length;
                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    className="text-left rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md hover:cursor-pointer transition-all group overflow-hidden"
                  >
                    {div.bannerBase64 && (
                      <div className="h-24 overflow-hidden bg-[var(--bg-secondary)]">
                        <img src={div.bannerBase64} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{div.nombre}</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Temporada {div.temporada}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Shield className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <span>{equiposCount} equipos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Swords className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <span>{equiposConPartidos || equiposCount} en tabla</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <CalendarDays className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <span>{div.totalJornadas || 30} jornadas</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <ListChecks className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          <span>{div.tipoLiguilla !== 'none' ? 'Playoff' : 'Liga'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {div.ascensos > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            <ArrowUp className="h-3 w-3" /> Asc: {div.ascensos}
                          </span>
                        )}
                        {div.descensos > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                            <ArrowDown className="h-3 w-3" /> Desc: {div.descensos}
                          </span>
                        )}
                        {div.tipoLiguilla !== 'none' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded-full">
                            <Medal className="h-3 w-3" /> {div.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}
                          </span>
                        )}
                        {div.tipoPromocion === 'promocion' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            Prom: {div.puestosPromocionDesde}-{div.puestosPromocionHasta}
                          </span>
                        )}
                        {principalTeamId && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                      </div>
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
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedDivisionId('')} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all" title="Volver">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">{selectedDivision.nombre}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{deporte.nombre} · Temporada {selectedDivision.temporada}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedDivision.ascensos > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <ArrowUp className="h-3.5 w-3.5" /> Asc {selectedDivision.ascensos}
                  </span>
                )}
                {selectedDivision.descensos > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-full">
                    <ArrowDown className="h-3.5 w-3.5" /> Desc {selectedDivision.descensos}
                  </span>
                )}
                {selectedDivision.tipoLiguilla !== 'none' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 bg-sky-500/10 px-2 py-1 rounded-full">
                    <Medal className="h-3.5 w-3.5" /> {selectedDivision.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}
                  </span>
                )}
                {selectedDivision.tipoPromocion === 'promocion' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">
                    Prom: {selectedDivision.puestosPromocionDesde}-{selectedDivision.puestosPromocionHasta}
                  </span>
                )}
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
                  {rankings.length ? <TopScorers rankings={rankings} statKey="goles" equiposMap={equiposMap} principalEquipoId={equipoPrincipalId} /> : <EmptyState title="Sin goleadores" />}
                </div>

                {/* Proxima Jornada */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="h-5 w-5 text-[var(--accent)]" />
                    <h3 className="text-lg font-bold text-[var(--text)]">Proxima Jornada</h3>
                    {proximaJornada && (
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Jornada {proximaJornada.jornada}</span>
                    )}
                  </div>
                  {proximaJornada ? (
                    <div className="space-y-2">
                      {proximaJornada.partidos.map((p) => (
                        <div key={p.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-2.5 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {getLogo(p.equipoLocalId) ? <img src={getLogo(p.equipoLocalId)} alt="" className="w-5 h-5 object-contain logo-img" /> : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-bold text-white flex-shrink-0" style={{ backgroundColor: getColor(p.equipoLocalId) || '#64748B' }}>{p.equipoLocalNombre?.[0]}</div>}
                            </div>
                            <span className="text-xs font-medium text-[var(--text)] truncate">{p.equipoLocalNombre}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] flex-shrink-0">VS</span>
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                            <span className="text-xs font-medium text-[var(--text)] truncate">{p.equipoVisitaNombre}</span>
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {getLogo(p.equipoVisitaId) ? <img src={getLogo(p.equipoVisitaId)} alt="" className="w-5 h-5 object-contain logo-img" /> : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-bold text-white flex-shrink-0" style={{ backgroundColor: getColor(p.equipoVisitaId) || '#64748B' }}>{p.equipoVisitaNombre?.[0]}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="Sin partidos" description="No hay proxima jornada programada" />
                  )}
                </div>

                {/* Division Info Card */}
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
                  <h4 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-[var(--accent)]" /> Información del Torneo
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CalendarDays className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span>{selectedDivision.totalJornadas} jornadas</span>
                    </div>
                    {selectedDivision.ascensos > 0 && (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <ArrowUp className="h-3.5 w-3.5" />
                        <span>{selectedDivision.ascensos} ascienden directamente</span>
                      </div>
                    )}
                    {selectedDivision.tipoLiguilla !== 'none' && (
                      <div className="flex items-center gap-2 text-sky-600">
                        <Medal className="h-3.5 w-3.5" />
                        <span>{selectedDivision.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}: puestos {selectedDivision.puestosLiguillaDesde}-{selectedDivision.puestosLiguillaHasta}</span>
                      </div>
                    )}
                    {selectedDivision.tipoPromocion === 'promocion' && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>Promoción: puestos {selectedDivision.puestosPromocionDesde}-{selectedDivision.puestosPromocionHasta}</span>
                      </div>
                    )}
                    {selectedDivision.descensos > 0 && (
                      <div className="flex items-center gap-2 text-red-500">
                        <ArrowDown className="h-3.5 w-3.5" />
                        <span>{selectedDivision.descensos} descienden</span>
                      </div>
                    )}
                  </div>
                </div>
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
