'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader } from '@/components/shared/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Jugador } from '@/types/jugador';
import type { Equipo } from '@/types/equipo';
import { ArrowLeft, Ruler, Weight, Cake, Flag, TrendingUp, Shield, DollarSign, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export function JugadorPageClient({ jugadorId }: { jugadorId: string }) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'jugadores', jugadorId)).then((snap) => {
      if (snap.exists()) setJugador({ id: snap.id, ...snap.data() } as Jugador);
      setLoading(false);
    });
  }, [jugadorId]);

  useEffect(() => {
    if (!jugador?.equipoId) return;
    getDoc(doc(db, 'equipos', jugador.equipoId)).then((snap) => {
      if (snap.exists()) setEquipo({ id: snap.id, ...snap.data() } as Equipo);
    });
  }, [jugador?.equipoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full rounded-2xl mb-4" /></div>;
  if (!jugador) return <EmptyState title="Jugador no encontrado" />;

  const stats = jugador.estadisticasTemp || {};
  const calcEdad = (fecha: number) => {
    if (!fecha) return '';
    const edad = Math.floor((Date.now() - fecha) / 31557600000);
    return `(${edad} años)`;
  };
  const fechaDisplay = jugador.fechaNacimiento
    ? new Date(jugador.fechaNacimiento).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href={`/equipos/${jugador.equipoId}`} className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Volver al equipo
      </Link>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] h-24" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-[var(--bg-card)] bg-[var(--bg-secondary)] overflow-hidden shadow-lg flex-shrink-0">
              {jugador.fotoBase64 ? (
                <img src={jugador.fotoBase64} alt={jugador.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[var(--text-muted)]">
                  {jugador.numero}
                </div>
              )}
            </div>
            <div className="pt-2 flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">
                    {jugador.nombre} {jugador.apellido}
                  </h1>
                  <p className="text-[var(--text-secondary)]">#{jugador.numero} · {jugador.posicion}</p>
                </div>
                {equipo && (
                  <Link href={`/equipos/${equipo.id}`} className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                    {equipo.logoBase64 && <img src={equipo.logoBase64} alt="" className="w-5 h-5 object-contain" />}
                    <span className="text-xs text-[var(--text-secondary)]">{equipo.nombre}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Cake className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-sm font-bold text-[var(--text)]">{fechaDisplay}</p>
          <p className="text-xs text-[var(--text-secondary)]">{calcEdad(jugador.fechaNacimiento)}</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Flag className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-sm font-bold text-[var(--text)]">{jugador.nacionalidad}</p>
          <p className="text-xs text-[var(--text-secondary)]">Nacionalidad</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Ruler className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-sm font-bold text-[var(--text)]">{jugador.altura ? `${jugador.altura} cm` : '—'}</p>
          <p className="text-xs text-[var(--text-secondary)]">Altura · {jugador.peso ? `${jugador.peso} kg` : '—'}</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <DollarSign className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-sm font-bold text-[var(--text)]">{jugador.valorMercado || '—'}</p>
          <p className="text-xs text-[var(--text-secondary)]">Valor mercado</p>
        </div>
      </div>

      {(jugador.contratoHasta || jugador.pie) && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {jugador.pie && (
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <p className="text-sm font-bold text-[var(--text)]">{jugador.pie}</p>
              <p className="text-xs text-[var(--text-secondary)]">Pie hábil</p>
            </div>
          )}
          {jugador.contratoHasta && (
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
              <div className="flex items-center justify-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                <p className="text-sm font-bold text-[var(--text)]">{new Date(jugador.contratoHasta).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Contrato hasta</p>
            </div>
          )}
        </div>
      )}

      {Object.keys(stats).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Estadísticas {jugador.temporadaActual}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
                <p className="text-2xl font-black text-[var(--text)]">{value}</p>
                <p className="text-xs text-[var(--text-secondary)] capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
