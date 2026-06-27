'use client';

import { useDeportes } from '@/hooks/use-deportes';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export function DeportesGrid() {
  const { deportes, loading } = useDeportes();

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  );

  if (!deportes.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {deportes.map((d) => (
        <Link
          key={d.id}
          href={`/deportes/${d.id}`}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all group"
        >
          <span className="text-3xl">{d.icono}</span>
          <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            {d.nombre}
          </span>
        </Link>
      ))}
    </div>
  );
}
