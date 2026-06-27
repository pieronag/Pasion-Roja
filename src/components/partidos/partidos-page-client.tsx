'use client';

import { useState } from 'react';
import { usePartidos } from '@/hooks/use-partidos';
import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
import { MatchCard } from './match-card';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'proximos' | 'resultados' | 'en_vivo';

export function PartidosPageClient() {
  const [tab, setTab] = useState<Tab>('proximos');
  const { partidos, loading } = usePartidos({ max: 50 });
  const { deportes } = useDeportes();
  const [filterDeporte, setFilterDeporte] = useState('');

  const filtered = partidos.filter((p) => {
    if (filterDeporte && p.deporteId !== filterDeporte) return false;
    if (tab === 'en_vivo') return p.estado === 'en_vivo';
    if (tab === 'proximos') return p.estado === 'programado';
    if (tab === 'resultados') return p.estado === 'finalizado';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Partidos</h1>
      </div>

      <div className="flex gap-1 mb-4">
        {(['en_vivo', 'proximos', 'resultados'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]', tab === t ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
{t === 'en_vivo' ? '🔴 En Vivo' : t === 'proximos' ? 'Próximos' : 'Resultados'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button onClick={() => setFilterDeporte('')} className={cn('px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[44px]', !filterDeporte ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>Todos</button>
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setFilterDeporte(d.id)} className={cn('px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[44px]', filterDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={16} /><span>{d.nombre}</span></span></button>
        ))}
      </div>

      {loading ? <Loader size="lg" /> : filtered.length ? (
        <div className="space-y-2">{filtered.map((p) => <MatchCard key={p.id} partido={p} />)}</div>
      ) : <EmptyState title="Sin partidos" description={tab === 'en_vivo' ? 'No hay partidos en vivo ahora' : tab === 'proximos' ? 'No hay partidos programados' : 'No hay resultados recientes'} />}
    </div>
  );
}
