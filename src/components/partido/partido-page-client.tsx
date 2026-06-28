'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit as fLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Trophy, Clock, RefreshCw, Calendar, MapPin, Swords, MessageCircle } from 'lucide-react';
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

  // Load live match
  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setPartidoDb({ id: snap.docs[0].id, ...snap.docs[0].data() } as Partido);
      else setPartidoDb(null);
    });
    return () => unsub();
  }, []);

  // Load next Malleco match (no composite index)
  useEffect(() => {
    if (!principalId) return;
    const q = query(
      collection(db, 'partidos'),
      orderBy('fecha', 'asc'),
      fLimit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      const match = partidos.find(
        p => p.estado === 'programado' && (p.equipoLocalId === principalId || p.equipoVisitaId === principalId)
      );
      setProximoPartido(match || null);
    }, (err) => console.warn('Error loading next match:', err));
    return () => unsub();
  }, [principalId]);

  // Countdown
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

  const localEquipo = equiposMap[partidoDb?.equipoLocalId || ''];
  const visEquipo = equiposMap[partidoDb?.equipoVisitaId || ''];
  const localNombre = localEquipo?.nombre || partidoDb?.equipoLocalNombre || '';
  const visNombre = visEquipo?.nombre || partidoDb?.equipoVisitaNombre || '';

  const proxLocal = proximoPartido ? equiposMap[proximoPartido.equipoLocalId] : null;
  const proxVis = proximoPartido ? equiposMap[proximoPartido.equipoVisitaId] : null;

  if (loadingLive) {
    return <div className="p-4"><Skeleton className="h-48 w-full max-w-2xl mx-auto rounded-[var(--radius)]" /></div>;
  }

  return (
    <div className="pb-8">
      {/* Live Match Scoreboard */}
      {isLive ? (
        <section className="pt-4">
          <div className="w-full max-w-2xl mx-auto p-4">
            <div className="rounded-[var(--radius)] border-2 border-[var(--accent)]/30 bg-[var(--bg-card)] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-4 py-1.5 flex items-center justify-between">
                <BadgeEnVivo size="sm" />
                <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  {partidoDb?.minuto || '0'}&apos;
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-5 gap-3">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: localEquipo?.colorPrimario || '#1E293B' }}>
                    {localEquipo?.logoBase64 ? <img src={localEquipo.logoBase64} alt="" className="w-10 h-10 object-contain logo-img" /> : <span className="font-black">{localNombre.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <p className="text-sm font-bold text-[var(--text)] text-center leading-tight">{localNombre}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{partidoDb?.marcadorLocal ?? 0}</span>
                  <span className="text-2xl md:text-3xl font-black text-[var(--text-muted)]">:</span>
                  <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{partidoDb?.marcadorVisita ?? 0}</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: visEquipo?.colorPrimario || '#1E293B' }}>
                    {visEquipo?.logoBase64 ? <img src={visEquipo.logoBase64} alt="" className="w-10 h-10 object-contain logo-img" /> : <span className="font-black">{visNombre.slice(0, 2).toUpperCase()}</span>}
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
        </section>
      ) : (
        /* Next Match */
        <section className="pt-4">
          <div className="w-full max-w-2xl mx-auto p-4">
            <div className="rounded-[var(--radius)] border-2 border-dashed border-[var(--border)] p-6 text-center bg-[var(--bg-secondary)]">
              {proximoPartido && principalEquipo ? (
                <>
                  <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-muted)] mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: proxLocal?.colorPrimario || '#1E293B' }}>
                        {proxLocal?.logoBase64 ? <img src={proxLocal.logoBase64} alt="" className="w-8 h-8 object-contain logo-img" /> : <span className="font-black">{proximoPartido.equipoLocalNombre?.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <span className="text-xs font-bold text-[var(--text)] text-center leading-tight max-w-[100px]">{proximoPartido.equipoLocalNombre}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black font-display text-[var(--accent)]">VS</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Jornada {proximoPartido.jornada}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: proxVis?.colorPrimario || '#1E293B' }}>
                        {proxVis?.logoBase64 ? <img src={proxVis.logoBase64} alt="" className="w-8 h-8 object-contain logo-img" /> : <span className="font-black">{proximoPartido.equipoVisitaNombre?.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <span className="text-xs font-bold text-[var(--text)] text-center leading-tight max-w-[100px]">{proximoPartido.equipoVisitaNombre}</span>
                    </div>
                  </div>

                  {countdown && <p className="text-lg font-black font-display text-[var(--accent)] mb-1">{countdown}</p>}
                  {proximoPartido.estadio && (
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />{proximoPartido.estadio}</p>
                  )}
                </>
              ) : (
                <>
                  <Trophy className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)] font-medium">No hay partidos programados</p>
                  <p className="text-[var(--text-muted)] text-sm mt-1">Vuelve pronto para ver los próximos encuentros</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Match info - shows for both live and next match */}
      <section className="max-w-2xl mx-auto px-4 mt-6">
        <div className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[var(--border)]">
            <Swords className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {isLive ? 'Acción del Partido' : 'Información del Partido'}
            </h2>
          </div>
          <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
            {isLive ? (
              <p>Eventos y comentarios disponibles durante la transmisión en vivo.</p>
            ) : proximoPartido ? (
              <div className="space-y-1 text-xs">
                <p>⚽ Jornada {proximoPartido.jornada}</p>
                <p>🏟️ {proximoPartido.estadio || 'Por definir'}</p>
              </div>
            ) : (
              <p>No hay información disponible en este momento.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
