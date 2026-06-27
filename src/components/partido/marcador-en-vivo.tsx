'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Trophy, Clock, RefreshCw } from 'lucide-react';
import type { Equipo } from '@/types/equipo';
import type { Partido } from '@/types/partido';

export function MarcadorEnVivo() {
  const { partido: livePartido, loading } = useMarcador();
  const [partidoDb, setPartidoDb] = useState<Partido | null>(null);
  const [equiposMap, setEquiposMap] = useState<Record<string, Equipo>>({});
  const [goalFlash, setGoalFlash] = useState(false);
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

  // Load live match from partidos collection for team IDs
  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as Partido;
        setPartidoDb(data);
      } else {
        setPartidoDb(null);
      }
    });
    return () => unsub();
  }, []);

  // Use partidos collection if available, fallback to partidos_en_vivo
  const localNombre = partidoDb?.equipoLocalNombre || livePartido?.equipoLocal || '';
  const visNombre = partidoDb?.equipoVisitaNombre || livePartido?.equipoVis || '';
  const localScore = partidoDb?.marcadorLocal ?? livePartido?.marcadorLocal ?? 0;
  const visScore = partidoDb?.marcadorVisita ?? livePartido?.marcadorVis ?? 0;
  const minActual = partidoDb?.minuto || livePartido?.minuto || '0';

  const localEquipo = equiposMap[partidoDb?.equipoLocalId || ''] || equiposMap[localNombre];
  const visEquipo = equiposMap[partidoDb?.equipoVisitaId || ''] || equiposMap[visNombre];
  const isLive = !!(partidoDb || livePartido);

  useEffect(() => {
    if (!isLive) return;
    if (localScore > prevMarcador.current.local || visScore > prevMarcador.current.vis) {
      setGoalFlash(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setGoalFlash(false), 800);
    }
    prevMarcador.current = { local: localScore, vis: visScore };
  }, [localScore, visScore, isLive]);

  if (loading) {
    return <div className="w-full max-w-2xl mx-auto p-4"><Skeleton className="h-48 w-full rounded-[var(--radius)]" /></div>;
  }

  if (!isLive && !loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] p-8 text-center bg-[var(--bg-secondary)]">
          <Trophy className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">No hay partido en curso</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Vuelve pronto para ver el marcador en vivo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className={cn(
        'relative rounded-[var(--radius)] border-2 overflow-hidden transition-all duration-300',
        'border-[var(--accent)]/30 bg-[var(--bg-card)] shadow-lg',
        goalFlash && 'animate-goal-flash'
      )}>
        {/* Top bar */}
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-4 py-1.5 flex items-center justify-between">
          <BadgeEnVivo size="sm" />
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            {minActual}&apos;
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between px-4 py-5 gap-3">
          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: localEquipo?.colorPrimario || '#1E293B' }}>
              {localEquipo?.logoBase64 ? (
                <img src={localEquipo.logoBase64} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <span className="font-black">{localNombre.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <p className="text-sm font-bold text-[var(--text)] text-center leading-tight">{localNombre}</p>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{localScore}</span>
            <span className="text-2xl md:text-3xl font-black text-[var(--text-muted)]">:</span>
            <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{visScore}</span>
          </div>

          {/* Visitor */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: visEquipo?.colorPrimario || '#1E293B' }}>
              {visEquipo?.logoBase64 ? (
                <img src={visEquipo.logoBase64} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <span className="font-black">{visNombre.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <p className="text-sm font-bold text-[var(--text)] text-center leading-tight">{visNombre}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 pb-3 text-[10px] text-[var(--text-muted)]">
          <RefreshCw className="h-3 w-3" />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>
    </div>
  );
}
