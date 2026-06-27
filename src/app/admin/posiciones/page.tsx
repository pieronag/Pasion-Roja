'use client';

import { useState } from 'react';
import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from '@/components/posiciones/league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPosicionesPage() {
  const { deportes } = useDeportes();
  const [selected, setSelected] = useState('');
  const activeDeporte = selected || deportes[0]?.id || '';
  const { tabla, loading } = usePosiciones(activeDeporte);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Posiciones</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setSelected(d.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            {d.icono} {d.nombre}
          </button>
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Tabla calculada automáticamente desde los resultados</p>
      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : tabla.length ? <LeagueTable equipos={tabla} /> : <EmptyState title="Sin datos" description="No hay partidos finalizados" />}
    </div>
  );
}
