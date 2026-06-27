'use client';

import { useState, useMemo } from 'react';
import type { Programa } from '@/types/programa';
import { ProgramCard } from './program-card';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface ScheduleGridProps {
  programas: Programa[];
}

export function ScheduleGrid({ programas }: ScheduleGridProps) {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);

  const filtered = useMemo(() => {
    return programas.filter((p) => p.horarios.some((h) => h.dia === selectedDay));
  }, [programas, selectedDay]);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
        {diasSemana.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[44px]',
              selectedDay === i
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {d}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="space-y-2">{filtered.map((p) => <ProgramCard key={p.id} programa={p} />)}</div>
      ) : (
        <EmptyState title="Sin programación" description={`No hay programas para ${diasSemana[selectedDay]}`} />
      )}
    </div>
  );
}
