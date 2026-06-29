'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, RefreshCw, Calendar, MapPin, Swords } from 'lucide-react';
import { useWakeLock } from '@/hooks/use-wake-lock';
import type { Partido } from '@/types/partido';

export function PartidoPageClient() {
  useWakeLock(true);
  const { partido: livePartido, loading: loadingLive } = useMarcador();
  const { equiposMap } = useEquiposMap();
  const [partidoDb, setPartidoDb] = useState<Partido | null>(null);
  const [proximoPartido, setProximoPartido] = useState<Partido | null>(null);
  const [countdown, setCountdown] = useState('');

  const principalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;
  const principalEquipo = principalId ? equiposMap[principalId] : null;

  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setPartidoDb({ id: snap.docs[0].id, ...snap.docs[0].data() } as Partido);
      else setPartidoDb(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!principalId) return;
    const q = query(collection(db, 'partidos'), where('equipoLocalId', '==', principalId));
    const unsub = onSnapshot(q, (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      partidos.sort((a, b) => a.fecha - b.fecha);
      const match = partidos.find(p => p.estado === 'programado');
      setProximoPartido(match || null);
    }, () => {});
    return () => unsub();
  }, [principalId]);

  useEffect(() => {
    if (!proximoPartido?.fecha) return;
    const fn = () => {
      const diff = proximoPartido.fecha - Date.now();
      if (diff <= 0) { setCountdown('¡Comenzando!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    fn();
    const timer = setInterval(fn, 1000);
    return () => clearInterval(timer);
  }, [proximoPartido]);

  const isMallecoMatch = partidoDb?.equipoLocalId === principalId || partidoDb?.equipoVisitaId === principalId;
  const isLive = !!partidoDb && isMallecoMatch;

  const localNombre = (equiposMap[partidoDb?.equipoLocalId || '']?.nombre) || partidoDb?.equipoLocalNombre || '';
  const visNombre = (equiposMap[partidoDb?.equipoVisitaId || '']?.nombre) || partidoDb?.equipoVisitaNombre || '';
  const localLogo = equiposMap[partidoDb?.equipoLocalId || '']?.logoBase64;
  const visLogo = equiposMap[partidoDb?.equipoVisitaId || '']?.logoBase64;

  const localScore = partidoDb?.marcadorLocal ?? 0;
  const visScore = partidoDb?.marcadorVisita ?? 0;
  const minActual = partidoDb?.minuto || '0';

  const proxLocal = proximoPartido ? equiposMap[proximoPartido.equipoLocalId] : null;
  const proxVis = proximoPartido ? equiposMap[proximoPartido.equipoVisitaId] : null;

  if (loadingLive) return <div className="p-4"><Skeleton className="h-48 w-full max-w-2xl mx-auto rounded-2xl" /></div>;

  return (
    <div className="pb-8">
      {isLive ? (
        <section className="pt-4">
          <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border border-white/10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10">
                <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-4 py-1.5 flex items-center justify-between">
                  <BadgeEnVivo size="sm" />
                  <div className="flex items-center gap-1.5 text-white text-xs font-semibold"><Clock className="h-3.5 w-3.5" />{minActual}&apos;</div>
                </div>
                <div className="flex items-center justify-between px-4 py-6 gap-3">
                  <div className="flex-1 flex flex-col items-center gap-3">
                    {localLogo ? <img src={localLogo} alt="" className="w-20 h-20 object-contain logo-img drop-shadow-lg" /> : <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur flex items-center justify-center text-lg font-bold text-white/40">{localNombre.slice(0, 2).toUpperCase()}</div>}
                    <p className="text-sm font-bold text-white text-center">{localNombre}</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-5xl md:text-7xl font-black font-display text-white tabular-nums drop-shadow-lg">{localScore}</span>
                    <span className="text-2xl md:text-3xl font-black text-white/30">:</span>
                    <span className="text-5xl md:text-7xl font-black font-display text-white tabular-nums drop-shadow-lg">{visScore}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-3">
                    {visLogo ? <img src={visLogo} alt="" className="w-20 h-20 object-contain logo-img drop-shadow-lg" /> : <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur flex items-center justify-center text-lg font-bold text-white/40">{visNombre.slice(0, 2).toUpperCase()}</div>}
                    <p className="text-sm font-bold text-white text-center">{visNombre}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 pb-3 text-[10px] text-white/40"><RefreshCw className="h-3 w-3" /><span>Actualizado en tiempo real</span></div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-4">
          <div className="w-full max-w-2xl mx-auto p-4">
            {proximoPartido && principalEquipo ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border border-white/10">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span>{new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold border border-[var(--accent)]/30">
                      Jornada {proximoPartido.jornada}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg">
                        {proxLocal?.logoBase64 ? <img src={proxLocal.logoBase64} alt="" className="w-16 h-16 object-contain logo-img drop-shadow-lg" /> : <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-lg font-bold text-white">{proximoPartido.equipoLocalNombre?.slice(0, 2).toUpperCase()}</div>}
                      </div>
                      <span className="text-sm font-bold text-white text-center max-w-[120px] drop-shadow">{proximoPartido.equipoLocalNombre}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-4xl font-black font-display text-white/30">VS</span>
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg">
                        {proxVis?.logoBase64 ? <img src={proxVis.logoBase64} alt="" className="w-16 h-16 object-contain logo-img drop-shadow-lg" /> : <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white">{proximoPartido.equipoVisitaNombre?.slice(0, 2).toUpperCase()}</div>}
                      </div>
                      <span className="text-sm font-bold text-white text-center max-w-[120px] drop-shadow">{proximoPartido.equipoVisitaNombre}</span>
                    </div>
                  </div>
                  {countdown && (
                    <div className="text-center mb-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Tiempo restante</p>
                      <p className="text-2xl md:text-3xl font-black font-mono text-[var(--accent)] tracking-wider drop-shadow-lg">{countdown}</p>
                    </div>
                  )}
                  {proximoPartido.estadio && (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50">
                      <MapPin className="h-3 w-3 text-[var(--accent)]/70" />
                      <span>{proximoPartido.estadio}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center bg-white/5 backdrop-blur">
                <Trophy className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 font-medium">No hay partidos programados</p>
                <p className="text-white/40 text-sm mt-1">Vuelve pronto para ver los próximos encuentros</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="max-w-2xl mx-auto px-4 mt-6">
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-white/10">
            <Swords className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{isLive ? 'Acción del Partido' : 'Información del Partido'}</h2>
          </div>
          <div className="p-4 text-center text-sm text-white/50">
            {isLive ? <p>Eventos y comentarios durante la transmisión.</p> : proximoPartido ? (
              <div className="space-y-1 text-xs"><p>⚽ Jornada {proximoPartido.jornada}</p><p>🏟️ {proximoPartido.estadio || 'Por definir'}</p></div>
            ) : <p>No hay información disponible.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
