'use client';

import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useDeportes } from '@/hooks/use-deportes';
import { ClubCard } from './club-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

export function ClubesDestacados() {
  const { equiposMap, loading } = useEquiposMap();
  const { deportes } = useDeportes();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-[var(--radius)]" />
        </div>
      </div>
    );
  }

  const equipos = Object.values(equiposMap);
  const principal = equipos.find(e => e.esPrincipal);

  // Filtrar equipos de Angol o que contengan "Malleco"
  const equiposAngol = equipos.filter(e =>
    !e.esPrincipal &&
    e.activo &&
    (
      e.nombre.toUpperCase().includes('MALLECO') ||
      e.ciudad?.toUpperCase().includes('ANGOL') ||
      e.ciudad?.toUpperCase().includes('MALLECO')
    )
  ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const getDeporteNombre = (deporteId: string) => deportes.find(d => d.id === deporteId)?.nombre || '';

  if (!principal && !equiposAngol.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold font-display text-[var(--text)] mb-4 tracking-tight flex items-center gap-2">
        <Shield className="h-5 w-5 text-[var(--accent)]" />
        <span className="text-[var(--accent)]">Clubes de Angol</span>
      </h2>

      {principal && (
        <div className="mb-3">
          <ClubCard equipo={principal} esPrincipal deporteNombre={getDeporteNombre(principal.deporteId)} />
        </div>
      )}

      {equiposAngol.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {equiposAngol.map((equipo) => (
            <ClubCard key={equipo.id} equipo={equipo} deporteNombre={getDeporteNombre(equipo.deporteId)} />
          ))}
        </div>
      )}
    </section>
  );
}
