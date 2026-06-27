'use client';

import { TVPlayer } from './tv-player';
import { useProgramacion } from '@/hooks/use-programacion';
import { ProgramCard } from '@/components/programacion/program-card';
import { Loader } from '@/components/shared/loader';
import { Tv } from 'lucide-react';

export function TVPageClient() {
  const { programas, loading } = useProgramacion('tv');
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Tv className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">TV <span className="text-[var(--accent)]">Online</span></h1>
      </div>
      <TVPlayer />
      <h2 className="font-bold text-lg text-[var(--text)] mt-6 mb-3">Programación</h2>
      {loading ? <Loader size="sm" /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{programas.map((p) => <ProgramCard key={p.id} programa={p} />)}</div>}
    </div>
  );
}
