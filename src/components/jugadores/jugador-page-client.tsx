'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader } from '@/components/shared/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Jugador } from '@/types/jugador';
import { ArrowLeft, Ruler, Weight, Cake, Flag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export function JugadorPageClient({ jugadorId }: { jugadorId: string }) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'jugadores', jugadorId)).then((snap) => {
      if (snap.exists()) setJugador({ id: snap.id, ...snap.data() } as Jugador);
      setLoading(false);
    });
  }, [jugadorId]);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full rounded-2xl mb-4" /></div>;
  if (!jugador) return <EmptyState title="Jugador no encontrado" />;

  const stats = jugador.estadisticasTemp || {};

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
            <div className="pt-2">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">
                {jugador.nombre} {jugador.apellido}
              </h1>
              <p className="text-[var(--text-secondary)]">#{jugador.numero} · {jugador.posicion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Ruler className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--text)]">{jugador.altura} cm</p>
          <p className="text-xs text-[var(--text-secondary)]">Altura</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Weight className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--text)]">{jugador.peso} kg</p>
          <p className="text-xs text-[var(--text-secondary)]">Peso</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Cake className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--text)]">{formatDate(jugador.fechaNacimiento)}</p>
          <p className="text-xs text-[var(--text-secondary)]">Nacimiento</p>
        </div>
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center">
          <Flag className="h-4 w-4 text-[var(--text-muted)] mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--text)]">{jugador.nacionalidad}</p>
          <p className="text-xs text-[var(--text-secondary)]">Nacionalidad</p>
        </div>
      </div>

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
