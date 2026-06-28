'use client';

import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useDeportes } from '@/hooks/use-deportes';
import { ClubCard } from './club-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Shield } from 'lucide-react';

export function ClubesDestacados() {
  const { equiposMap, loading } = useEquiposMap();
  const { deportes } = useDeportes();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-[var(--radius)]" />
          <Skeleton className="h-20 rounded-[var(--radius)]" />
        </div>
      </div>
    );
  }

  const equipos = Object.values(equiposMap);
  const principal = equipos.find(e => e.esPrincipal);
  const otros = equipos
    .filter(e => !e.esPrincipal && e.activo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, 4);

  const getDeporteNombre = (deporteId: string) => deportes.find(d => d.id === deporteId)?.nombre || '';

  if (!principal && !otros.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold font-display text-[var(--text)] mb-4 tracking-tight flex items-center gap-2">
        <Shield className="h-5 w-5 text-[var(--accent)]" />
        <span className="text-[var(--accent)]">Clubes</span>
      </h2>

      {principal && (
        <div className="mb-3">
          <ClubCard equipo={principal} esPrincipal deporteNombre={getDeporteNombre(principal.deporteId)} />
        </div>
      )}

      {otros.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {otros.map((equipo) => (
            <ClubCard key={equipo.id} equipo={equipo} deporteNombre={getDeporteNombre(equipo.deporteId)} />
          ))}
        </div>
      )}
    </section>
  );
}
