'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Star } from 'lucide-react';

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
  equiposMap?: Record<string, any>;
  principalEquipoId?: string;
}

export function TopScorers({ rankings, statKey, title, equiposMap, principalEquipoId }: TopScorersProps) {
  const icons = [Trophy, Medal, Medal];
  const colors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

  const sorted = [...rankings].sort((a, b) => {
    if (b.valor !== a.valor) return b.valor - a.valor;
    const aPri = a.equipoId === principalEquipoId ? 1 : 0;
    const bPri = b.equipoId === principalEquipoId ? 1 : 0;
    return bPri - aPri;
  });

  return (
    <div className="space-y-1">
      {sorted.map((r, i) => {
        const Icon = icons[i] || Medal;
        const equipo = equiposMap?.[r.equipoId];
        const esPrincipal = principalEquipoId === r.equipoId;
        return (
          <Link
            key={r.jugadorId}
            href={`/jugadores/${r.jugadorId}`}
            className={cn(
              'flex items-center gap-2 p-2.5 rounded-lg border transition-all text-sm',
              esPrincipal ? 'border-yellow-500/30 bg-yellow-500/[0.06] hover:border-yellow-500' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]'
            )}
          >
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center', i < 3 ? colors[i] : 'text-[var(--text-muted)]')}>
              {i < 3 ? <Icon className="h-4 w-4" /> : <span className="text-xs font-bold">{r.posicion}</span>}
            </span>
            {r.fotoBase64 ? (
              <img src={r.fotoBase64} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] flex-shrink-0">
                {r.numero}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {equipo?.logoBase64 ? (
                  <img src={equipo.logoBase64} alt="" className="w-4 h-4 object-contain flex-shrink-0 logo-img" />
                ) : (
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: equipo?.colorPrimario || 'transparent' }} />
                )}
                <p className="font-medium text-[var(--text)] truncate">{r.nombre}</p>
                {esPrincipal && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </div>
            </div>
            <span className="font-black text-lg text-[var(--accent)]">{r.valor}</span>
          </Link>
        );
      })}
    </div>
  );
}
