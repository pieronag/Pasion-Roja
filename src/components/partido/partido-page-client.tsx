'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit as fLimit } from 'firebase/firestore';
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
      partidos.sort((a, b) => b.fecha - a.fecha);
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

  const proxLocal = proximoPartido ? equiposMap[proximoPartido.equipoLocalId] : null;
  const proxVis = proximoPartido ? equiposMap[proximoPartido.equipoVisitaId] : null;

  if (loadingLive) return <div className="p-4"><Skeleton className="h-48 w-full max-w-2xl mx-auto rounded-[var(--radius)]" /></div>;

  return (
    <div className="pb-8">
      {isLive ? (
        <section className="pt-4">
          <div className="w-full max-w-2xl mx-auto p-4">
            <div className="rounded-[var(--radius)] border-2 border-[var(--accent)]/30 bg-[var(--bg-card)] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-4 py-1.5 flex items-center justify-between">
                <BadgeEnVivo size="sm" />
                <div className="flex items-center gap-1.5 text-white text-xs font-semibold"><Clock className="h-3.5 w-3.5" />{partidoDb?.minuto || '0'}&apos;</div>
              </div>
              <div className="flex items-center justify-between px-4 py-6 gap-3">
                <div className="flex-1 flex flex-col items-center gap-3">
                  {localLogo ? <img src={localLogo} alt="" className="w-20 h-20 object-contain logo-img" /> : <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">{localNombre.slice(0, 2).toUpperCase()}</div>}
                  <p className="text-sm font-bold text-[var(--text)] text-center">{localNombre}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{partidoDb?.marcadorLocal ?? 0}</span>
                  <span className="text-2xl md:text-3xl font-black text-[var(--text-muted)]">:</span>
                  <span className="text-5xl md:text-7xl font-black font-display text-[var(--text)] tabular-nums">{partidoDb?.marcadorVisita ?? 0}</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-3">
                  {visLogo ? <img src={visLogo} alt="" className="w-20 h-20 object-contain logo-img" /> : <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">{visNombre.slice(0, 2).toUpperCase()}</div>}
                  <p className="text-sm font-bold text-[var(--text)] text-center">{visNombre}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 pb-3 text-[10px] text-[var(--text-muted)]"><RefreshCw className="h-3 w-3" /><span>Actualizado en tiempo real</span></div>
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-4">
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
                <><Trophy className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" /><p className="text-[var(--text-secondary)] font-medium">No hay partidos programados</p><p className="text-[var(--text-muted)] text-sm mt-1">Vuelve pronto para ver los próximos encuentros</p></>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-2xl mx-auto px-4 mt-6">
        <div className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[var(--border)]">
            <Swords className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{isLive ? 'Acción del Partido' : 'Información del Partido'}</h2>
          </div>
          <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
            {isLive ? <p>Eventos y comentarios durante la transmisión.</p> : proximoPartido ? (
              <div className="space-y-1 text-xs"><p>⚽ Jornada {proximoPartido.jornada}</p><p>🏟️ {proximoPartido.estadio || 'Por definir'}</p></div>
            ) : <p>No hay información disponible.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
