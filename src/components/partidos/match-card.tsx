'use client';

import Link from 'next/link';
import type { Partido } from '@/types/partido';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function MatchCard({ partido }: { partido: Partido }) {
  const isLive = partido.estado === 'en_vivo';
  const isFinished = partido.estado === 'finalizado';
  const isScheduled = partido.estado === 'programado';

  return (
    <Link
      href={`/partidos/${partido.id}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all group',
        isLive && 'border-[var(--accent)] bg-[var(--accent-light)]'
      )}
    >
      <div className="flex-1 text-right min-w-0">
        <p className={cn('text-sm font-semibold truncate', isLive && 'text-[var(--accent)]')}>{partido.equipoLocalNombre}</p>
      </div>
      <div className="flex-shrink-0 text-center min-w-[60px]">
        {isFinished || isLive ? (
          <div className="flex items-center gap-1 justify-center">
            <span className="text-xl font-black font-display">{partido.marcadorLocal}</span>
            <span className="text-[var(--text-muted)] font-bold">:</span>
            <span className="text-xl font-black font-display">{partido.marcadorVisita}</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {format(partido.fecha, 'HH:mm', { locale: es })}
          </span>
        )}
        {isLive && <div className="text-[10px] text-[var(--accent)] font-bold">{partido.minuto}'</div>}
        {isScheduled && <div className="text-[10px] text-[var(--text-muted)]">{format(partido.fecha, 'dd/MM', { locale: es })}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold truncate', isLive && 'text-[var(--accent)]')}>{partido.equipoVisitaNombre}</p>
      </div>
      {isLive && <Badge variant="live" className="flex-shrink-0 text-[10px]">EN VIVO</Badge>}
    </Link>
  );
}
