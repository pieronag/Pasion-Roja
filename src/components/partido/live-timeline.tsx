'use client';

import { useMarcador } from '@/hooks/use-marcador';
import { cn } from '@/lib/utils';
import { Swords, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

const eventosMock = [
  { id: '1', tipo: 'gol', equipo: 'local', jugador: 'Carlos Muñoz', minuto: '23', timestamp: Date.now() - 3600000 },
  { id: '2', tipo: 'tarjeta_amarilla', equipo: 'visita', jugador: 'Pedro Díaz', minuto: '41', timestamp: Date.now() - 1800000 },
  { id: '3', tipo: 'gol', equipo: 'visita', jugador: 'Luis Soto', minuto: '67', timestamp: Date.now() - 600000 },
];

const iconMap: Record<string, React.ReactNode> = {
  gol: <Swords className="h-4 w-4 text-rojo" />,
  tarjeta_amarilla: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  tarjeta_roja: <AlertTriangle className="h-4 w-4 text-red-600" />,
  cambio: <ArrowLeftRight className="h-4 w-4 text-blue-400" />,
};

const colorMap: Record<string, string> = {
  gol: 'border-rojo',
  tarjeta_amarilla: 'border-yellow-400',
  tarjeta_roja: 'border-red-600',
  cambio: 'border-blue-400',
};

export function LiveTimeline() {
  const { loading } = useMarcador();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!eventosMock.length) {
    return <EmptyState title="Sin eventos" description="No hay eventos registrados en este partido" />;
  }

  return (
    <div className="space-y-1 p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
        Cronología del Partido
      </h3>
      {eventosMock.map((evento, i) => (
        <div
          key={evento.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl border-l-4 bg-pizarra-claro/30 animate-slide-up',
            colorMap[evento.tipo]
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pizarra-claro flex items-center justify-center">
            {iconMap[evento.tipo]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{evento.jugador}</p>
            <p className="text-xs text-gray-500 capitalize">{evento.tipo.replace('_', ' ')}</p>
          </div>
          <span className="text-xs font-bold text-rojo font-mono">{evento.minuto}&apos;</span>
        </div>
      ))}
    </div>
  );
}
