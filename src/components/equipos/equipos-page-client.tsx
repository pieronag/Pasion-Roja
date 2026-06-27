'use client';

import { useState } from 'react';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
import { EquipoCard } from './equipo-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EquiposPageClient() {
  const { equipos, loading } = useEquipos();
  const { deportes } = useDeportes();
  const [filterDeporte, setFilterDeporte] = useState<string>('');

  const filtered = filterDeporte ? equipos.filter((e) => e.deporteId === filterDeporte) : equipos;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">
          <span className="text-[var(--accent)]">Equipos</span>
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button onClick={() => setFilterDeporte('')} className={cn('px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[44px] transition-colors', !filterDeporte ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>Todos</button>
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setFilterDeporte(d.id)} className={cn('px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[44px] transition-colors', filterDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={16} /><span>{d.nombre}</span></span></button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{filtered.map((e) => <EquipoCard key={e.id} equipo={e} />)}</div>
      ) : <EmptyState title="Sin equipos" />}
    </div>
  );
}
