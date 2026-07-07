'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Plus, Trophy, Goal, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoTiempo } from '@/types/partido';

interface CronometroPartidoProps {
  estadoTiempo: EstadoTiempo;
  onIniciar1T: () => void;
  onDescanso: () => void;
  onIniciar2T: () => void;
  onTE1: () => void;
  onDescansoTE: () => void;
  onTE2: () => void;
  onPenales: () => void;
  onFinalizar: () => void;
}

const labels: Record<EstadoTiempo, string> = {
  pendiente: 'Pendiente',
  primer_tiempo: '1er Tiempo',
  descanso: 'Descanso',
  segundo_tiempo: '2do Tiempo',
  te1: 'Tiempo Extra 1ra',
  descanso_te: 'Descanso TE',
  te2: 'Tiempo Extra 2da',
  penales: 'Penales',
  finalizado: 'Finalizado',
};

const colors: Record<EstadoTiempo, string> = {
  pendiente: 'bg-white/5 text-white/40',
  primer_tiempo: 'bg-emerald-500/15 text-emerald-400',
  descanso: 'bg-amber-500/15 text-amber-400',
  segundo_tiempo: 'bg-emerald-500/15 text-emerald-400',
  te1: 'bg-orange-500/15 text-orange-400',
  descanso_te: 'bg-amber-500/15 text-amber-400',
  te2: 'bg-orange-500/15 text-orange-400',
  penales: 'bg-red-500/15 text-red-400',
  finalizado: 'bg-blue-500/15 text-blue-400',
};

const btnSporty = 'font-bold shadow-lg border transition-all duration-200 hover:scale-[1.02] active:scale-95';

export function CronometroPartido({
  estadoTiempo,
  onIniciar1T, onDescanso, onIniciar2T, onTE1, onDescansoTE, onTE2, onPenales, onFinalizar,
}: CronometroPartidoProps) {

  const isLive = ['primer_tiempo', 'segundo_tiempo', 'te1', 'te2'].includes(estadoTiempo);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
      <div className="flex items-center">
        <Badge className={cn('text-xs font-semibold', colors[estadoTiempo])}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
          {labels[estadoTiempo]}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {estadoTiempo === 'pendiente' && (
          <Button onClick={onIniciar1T} size="sm" className={`${btnSporty} bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/30 border-emerald-500/30`}>
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 1er Tiempo
          </Button>
        )}

        {estadoTiempo === 'primer_tiempo' && (
          <Button onClick={onDescanso} size="sm" className={`${btnSporty} bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-600/30 border-amber-500/30`}>
            <Pause className="h-4 w-4 mr-1.5" /> Descanso
          </Button>
        )}

        {estadoTiempo === 'descanso' && (
          <Button onClick={onIniciar2T} size="sm" className={`${btnSporty} bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/30 border-emerald-500/30`}>
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 2do Tiempo
          </Button>
        )}

        {estadoTiempo === 'segundo_tiempo' && (
          <Button onClick={onFinalizar} size="sm" className={`${btnSporty} bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/30 border-red-500/30`}>
            <SkipForward className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}

        {estadoTiempo === 'te1' && (
          <Button onClick={onDescansoTE} size="sm" className={`${btnSporty} bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-600/30 border-amber-500/30`}>
            <Pause className="h-4 w-4 mr-1.5" /> Descanso TE
          </Button>
        )}

        {estadoTiempo === 'descanso_te' && (
          <Button onClick={onTE2} size="sm" className={`${btnSporty} bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-600/30 border-orange-500/30`}>
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 2da TE
          </Button>
        )}

        {estadoTiempo === 'te2' && (
          <Button onClick={onFinalizar} size="sm" className={`${btnSporty} bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/30 border-red-500/30`}>
            <SkipForward className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}

        {estadoTiempo === 'penales' && (
          <Button onClick={onFinalizar} size="sm" className={`${btnSporty} bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-600/30 border-blue-500/30`}>
            <Trophy className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}
      </div>

      {estadoTiempo === 'finalizado' && (
        <div className="text-xs text-white/30 text-center py-1">Partido finalizado</div>
      )}
    </div>
  );
}
