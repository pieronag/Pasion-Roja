'use client';

import type { Programa } from '@/types/programa';
import { ProgramCard } from './program-card';

export function ScheduleGrid({ programas }: { programas: Programa[] }) {
  if (!programas.length) {
    return <p className="text-sm text-[var(--text-muted)]">Sin programación disponible</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {programas.map((p) => <ProgramCard key={p.id} programa={p} />)}
    </div>
  );
}
