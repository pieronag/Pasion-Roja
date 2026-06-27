'use client';

import type { Partido } from '@/types/partido';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MatchScoreboardProps {
  partido: Partido;
  fullWidth?: boolean;
}

export function MatchScoreboard({ partido, fullWidth }: MatchScoreboardProps) {
  const isLive = partido.estado === 'en_vivo';
  const isFinished = partido.estado === 'finalizado';

  return (
    <div className={cn(
      'relative rounded-2xl border-2 overflow-hidden',
      isLive ? 'border-[var(--accent)]' : 'border-[var(--border)]',
      fullWidth ? 'w-full' : 'max-w-2xl mx-auto'
    )}>
      <div className={cn(
        'p-6 md:p-8 text-white',
        isLive
          ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]'
          : 'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)]'
      )}>
        {isLive && (
          <div className="flex justify-center mb-4">
            <BadgeEnVivo size="md" />
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className={cn('flex-1 text-right', !isLive && 'text-[var(--text)]')}>
            <p className="text-lg md:text-xl font-bold truncate max-w-[140px] md:max-w-[200px] ml-auto">
              {partido.equipoLocalNombre}
            </p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className={cn(
              'text-5xl md:text-7xl font-black font-display tabular-nums',
              isLive ? 'text-white' : 'text-[var(--text)]'
            )}>
              {partido.marcadorLocal}
            </span>
            <span className={cn(
              'text-3xl md:text-4xl font-black',
              isLive ? 'text-white/50' : 'text-[var(--text-muted)]'
            )}>:</span>
            <span className={cn(
              'text-5xl md:text-7xl font-black font-display tabular-nums',
              isLive ? 'text-white' : 'text-[var(--text)]'
            )}>
              {partido.marcadorVisita}
            </span>
          </div>

          <div className={cn('flex-1', !isLive && 'text-[var(--text)]')}>
            <p className="text-lg md:text-xl font-bold truncate max-w-[140px] md:max-w-[200px]">
              {partido.equipoVisitaNombre}
            </p>
          </div>
        </div>

        {isLive && (
          <div className="flex items-center justify-center gap-1 mt-4">
            <Clock className="h-4 w-4 text-white/70" />
            <span className="text-lg font-bold">{partido.minuto}'</span>
          </div>
        )}

        {!isLive && partido.estado === 'programado' && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[var(--text-secondary)]">
            <Calendar className="h-4 w-4" />
            <span>{format(partido.fecha, "EEEE d 'de' MMMM '·' HH:mm", { locale: es })}</span>
          </div>
        )}

        {(partido.estadio) && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
            <MapPin className="h-3 w-3" /> {partido.estadio}
          </div>
        )}
      </div>
    </div>
  );
}
