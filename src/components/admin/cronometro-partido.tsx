'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Plus, ChevronRight, Trophy, Goal, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoTiempo } from '@/types/partido';

interface CronometroPartidoProps {
  estadoTiempo: EstadoTiempo;
  minutoDisplay: string;
  hayEmpate: boolean;
  puedeTE: boolean;
  puedePenales: boolean;
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
  pendiente: 'bg-gray-500/10 text-gray-600',
  primer_tiempo: 'bg-emerald-500/10 text-emerald-600',
  descanso: 'bg-amber-500/10 text-amber-600',
  segundo_tiempo: 'bg-emerald-500/10 text-emerald-600',
  te1: 'bg-orange-500/10 text-orange-600',
  descanso_te: 'bg-amber-500/10 text-amber-600',
  te2: 'bg-orange-500/10 text-orange-600',
  penales: 'bg-red-500/10 text-red-600',
  finalizado: 'bg-blue-500/10 text-blue-600',
};

export function CronometroPartido({
  estadoTiempo, minutoDisplay, hayEmpate, puedeTE, puedePenales,
  onIniciar1T, onDescanso, onIniciar2T, onTE1, onDescansoTE, onTE2, onPenales, onFinalizar,
}: CronometroPartidoProps) {

  const isLive = ['primer_tiempo', 'segundo_tiempo', 'te1', 'te2'].includes(estadoTiempo);

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
      {/* Estado actual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs font-semibold', colors[estadoTiempo])}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
            {labels[estadoTiempo]}
          </Badge>
          <span className="text-xl font-black font-display text-[var(--text)] tabular-nums">{minutoDisplay}</span>
        </div>
      </div>

      {/* Botones de control */}
      <div className="flex flex-wrap gap-2">
        {estadoTiempo === 'pendiente' && (
          <Button onClick={onIniciar1T} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 1er Tiempo
          </Button>
        )}

        {estadoTiempo === 'primer_tiempo' && (
          <Button onClick={onDescanso} size="sm" variant="outline">
            <Pause className="h-4 w-4 mr-1.5" /> Descanso
          </Button>
        )}

        {estadoTiempo === 'descanso' && (
          <Button onClick={onIniciar2T} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 2do Tiempo
          </Button>
        )}

        {estadoTiempo === 'segundo_tiempo' && (
          <Button onClick={onFinalizar} size="sm" variant="outline" className="border-red-400 text-red-500 hover:bg-red-500/10">
            <SkipForward className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}

        {/* Opciones tras finalizar 2do tiempo o TE2 (se muestran después de cambiar estado a descanso/pendiente temporal) */}
        {estadoTiempo === 'te1' && (
          <Button onClick={onDescansoTE} size="sm" variant="outline">
            <Pause className="h-4 w-4 mr-1.5" /> Descanso TE
          </Button>
        )}

        {estadoTiempo === 'descanso_te' && (
          <Button onClick={onTE2} size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Play className="h-4 w-4 mr-1.5" /> Iniciar 2da Parte TE
          </Button>
        )}

        {estadoTiempo === 'te2' && (
          <Button onClick={onFinalizar} size="sm" variant="outline" className="border-red-400 text-red-500 hover:bg-red-500/10">
            <SkipForward className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}

        {estadoTiempo === 'penales' && (
          <Button onClick={onFinalizar} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Trophy className="h-4 w-4 mr-1.5" /> Finalizar Partido
          </Button>
        )}
      </div>

      {/* Opciones post-partido (empate) */}
      {(puedeTE || puedePenales) && hayEmpate && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] w-full">El partido está empatado. Elige cómo continuar:</p>
          {puedeTE && (
            <Button onClick={onTE1} size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-1.5" /> Tiempo Extra
            </Button>
          )}
          {puedePenales && (
            <Button onClick={onPenales} size="sm" className="bg-red-600 hover:bg-red-700">
              <Goal className="h-4 w-4 mr-1.5" /> Penales
            </Button>
          )}
        </div>
      )}

      {estadoTiempo === 'finalizado' && (
        <div className="text-xs text-[var(--text-muted)] text-center py-1">
          Partido finalizado
        </div>
      )}
    </div>
  );
}
