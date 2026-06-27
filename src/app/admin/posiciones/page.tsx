'use client';

import { useState } from 'react';
import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from '@/components/posiciones/league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPosicionesPage() {
  const { deportes } = useDeportes();
  const [selected, setSelected] = useState('');
  const activeDeporte = selected || deportes[0]?.id || '';
  const { tabla, loading } = usePosiciones(activeDeporte);

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Posiciones</h1><p className="text-sm text-[var(--text-secondary)]">Tablas de posiciones calculadas automáticamente</p></div>

      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {deportes.map((d) => (
              <button key={d.id} onClick={() => setSelected(d.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}>
                {d.icono} {d.nombre}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><RefreshCw className="h-3.5 w-3.5" /> Tabla calculada automáticamente desde los resultados registrados</div>

      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : tabla.length ? <LeagueTable equipos={tabla} /> : <EmptyState title="Sin datos" description="No hay partidos finalizados en este deporte" />}
    </div>
  );
}
