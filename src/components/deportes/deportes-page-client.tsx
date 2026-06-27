'use client';

import { DeportesGrid } from '@/components/deportes/deportes-grid';
import { Trophy } from 'lucide-react';

export function DeportesPageClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">
          Todos los <span className="text-[var(--accent)]">Deportes</span>
        </h1>
      </div>
      <DeportesGrid />
    </div>
  );
}
