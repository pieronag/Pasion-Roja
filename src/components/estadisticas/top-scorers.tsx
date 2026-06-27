'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface RankingEntry {
  posicion: number;
  jugadorId: string;
  nombre: string;
  equipoId: string;
  numero: number;
  fotoBase64: string;
  valor: number;
}

interface TopScorersProps {
  rankings: RankingEntry[];
  statKey: string;
  title?: string;
}

export function TopScorers({ rankings, statKey, title }: TopScorersProps) {
  const icons = [Trophy, Medal, Medal];
  const colors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

  return (
    <div className="space-y-1">
      {rankings.map((r, i) => {
        const Icon = icons[i] || Medal;
        return (
          <Link
            key={r.jugadorId}
            href={`/jugadores/${r.jugadorId}`}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all text-sm"
          >
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center', i < 3 ? colors[i] : 'text-[var(--text-muted)]')}>
              {i < 3 ? <Icon className="h-4 w-4" /> : <span className="text-xs font-bold">{r.posicion}</span>}
            </span>
            {r.fotoBase64 ? (
              <img src={r.fotoBase64} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                {r.numero}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text)] truncate">{r.nombre}</p>
            </div>
            <span className="font-black text-lg text-[var(--accent)]">{r.valor}</span>
          </Link>
        );
      })}
    </div>
  );
}
