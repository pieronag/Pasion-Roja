'use client';

import { useState } from 'react';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { SportIcon } from '@/components/shared/sport-icons';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from './league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PosicionesPageClient() {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const [selectedDeporte, setSelectedDeporte] = useState('');
  const { tabla, loading } = usePosiciones(selectedDeporte || deportes[0]?.id || '');

  const activeDeporte = selectedDeporte || deportes[0]?.id;
  const equipoPrincipalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Tabla de <span className="text-[var(--accent)]">Posiciones</span></h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setSelectedDeporte(d.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            <span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={16} /><span>{d.nombre}</span></span>
          </button>
        ))}
      </div>

      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : tabla.length ? (
        <LeagueTable equipos={tabla} equipoPrincipalId={equipoPrincipalId} />
      ) : (
        <EmptyState title="Sin datos" description="No hay partidos finalizados en este deporte" />
      )}
    </div>
  );
}
