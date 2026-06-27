'use client';

import { RadioPlayer } from './radio-player';
import { useProgramacion } from '@/hooks/use-programacion';
import { ProgramCard } from '@/components/programacion/program-card';
import { ScheduleGrid } from '@/components/programacion/schedule-grid';
import { Loader } from '@/components/shared/loader';
import { Radio } from 'lucide-react';

export function RadioPageClient() {
  const { programas, loading } = useProgramacion('radio');
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Radio <span className="text-[var(--accent)]">Online</span></h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1"><RadioPlayer stationName="Pasión Roja Radio" /></div>
        <div className="md:col-span-2">
          <h2 className="font-bold text-lg text-[var(--text)] mb-3">Programación</h2>
          {loading ? <Loader size="sm" /> : <ScheduleGrid programas={programas} />}
        </div>
      </div>
    </div>
  );
}
