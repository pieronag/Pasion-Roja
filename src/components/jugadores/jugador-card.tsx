'use client';

import Link from 'next/link';
import type { Jugador } from '@/types/jugador';
import { cn } from '@/lib/utils';

export function JugadorCard({ jugador }: { jugador: Jugador }) {
  return (
    <Link
      href={`/jugadores/${jugador.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all group"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
        {jugador.fotoBase64 ? (
          <img src={jugador.fotoBase64} alt={jugador.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-lg font-bold">
            {jugador.numero}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--accent)] font-mono">#{jugador.numero}</span>
          <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate text-sm">
            {jugador.nombre} {jugador.apellido}
          </h3>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{jugador.posicion}</p>
      </div>
    </Link>
  );
}
