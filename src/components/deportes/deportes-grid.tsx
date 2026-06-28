'use client';

import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export function DeportesGrid() {
  const { deportes, loading } = useDeportes();

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-[var(--radius)]" />)}
    </div>
  );

  if (!deportes.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {deportes.map((d) => (
        <Link
          key={d.id}
          href={`/deportes/${d.id}`}
          className="relative flex flex-col items-center justify-center gap-2 p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all group overflow-hidden min-h-[100px]"
        >
          {/* Background banner */}
          {d.bannerBase64 && (
            <>
              <img src={d.bannerBase64} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/80 to-transparent" />
            </>
          )}
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <SportIcon sport={d.icono} size={32} />
            <span className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-wide text-center">
              {d.nombre}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
