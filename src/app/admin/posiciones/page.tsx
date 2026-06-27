'use client';

import { useState } from 'react';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from '@/components/posiciones/league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPosicionesPage() {
  const { deportes } = useDeportes();
  const [selected, setSelected] = useState('');
  const activeDeporte = selected || deportes[0]?.id || '';
  const { tabla, loading } = usePosiciones(activeDeporte);

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Posiciones</h2><p className="text-sm text-[var(--text-secondary)]">Tablas calculadas automáticamente desde los resultados</p></div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        <CardContent className="p-3">
          <div className="flex gap-1.5 flex-wrap">
            {deportes.map((d) => (
              <button key={d.id} onClick={() => setSelected(d.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}>
                <SportIcon sport={d.icono} size={14} /> {d.nombre}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><RefreshCw className="h-3.5 w-3.5" /> Datos actualizados en tiempo real desde los resultados</div>

      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : tabla.length ? <LeagueTable equipos={tabla} /> : <EmptyState title="Sin datos" description="No hay partidos finalizados en este deporte" />}
    </div>
  );
}
