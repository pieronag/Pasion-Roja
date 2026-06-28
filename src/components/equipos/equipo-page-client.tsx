'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useJugadores } from '@/hooks/use-jugadores';
import { usePartidos } from '@/hooks/use-partidos';
import { JugadorCard } from '@/components/jugadores/jugador-card';
import { MatchCard } from '@/components/partidos/match-card';
import { Loader } from '@/components/shared/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Equipo } from '@/types/equipo';
import { ArrowLeft, Calendar, Users, MapPin, CalendarDays } from 'lucide-react';
import Link from 'next/link';

interface Props {
  equipoId: string;
}

export function EquipoPageClient({ equipoId }: Props) {
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);
  const { jugadores } = useJugadores(equipo?.id || '');
  const { partidos } = usePartidos({ max: 10 });

  useEffect(() => {
    getDoc(doc(db, 'equipos', equipoId)).then((snap) => {
      if (snap.exists()) setEquipo({ id: snap.id, ...snap.data() } as Equipo);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [equipoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-48 w-full rounded-2xl mb-4" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!equipo) return <EmptyState title="Equipo no encontrado" />;

  const partidosEquipo = partidos.filter(
    (p) => p.equipoLocalId === equipo.id || p.equipoVisitaId === equipo.id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/deportes" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div
        className="rounded-2xl p-6 md:p-8 mb-6 text-white"
        style={{ background: `linear-gradient(135deg, ${equipo.colorPrimario || '#E11D48'}, ${equipo.colorSecundario || '#0F172A'})` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
            {equipo.logoBase64 ? (
              <img src={equipo.logoBase64} alt={equipo.nombre} className="w-16 h-16 object-contain logo-img" />
            ) : (
              <span className="text-3xl font-black">{equipo.nombreCorto?.slice(0, 3).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display">{equipo.nombre}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{equipo.ciudad || equipo.estadio}</span>
              {equipo.fundacion ? <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Fundado {equipo.fundacion}</span> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Plantilla ({jugadores.length})</h2>
          </div>
          {jugadores.length ? (
            <div className="space-y-2">{jugadores.map((j) => <JugadorCard key={j.id} jugador={j} />)}</div>
          ) : <EmptyState title="Sin jugadores" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text)]">Partidos</h2>
          </div>
          {partidosEquipo.length ? (
            <div className="space-y-2">{partidosEquipo.map((p) => <MatchCard key={p.id} partido={p} />)}</div>
          ) : <EmptyState title="Sin partidos registrados" />}
        </div>
      </div>
    </div>
  );
}
