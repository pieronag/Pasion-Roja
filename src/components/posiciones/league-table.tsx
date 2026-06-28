'use client';

import type { EquipoPosicion } from '@/types/estadistica';
import { cn } from '@/lib/utils';

interface LeagueTableProps {
  equipos: EquipoPosicion[];
  ascensos?: number;
  descensos?: number;
}

export function LeagueTable({ equipos, ascensos = 0, descensos = 0 }: LeagueTableProps) {
  if (!equipos.length) return null;

  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
            <th className="p-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider w-10">#</th>
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
          {equipos.map((eq, i) => {
            const pos = i + 1;
            const esAscenso = ascensos > 0 && pos <= ascensos;
            const esDescenso = descensos > 0 && pos > equipos.length - descensos;
            return (
              <tr key={eq.equipoId} className={cn(
                'border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors',
                esAscenso && 'bg-emerald-500/5',
                esDescenso && 'bg-red-500/5',
              )}>
                <td className={cn('p-3 text-center font-bold font-mono', 
                  esAscenso ? 'text-emerald-500' : esDescenso ? 'text-red-500' : 'text-[var(--text)]'
                )}>{pos}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {eq.logoBase64 && <img src={eq.logoBase64} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
                      <span className="font-medium text-[var(--text)] whitespace-nowrap">{eq.nombre}</span>
                    </div>
                    {esAscenso && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">↑</span>}
                    {esDescenso && <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">↓</span>}
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
                      <span key={j} className={cn(
                        'inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white',
                        r === 'G' ? 'bg-[var(--success)]' : r === 'E' ? 'bg-[var(--warning)]' : 'bg-[var(--error)]'
                      )}>{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(ascensos > 0 || descensos > 0) && (
        <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] flex gap-4">
          {ascensos > 0 && <span><span className="text-emerald-500 font-bold">↑</span> {ascensos} ascienden</span>}
          {descensos > 0 && <span><span className="text-red-500 font-bold">↓</span> {descensos} descienden</span>}
        </div>
      )}
    </div>
  );
}
