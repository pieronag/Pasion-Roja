'use client';

import { useState } from 'react';
import { useProgramacion } from '@/hooks/use-programacion';
import { ScheduleGrid } from './schedule-grid';
import { Loader } from '@/components/shared/loader';
import { CalendarDays, Radio, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProgramacionPageClient() {
  const [tab, setTab] = useState<'radio' | 'tv'>('radio');
  const { programas, loading } = useProgramacion(tab);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Programación</h1>
      </div>
      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab('radio')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors', tab === 'radio' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}><Radio className="h-4 w-4" /> Radio</button>
        <button onClick={() => setTab('tv')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors', tab === 'tv' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}><Tv className="h-4 w-4" /> TV</button>
      </div>
      {loading ? <Loader /> : <ScheduleGrid programas={programas} />}
    </div>
  );
}
