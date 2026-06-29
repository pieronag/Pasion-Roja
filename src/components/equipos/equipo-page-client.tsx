'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, limit as fLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useJugadores } from '@/hooks/use-jugadores';
import { JugadorCard } from '@/components/jugadores/jugador-card';
import { Loader } from '@/components/shared/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Equipo } from '@/types/equipo';
import type { Partido } from '@/types/partido';
import { ArrowLeft, Calendar, Users, MapPin, CalendarDays, Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn, equipoUrl } from '@/lib/utils';

export function EquipoPageClient({ equipoId }: { equipoId: string }) {
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [tab, setTab] = useState<'proximos' | 'resultados'>('proximos');
  const { jugadores } = useJugadores(equipo?.id || '');

  useEffect(() => {
    getDoc(doc(db, 'equipos', equipoId)).then((snap) => {
      if (snap.exists()) setEquipo({ id: snap.id, ...snap.data() } as Equipo);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [equipoId]);

  // Load matches for this team (both as local and visitor)
  useEffect(() => {
    if (!equipoId) return;
    const q = query(
      collection(db, 'partidos'),
      orderBy('fecha', 'desc'),
      fLimit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      setPartidos(all.filter(p => p.equipoLocalId === equipoId || p.equipoVisitaId === equipoId));
    }, () => {});
    return () => unsub();
  }, [equipoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-48 w-full rounded-2xl mb-4" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!equipo) return <EmptyState title="Equipo no encontrado" />;

  const partidosProximos = partidos.filter(p => p.estado === 'programado').sort((a, b) => a.fecha - b.fecha);
  const partidosPasados = partidos.filter(p => p.estado === 'finalizado' || p.estado === 'en_vivo').sort((a, b) => b.fecha - a.fecha);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header con gradient */}
      <div className="rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${equipo.colorPrimario || '#E11D48'}, ${equipo.colorSecundario || '#0F172A'})` }}>
        <Link href="/deportes" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-3 bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-sm w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            {equipo.logoBase64 ? (
              <img src={equipo.logoBase64} alt={equipo.nombre} className="w-20 h-20 object-contain logo-img" />
            ) : (
              <span className="text-3xl font-black">{equipo.nombreCorto?.slice(0, 3).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-black font-display drop-shadow-lg">{equipo.nombre}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{equipo.ciudad || equipo.estadio || '—'}</span>
              {equipo.fundacion ? <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Fundado {equipo.fundacion}</span> : null}
              {equipo.entrenador ? <span>DT: {equipo.entrenador}</span> : null}
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{jugadores.length} jugadores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plantilla */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-lg font-bold text-[var(--text)]">Plantilla ({jugadores.length})</h2>
        </div>
        {jugadores.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {jugadores.sort((a, b) => (a.numero || 0) - (b.numero || 0)).map((j) => <JugadorCard key={j.id} jugador={j} />)}
          </div>
        ) : <EmptyState title="Sin jugadores" />}
      </div>

      {/* Partidos tabs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-lg font-bold text-[var(--text)]">Partidos</h2>
        </div>

        <div className="flex gap-1 mb-4">
          <button onClick={() => setTab('proximos')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'proximos' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            Próximos ({partidosProximos.length})
          </button>
          <button onClick={() => setTab('resultados')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'resultados' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            Resultados ({partidosPasados.length})
          </button>
        </div>

        {tab === 'proximos' ? (
          partidosProximos.length ? (
            <div className="space-y-2">
              {partidosProximos.map((p) => (
                <Link key={p.id} href={`/partidos/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(p.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      <span className={p.equipoLocalId === equipo.id ? 'text-[var(--accent)]' : ''}>{p.equipoLocalNombre}</span>
                      <span className="text-[var(--text-muted)] mx-1.5">vs</span>
                      <span className={p.equipoVisitaId === equipo.id ? 'text-[var(--accent)]' : ''}>{p.equipoVisitaNombre}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-[var(--accent)]">J{p.jornada}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{p.estadio || '—'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </Link>
              ))}
            </div>
          ) : <EmptyState title="Sin próximos partidos" />
        ) : (
          partidosPasados.length ? (
            <div className="space-y-2">
              {partidosPasados.map((p) => (
                <Link key={p.id} href={`/partidos/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(p.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      <span className={p.equipoLocalId === equipo.id ? 'text-[var(--accent)]' : ''}>{p.equipoLocalNombre}</span>
                      <span className="text-[var(--text-muted)] mx-1.5">vs</span>
                      <span className={p.equipoVisitaId === equipo.id ? 'text-[var(--accent)]' : ''}>{p.equipoVisitaNombre}</span>
                    </p>
                  </div>
                  <div className="text-center flex-shrink-0 px-3">
                    <span className="text-xl font-black font-display text-[var(--text)]">{p.marcadorLocal}</span>
                    <span className="text-xs text-[var(--text-muted)] mx-1">-</span>
                    <span className="text-xl font-black font-display text-[var(--text)]">{p.marcadorVisita}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </Link>
              ))}
            </div>
          ) : <EmptyState title="Sin resultados" />
        )}
      </div>
    </div>
  );
}
