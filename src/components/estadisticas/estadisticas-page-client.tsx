'use client';

import { useState } from 'react';
import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
import { useEstadisticas } from '@/hooks/use-estadisticas';
import { TopScorers } from './top-scorers';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EstadisticasPageClient() {
  const { deportes } = useDeportes();
  const [selectedDeporte, setSelectedDeporte] = useState('');
  const activeDeporte = selectedDeporte || deportes[0]?.id || '';
  const { rankings, loading } = useEstadisticas(activeDeporte, 'goles');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]"><span className="text-[var(--accent)]">Estadísticas</span></h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setSelectedDeporte(d.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
            <span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={16} /><span>{d.nombre}</span></span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-[var(--accent)]" /><h2 className="font-bold text-lg text-[var(--text)]">Goleadores</h2></div>
      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : rankings.length ? <TopScorers rankings={rankings} statKey="goles" /> : <EmptyState title="Sin datos" description="No hay estadísticas disponibles" />}
    </div>
  );
}
