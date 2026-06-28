'use client';

import type { EquipoPosicion } from '@/types/estadistica';
import { cn } from '@/lib/utils';

interface LeagueTableProps {
  equipos: EquipoPosicion[];
}

export function LeagueTable({ equipos }: LeagueTableProps) {
  if (!equipos.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
            <th className="p-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">#</th>
            <th className="p-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Equipo</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">PJ</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">G</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">E</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">P</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">GF</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">GC</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">DG</th>
            <th className="p-3 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">PTS</th>
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Últ. 5</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq, i) => (
            <tr
              key={eq.equipoId}
              className={cn(
                'border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors',
                i < 4 && 'bg-[var(--accent-light)]/30'
              )}
            >
              <td className="p-3 text-center font-bold text-[var(--text)]">{eq.posicion}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {eq.logoBase64 && <img src={eq.logoBase64} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
                  <span className="font-medium text-[var(--text)] whitespace-nowrap">{eq.nombre}</span>
                </div>
              </td>
              <td className="p-3 text-center text-[var(--text)]">{eq.pj}</td>
              <td className="p-3 text-center text-[var(--text)]">{eq.pg}</td>
              <td className="p-3 text-center text-[var(--text)]">{eq.pe}</td>
              <td className="p-3 text-center text-[var(--text)]">{eq.pp}</td>
              <td className="p-3 text-center text-[var(--text)]">{eq.gf}</td>
              <td className="p-3 text-center text-[var(--text)]">{eq.gc}</td>
              <td className={cn('p-3 text-center font-mono font-medium', eq.dg > 0 ? 'text-[var(--success)]' : eq.dg < 0 ? 'text-[var(--error)]' : 'text-[var(--text)]')}>
                {eq.dg > 0 ? '+' : ''}{eq.dg}
              </td>
              <td className="p-3 text-center font-black text-lg text-[var(--text)]">{eq.pts}</td>
              <td className="p-3 text-center">
                <div className="flex gap-0.5 justify-center">
                  {eq.ultimos5.slice(-5).map((r, j) => (
                    <span
                      key={j}
                      className={cn(
                        'inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white',
                        r === 'G' ? 'bg-[var(--success)]' : r === 'E' ? 'bg-[var(--warning)]' : 'bg-[var(--error)]'
                      )}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
