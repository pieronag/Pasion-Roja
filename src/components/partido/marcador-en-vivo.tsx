'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit as fLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Trophy, Clock, RefreshCw, Calendar, MapPin } from 'lucide-react';
import type { Equipo } from '@/types/equipo';
import type { Partido } from '@/types/partido';

export function MarcadorEnVivo() {
  const { partido: livePartido, loading } = useMarcador();
  const [partidoDb, setPartidoDb] = useState<Partido | null>(null);
  const [proximoPartido, setProximoPartido] = useState<Partido | null>(null);
  const [equiposMap, setEquiposMap] = useState<Record<string, Equipo>>({});
  const [goalFlash, setGoalFlash] = useState(false);
  const [countdown, setCountdown] = useState('');
  const prevMarcador = useRef({ local: 0, vis: 0 });

  // Load all equipos for logos
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      const map: Record<string, Equipo> = {};
      snap.docs.forEach((d) => { const e = { id: d.id, ...d.data() } as Equipo; map[e.nombre] = e; map[e.id] = e; });
      setEquiposMap(map);
    });
    return () => unsub();
  }, []);

  // Find principal team
  const principalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;
  const principalEquipo = principalId ? equiposMap[principalId] : null;

  // Load live match (simple where, no composite index needed)
  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setPartidoDb({ id: snap.docs[0].id, ...snap.docs[0].data() } as Partido);
      else setPartidoDb(null);
    });
    return () => unsub();
  }, []);

  // Load next Malleco match
  useEffect(() => {
    if (!principalId) return;
    const unsub = onSnapshot(collection(db, 'partidos'), (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      const mallecoPartidos = partidos.filter(
        p => p.equipoLocalId === principalId || p.equipoVisitaId === principalId
      );
      mallecoPartidos.sort((a, b) => a.fecha - b.fecha);
      const next = mallecoPartidos.find(p => p.estado === 'programado');
      setProximoPartido(next || null);
    }, (err) => console.warn('Error loading next match:', err));
    return () => unsub();
  }, [principalId]);

  // Countdown for next match
  useEffect(() => {
    if (!proximoPartido?.fecha) return;
    const fn = () => {
      const diff = proximoPartido.fecha - Date.now();
      if (diff <= 0) { setCountdown('¡Comenzando!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`);
    };
    fn();
    const timer = setInterval(fn, 1000);
    return () => clearInterval(timer);
  }, [proximoPartido]);

  const localEquipoData = equiposMap[partidoDb?.equipoLocalId || ''];
  const visEquipoData = equiposMap[partidoDb?.equipoVisitaId || ''];
  const localNombre = localEquipoData?.nombre || partidoDb?.equipoLocalNombre || '';
  const visNombre = visEquipoData?.nombre || partidoDb?.equipoVisitaNombre || '';
  const localScore = partidoDb?.marcadorLocal ?? 0;
  const visScore = partidoDb?.marcadorVisita ?? 0;
  const minActual = partidoDb?.minuto || '0';
  const penalesLocal = partidoDb?.penalesLocal ?? livePartido?.penalesLocal ?? 0;
  const penalesVisita = partidoDb?.penalesVisita ?? livePartido?.penalesVis ?? 0;

  const localEquipo = localEquipoData || visEquipoData;
  const visEquipo = visEquipoData || localEquipoData;

  const isMallecoMatch = partidoDb?.equipoLocalId === principalId || partidoDb?.equipoVisitaId === principalId;
  const isLive = !!partidoDb && isMallecoMatch;

  // Next match team data
  const proxLocal = proximoPartido ? equiposMap[proximoPartido.equipoLocalId] : null;
  const proxVis = proximoPartido ? equiposMap[proximoPartido.equipoVisitaId] : null;

  useEffect(() => {
    if (!isLive) return;
    if (localScore > prevMarcador.current.local || visScore > prevMarcador.current.vis) {
      setGoalFlash(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setGoalFlash(false), 800);
    }
    prevMarcador.current = { local: localScore, vis: visScore };
  }, [localScore, visScore, isLive]);

  if (loading) return <div className="w-full max-w-2xl mx-auto p-4"><Skeleton className="h-48 w-full rounded-[var(--radius)]" /></div>;

  if (!isLive) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        {proximoPartido && principalEquipo ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border border-white/10">
            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="relative z-10 p-6">
              {/* Top bar with date and badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>{new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold border border-[var(--accent)]/30">
                  Jornada {proximoPartido.jornada}
                </span>
              </div>
              {/* Teams vs display */}
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
              {/* Countdown */}
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
            <p className="text-white/60 font-medium">No hay partido en curso</p>
            <p className="text-white/40 text-sm mt-1">Vuelve pronto para ver el marcador en vivo</p>
          </div>
        )}
      </div>
    );
  }

  // Live match scoreboard
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className={cn('relative rounded-[var(--radius)] border-2 overflow-hidden transition-all duration-300', 'border-[var(--accent)]/30 bg-[var(--bg-card)] shadow-lg', goalFlash && 'animate-goal-flash')}>
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-4 py-1.5 flex items-center justify-between">
          <BadgeEnVivo size="sm" />
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold"><Clock className="h-3.5 w-3.5" />{minActual}&apos;</div>
        </div>
        <div className="flex items-center justify-between px-4 py-6 gap-3">
          <div className="flex-1 flex flex-col items-center gap-3">
            {localEquipo?.logoBase64 ? <img src={localEquipo.logoBase64} alt="" className="w-20 h-20 object-contain logo-img" /> : <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">{localNombre.slice(0, 2).toUpperCase()}</div>}
            <p className="text-sm font-bold text-[var(--text)] text-center">{localNombre}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{localScore}</span>
            <span className="text-2xl md:text-3xl font-black text-[var(--text-muted)]">:</span>
            <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{visScore}</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-3">
            {visEquipo?.logoBase64 ? <img src={visEquipo.logoBase64} alt="" className="w-20 h-20 object-contain logo-img" /> : <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">{visNombre.slice(0, 2).toUpperCase()}</div>}
            <p className="text-sm font-bold text-[var(--text)] text-center">{visNombre}</p>
          </div>
        </div>
        {(penalesLocal > 0 || penalesVisita > 0) ? (
          <div className="px-4 pb-3 text-center">
            <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">Penales</span>
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]"><span>{penalesLocal}</span><span className="text-[var(--text-muted)]">-</span><span>{penalesVisita}</span></div>
          </div>
        ) : null}
        <div className="flex items-center justify-center gap-1 pb-3 text-[10px] text-[var(--text-muted)]">
          <RefreshCw className="h-3 w-3" /><span>Actualizado en tiempo real</span>
        </div>
      </div>
    </div>
  );
}
