'use client';

import { MarcadorEnVivo } from '@/components/partido/marcador-en-vivo';
import { ListaNoticias } from '@/components/noticias/lista-noticias';
import { LiveNowBar } from '@/components/shared/live-now-bar';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { useTransmision } from '@/hooks/use-transmision';
import { usePosiciones } from '@/hooks/use-posiciones';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useGoleadores } from '@/hooks/use-goleadores';
import { usePartidos } from '@/hooks/use-partidos';
import { LeagueTable } from '@/components/posiciones/league-table';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Trophy, Star, Shield, MapPin, Calendar, Users,
  Shirt, Building2, Award, Goal, Swords, Clock,
  ChevronRight, CheckCircle2, XCircle, Minus,
} from 'lucide-react';
import type { Division } from '@/types/division';
import { useState, useEffect } from 'react';

export function Hero() {
  const { config } = useTransmision();
  const { tabla, loading: tablaLoading } = usePosiciones();
  const { equiposMap } = useEquiposMap();
  const { goleadores } = useGoleadores();
  const { partidos: todosPartidos } = usePartidos({ max: 100 });
  const { partidos: recientes } = usePartidos({ estado: 'finalizado', max: 5 });

  const [division, setDivision] = useState<Division | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'divisiones'), (snap) => {
      const divs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division));
      setDivision(divs.find((d) => d.activa) || divs[0] || null);
    });
    return () => unsub();
  }, []);

  const equipoPrincipal = Object.values(equiposMap).find((e) => e.esPrincipal);
  const hoy = Date.now();
  const proxMalleco = todosPartidos
    .filter((p) => p.estado === 'programado' && p.fecha >= hoy && (p.equipoLocalId === equipoPrincipal?.id || p.equipoVisitaId === equipoPrincipal?.id))
    .sort((a, b) => (a.fecha ?? 0) - (b.fecha ?? 0))
    .slice(0, 4);
  const recMalleco = recientes.filter(
    (p) => p.equipoLocalId === equipoPrincipal?.id || p.equipoVisitaId === equipoPrincipal?.id
  );

  return (
    <>
      {config?.estadoTransmision === 'en_vivo' && <LiveNowBar tipo="tv" />}

      {/* HERO — full-bleed stadium + live score */}
      <section className="relative overflow-hidden pt-0 pb-8">
        <div className="absolute inset-0 -z-10">
          <img src="/wallpaper.jpg" alt="" className="w-full h-full object-cover" sizes="100vw" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/70 via-[var(--accent)]/40 to-[var(--bg)]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center px-4 pt-6 md:pt-10 mb-3">
            <h1 className="text-3xl md:text-5xl font-black font-display text-white leading-tight drop-shadow-lg">
              Pasi&oacute;n Roja&hellip; Pasi&oacute;n, pero de verdad.
            </h1>
            <p className="text-white/60 mt-1 text-xs md:text-sm max-w-lg mx-auto drop-shadow">
              Sigue el marcador en vivo, las &uacute;ltimas noticias y la tabla de posiciones de tu equipo.
            </p>
          </div>
          <MarcadorEnVivo />
        </div>
      </section>

      {/* CLUB INFO — Malleco Unido */}
      {equipoPrincipal && (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.04] to-transparent">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
            <div className="relative p-5 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                {equipoPrincipal.logoBase64 ? (
                  <img src={equipoPrincipal.logoBase64} alt="" className="w-20 h-20 md:w-28 md:h-28 object-contain logo-img flex-shrink-0 drop-shadow-lg" />
                ) : (
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-12 w-12 text-yellow-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--text)]">{equipoPrincipal.nombre}</h2>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">F&uacute;tbol</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 mt-3">
                    {equipoPrincipal.ciudad && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        {equipoPrincipal.ciudad}{equipoPrincipal.region ? `, ${equipoPrincipal.region}` : ''}
                      </p>
                    )}
                    {equipoPrincipal.estadio && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        {equipoPrincipal.estadio}{equipoPrincipal.capacidad ? ` (${(equipoPrincipal.capacidad).toLocaleString('es-CL')})` : ''}
                      </p>
                    )}
                    {equipoPrincipal.fundacion && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        Fundado {equipoPrincipal.fundacion}
                      </p>
                    )}
                    {equipoPrincipal.entrenador && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        DT: {equipoPrincipal.entrenador}
                      </p>
                    )}
                    {equipoPrincipal.proveedor && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Shirt className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        {equipoPrincipal.proveedor}
                      </p>
                    )}
                    {equipoPrincipal.auspiciador && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        {equipoPrincipal.auspiciador}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TABLE + GOLEADORES — side by side */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabla — 2/3 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">Tabla</span>
                <span className="text-[var(--text)]">de Posiciones</span>
              </h2>
            </div>
            {!tablaLoading && tabla.length > 0 && (
              <LeagueTable
                equipos={tabla}
                equipoPrincipalId={equipoPrincipal?.id}
                ascensos={division?.ascensos || 0}
                descensos={division?.descensos || 0}
                liguillaDesde={division?.puestosLiguillaDesde || 0}
                liguillaHasta={division?.puestosLiguillaHasta || 0}
                tipoLiguilla={division?.tipoLiguilla || ''}
                promocionDesde={division?.puestosPromocionDesde || 0}
                promocionHasta={division?.puestosPromocionHasta || 0}
              />
            )}
          </div>

          {/* Goleadores — 1/3 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2">
                <Goal className="h-5 w-5 text-[var(--accent)]" />
                <span className="text-[var(--accent)]">Goleadores</span>
              </h2>
            </div>
            {goleadores.length > 0 ? (
              <div className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                      <th className="p-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase w-8">#</th>
                      <th className="p-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase">Jugador</th>
                      <th className="p-2.5 text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase w-12">Goles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...goleadores]
                      .sort((a, b) => {
                        if (a.goles !== b.goles) return b.goles - a.goles;
                        if (a.equipoId === equipoPrincipal?.id && b.equipoId !== equipoPrincipal?.id) return -1;
                        if (b.equipoId === equipoPrincipal?.id && a.equipoId !== equipoPrincipal?.id) return 1;
                        return 0;
                      })
                      .slice(0, 10)
                      .map((g, i) => {
                        const medalla = i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-[var(--text-muted)]';
                        const eq = equiposMap[g.equipoId];
                        return (
                          <tr key={g.id} className={cn('border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors', g.equipoId === equipoPrincipal?.id && 'bg-yellow-500/[0.04]')}>
                            <td className="p-2.5 text-center font-bold font-mono text-xs">
                              <span className={medalla}>{i + 1}</span>
                            </td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-2">
                                {eq?.logoBase64 ? <img src={eq.logoBase64} alt="" className="w-6 h-6 object-contain flex-shrink-0" /> : null}
                                <span className={cn('text-xs font-bold tracking-wide truncate', g.equipoId === equipoPrincipal?.id ? 'text-yellow-500' : 'text-[var(--text)]')}>{g.nombre.toUpperCase()}</span>
                                {g.equipoId === equipoPrincipal?.id && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-black text-base text-[var(--accent)]">{g.goles}</td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] p-6 text-center">
                <Goal className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-xs text-[var(--text-muted)]">Sin goleadores registrados</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRÓXIMOS PARTIDOS */}
      {proxMalleco.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-2">
          <h2 className="text-lg font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-[var(--accent)]">Pr&oacute;ximos</span>
            <span className="text-[var(--text)]">Partidos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {proxMalleco.map((p) => {
              const local = equiposMap[p.equipoLocalId];
              const visita = equiposMap[p.equipoVisitaId];
              return (
                <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 transition-all p-4">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.fecha)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold">Jornada {p.jornada}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {local?.logoBase64 ? <img src={local.logoBase64} alt="" className="w-8 h-8 object-contain logo-img" /> : <Shield className="h-6 w-6 text-[var(--text-muted)]" />}
                      <span className={cn('text-sm font-bold truncate', p.equipoLocalId === equipoPrincipal?.id && 'text-yellow-500')}>
                        {p.equipoLocalNombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--text-muted)]">VS</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className={cn('text-sm font-bold truncate', p.equipoVisitaId === equipoPrincipal?.id && 'text-yellow-500')}>
                        {p.equipoVisitaNombre}
                      </span>
                      {visita?.logoBase64 ? <img src={visita.logoBase64} alt="" className="w-8 h-8 object-contain logo-img" /> : <Shield className="h-6 w-6 text-[var(--text-muted)]" />}
                    </div>
                  </div>
                  {(p.estadio || local?.estadio) && <p className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.estadio || local?.estadio}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RESULTADOS RECIENTES */}
      {recMalleco.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2 mb-3">
            <Swords className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-[var(--accent)]">Resultados</span>
            <span className="text-[var(--text)]">Recientes</span>
          </h2>
          <div className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                  <th className="p-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase">Jornada</th>
                  <th className="p-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase">Partido</th>
                  <th className="p-2.5 text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase">Resultado</th>
                  <th className="p-2.5 text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recMalleco.map((p) => {
                  const esLocal = p.equipoLocalId === equipoPrincipal?.id;
                  const gano = esLocal ? p.marcadorLocal > p.marcadorVisita : p.marcadorVisita > p.marcadorLocal;
                  const empato = p.marcadorLocal === p.marcadorVisita;
                  return (
                    <tr key={p.id} className="border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="p-2.5 text-xs text-[var(--text-secondary)]">Jor. {p.jornada}</td>
                      <td className="p-2.5">
                        <span className="font-medium text-[var(--text)]">{p.equipoLocalNombre}</span>
                        <span className="text-[var(--text-muted)] mx-1">vs</span>
                        <span className="font-medium text-[var(--text)]">{p.equipoVisitaNombre}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="font-black text-base tabular-nums text-[var(--text)]">
                          {p.marcadorLocal} - {p.marcadorVisita}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {gano ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : empato ? (
                          <Minus className="h-4 w-4 text-yellow-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ÚLTIMAS NOTICIAS */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2">
            <span className="text-[var(--accent)]">&Uacute;ltimas</span>
            <span className="text-[var(--text)]">Noticias</span>
          </h2>
        </div>
        <ListaNoticias />
      </section>

      <WhatsAppFloat />
    </>
  );
}
