'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { JugadorCard } from '@/components/jugadores/jugador-card';
import { Loader } from '@/components/shared/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Equipo } from '@/types/equipo';
import type { Partido } from '@/types/partido';
import { ArrowLeft, Calendar, Users, MapPin, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EquipoPageClient({ equipoId }: { equipoId: string }) {
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [tab, setTab] = useState<'proximos' | 'resultados'>('proximos');
  const { equiposMap } = useEquiposMap();

  useEffect(() => {
    getDoc(doc(db, 'equipos', equipoId)).then((snap) => {
      if (snap.exists()) setEquipo({ id: snap.id, ...snap.data() } as Equipo);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [equipoId]);

  // Load jugadores directly for this equipo
  useEffect(() => {
    if (!equipoId) return;
    const q = query(collection(db, 'jugadores'), where('equipoId', '==', equipoId), orderBy('numero', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setJugadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [equipoId]);

  // Load matches for this equipo (local + visita)
  useEffect(() => {
    if (!equipoId) return;
    const localQ = query(collection(db, 'partidos'), where('equipoLocalId', '==', equipoId));
    const visitaQ = query(collection(db, 'partidos'), where('equipoVisitaId', '==', equipoId));

    const unsubLocal = onSnapshot(localQ, (snap) => {
      setPartidos((prev) => {
        const local = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
        const merged = [...local, ...prev.filter(p => !local.some(l => l.id === p.id))];
        return merged;
      });
    });

    const unsubVisita = onSnapshot(visitaQ, (snap) => {
      setPartidos((prev) => {
        const visita = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
        const merged = [...visita, ...prev.filter(p => !visita.some(v => v.id === p.id))];
        return merged;
      });
    });

    return () => { unsubLocal(); unsubVisita(); };
  }, [equipoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-48 w-full rounded-2xl mb-4" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!equipo) return <EmptyState title="Equipo no encontrado" />;

  const partidosProximos = partidos.filter(p => p.estado === 'programado').sort((a, b) => a.fecha - b.fecha);
  const partidosPasados = partidos.filter(p => p.estado === 'finalizado' || p.estado === 'en_vivo').sort((a, b) => b.fecha - a.fecha);

  const localEquipo = (id: string) => equiposMap[id];
  const logo = (id: string) => localEquipo(id)?.logoBase64;
  const color = (id: string) => localEquipo(id)?.colorPrimario;

  const gruposPosicion: Record<string, { label: string; jugadores: any[] }> = {
    Portero: { label: 'Porteros', jugadores: [] },
    Defensa: { label: 'Defensas', jugadores: [] },
    Mediocampista: { label: 'Mediocampistas', jugadores: [] },
    Delantero: { label: 'Delanteros', jugadores: [] },
    Otros: { label: 'Otros', jugadores: [] },
  };

  jugadores.forEach((j: any) => {
    const p = (j.posicion || '').toLowerCase();
    let key = Object.keys(gruposPosicion).find(k => k.toLowerCase() !== 'otros' && p === k.toLowerCase());
    if (!key) key = Object.keys(gruposPosicion).find(k => k.toLowerCase() !== 'otros' && p.includes(k.toLowerCase()));
    if (!key) key = 'Otros';
    gruposPosicion[key].jugadores.push(j);
  });

  const ordenPosicion = ['Portero', 'Defensa', 'Mediocampista', 'Delantero', 'Otros'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${equipo.colorPrimario || '#E11D48'}, ${equipo.colorSecundario || '#0F172A'})` }}>
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-3 bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-sm w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </button>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            {equipo.logoBase64 ? <img src={equipo.logoBase64} alt={equipo.nombre} className="w-20 h-20 object-contain logo-img" /> : <span className="text-3xl font-black">{equipo.nombreCorto?.slice(0, 3).toUpperCase()}</span>}
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
        <div className="flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Plantilla ({jugadores.length})</h2></div>
        {jugadores.length ? (
          <div className="space-y-6">
            {ordenPosicion.map((key) => {
              const grupo = gruposPosicion[key];
              if (!grupo.jugadores.length) return null;
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{grupo.label}</h3>
                    <span className="text-[11px] text-[var(--text-muted)] ml-auto">({grupo.jugadores.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {grupo.jugadores.sort((a: any, b: any) => (a.numero || 0) - (b.numero || 0)).map((j: any) => <JugadorCard key={j.id} jugador={j} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState title="Sin jugadores" />}
      </div>

      {/* Partidos */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Calendar className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Partidos</h2></div>
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
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                  {/* Escudos */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {logo(p.equipoLocalId) ? <img src={logo(p.equipoLocalId)} alt="" className="w-7 h-7 object-contain logo-img" /> : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: color(p.equipoLocalId) || '#64748B' }}>{p.equipoLocalNombre?.[0]}</div>}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">vs</span>
                    <div className="w-8 h-8 flex items-center justify-center">
                      {logo(p.equipoVisitaId) ? <img src={logo(p.equipoVisitaId)} alt="" className="w-7 h-7 object-contain logo-img" /> : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: color(p.equipoVisitaId) || '#64748B' }}>{p.equipoVisitaNombre?.[0]}</div>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">{new Date(p.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      <span className={p.equipoLocalId === equipo.id ? 'text-[var(--accent)]' : ''}>{logo(p.equipoLocalId) ? '' : p.equipoLocalNombre}</span>
                      <span className={p.equipoLocalId === equipo.id ? 'text-[var(--accent)] font-bold' : ''}>{p.equipoLocalNombre}</span>
                      <span className="text-[var(--text-muted)] mx-1.5">vs</span>
                      <span className={p.equipoVisitaId === equipo.id ? 'text-[var(--accent)] font-bold' : ''}>{p.equipoVisitaNombre}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-[var(--accent)]">Jornada {p.jornada}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{p.estadio || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Sin próximos partidos" />
        ) : (
          partidosPasados.length ? (
            <div className="space-y-2">
              {partidosPasados.map((p) => {
                const esLocal = p.equipoLocalId === equipo.id;
                const esGanado = esLocal ? p.marcadorLocal > p.marcadorVisita : p.marcadorVisita > p.marcadorLocal;
                const esEmpate = p.marcadorLocal === p.marcadorVisita;
                const badgeResult = esEmpate ? 'Empatado' : esGanado ? 'Ganado' : 'Perdido';
                const badgeColor = esEmpate ? 'var(--warning)' : esGanado ? 'var(--success)' : 'var(--error)';
                return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {logo(p.equipoLocalId) ? <img src={logo(p.equipoLocalId)} alt="" className="w-7 h-7 object-contain logo-img" /> : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: color(p.equipoLocalId) || '#64748B' }}>{p.equipoLocalNombre?.[0]}</div>}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">vs</span>
                    <div className="w-8 h-8 flex items-center justify-center">
                      {logo(p.equipoVisitaId) ? <img src={logo(p.equipoVisitaId)} alt="" className="w-7 h-7 object-contain logo-img" /> : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: color(p.equipoVisitaId) || '#64748B' }}>{p.equipoVisitaNombre?.[0]}</div>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)]">{new Date(p.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      <span className={esLocal ? 'text-[var(--accent)] font-bold' : ''}>{p.equipoLocalNombre}</span>
                      <span className="text-[var(--text-muted)] mx-1.5">vs</span>
                      <span className={!esLocal ? 'text-[var(--accent)] font-bold' : ''}>{p.equipoVisitaNombre}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className={`text-xl font-black font-display ${esLocal && esGanado ? 'text-[var(--success)]' : esLocal && !esGanado && !esEmpate ? 'text-[var(--error)]' : ''}`}>{p.marcadorLocal}</span>
                      <span className="text-xs text-[var(--text-muted)] mx-1">-</span>
                      <span className={`text-xl font-black font-display ${!esLocal && esGanado ? 'text-[var(--success)]' : !esLocal && !esGanado && !esEmpate ? 'text-[var(--error)]' : ''}`}>{p.marcadorVisita}</span>
                    </div>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: badgeColor }}>{badgeResult}</span>
                  </div>
                </div>
              )})}
            </div>
          ) : <EmptyState title="Sin resultados" />
        )}
      </div>
    </div>
  );
}
