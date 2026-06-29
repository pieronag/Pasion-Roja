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

  // Load next Malleco match - query only their matches as local team
  useEffect(() => {
    if (!principalId) return;
    const q = query(
      collection(db, 'partidos'),
      where('equipoLocalId', '==', principalId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      // Sort by fecha descending locally, find the next programado
      partidos.sort((a, b) => b.fecha - a.fecha);
      const next = partidos.find(p => p.estado === 'programado');
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
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
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
        <div className="rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] p-6 text-center bg-[var(--bg-secondary)]">
          {proximoPartido && principalEquipo ? (
            <>
              <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-muted)] mb-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center justify-center gap-6 mb-3">
                <div className="flex flex-col items-center gap-2">
                  {proxLocal?.logoBase64 ? <img src={proxLocal.logoBase64} alt="" className="w-16 h-16 object-contain logo-img" /> : <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">{proximoPartido.equipoLocalNombre?.slice(0, 2).toUpperCase()}</div>}
                  <span className="text-xs font-bold text-[var(--text)] text-center max-w-[100px]">{proximoPartido.equipoLocalNombre}</span>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black font-display text-[var(--accent)]">VS</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Jornada {proximoPartido.jornada}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {proxVis?.logoBase64 ? <img src={proxVis.logoBase64} alt="" className="w-16 h-16 object-contain logo-img" /> : <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">{proximoPartido.equipoVisitaNombre?.slice(0, 2).toUpperCase()}</div>}
                  <span className="text-xs font-bold text-[var(--text)] text-center max-w-[100px]">{proximoPartido.equipoVisitaNombre}</span>
                </div>
              </div>
              {countdown && <p className="text-lg font-black font-display text-[var(--accent)] mb-1">{countdown}</p>}
              {proximoPartido.estadio && <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />{proximoPartido.estadio}</p>}
            </>
          ) : (
            <>
              <Trophy className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)] font-medium">No hay partido en curso</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">Vuelve pronto para ver el marcador en vivo</p>
            </>
          )}
        </div>
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
