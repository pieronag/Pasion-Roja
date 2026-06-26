'use client';

import { useState, useEffect, useRef } from 'react';
import { useMarcador } from '@/hooks/use-marcador';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Trophy, Clock, RefreshCw } from 'lucide-react';

export function MarcadorEnVivo() {
  const { partido, loading, error } = useMarcador();
  const [goalFlash, setGoalFlash] = useState(false);
  const prevMarcador = useRef({ local: 0, vis: 0 });

  useEffect(() => {
    if (!partido) return;
    if (
      partido.marcadorLocal > prevMarcador.current.local ||
      partido.marcadorVis > prevMarcador.current.vis
    ) {
      setGoalFlash(true);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setGoalFlash(false), 800);
    }
    prevMarcador.current = {
      local: partido.marcadorLocal,
      vis: partido.marcadorVis,
    };
  }, [partido?.marcadorLocal, partido?.marcadorVis]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !partido) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border-2 border-dashed border-pizarra-claro p-8 text-center">
          <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No hay partido en curso</p>
          <p className="text-gray-600 text-sm mt-1">Vuelve pronto para ver el marcador en vivo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        className={cn(
          'relative rounded-2xl border-2 border-rojo/30 bg-gradient-to-br from-pizarra-claro to-pizarra p-6 shadow-2xl shadow-rojo/10 transition-all duration-300',
          goalFlash && 'animate-goal-flash'
        )}
      >
        <div className="absolute top-3 left-3">
          <BadgeEnVivo size="sm" />
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {partido.minuto}&apos;
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-6 gap-4">
          <div className="flex-1 text-right">
            <p className="text-lg md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-[200px] ml-auto">
              {partido.equipoLocal}
            </p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-5xl md:text-7xl font-black font-display text-white tabular-nums">
              {partido.marcadorLocal}
            </span>
            <span className="text-3xl md:text-4xl font-black text-gray-600">:</span>
            <span className="text-5xl md:text-7xl font-black font-display text-white tabular-nums">
              {partido.marcadorVis}
            </span>
          </div>

          <div className="flex-1">
            <p className="text-lg md:text-xl font-bold text-white truncate max-w-[120px] md:max-w-[200px]">
              {partido.equipoVis}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-500">
          <RefreshCw className="h-3 w-3" />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>
    </div>
  );
}
