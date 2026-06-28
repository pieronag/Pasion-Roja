'use client';

import type { EquipoPosicion } from '@/types/estadistica';
import { cn } from '@/lib/utils';
import { Star, ListChecks } from 'lucide-react';

interface LeagueTableProps {
  equipos: EquipoPosicion[];
  ascensos?: number;
  descensos?: number;
  liguillaDesde?: number;
  liguillaHasta?: number;
  tipoLiguilla?: string;
  equipoPrincipalId?: string;
}

export function LeagueTable({ equipos, ascensos = 0, descensos = 0, liguillaDesde = 0, liguillaHasta = 0, tipoLiguilla, equipoPrincipalId }: LeagueTableProps) {
  if (!equipos.length) return null;

  const tieneLiguilla = liguillaDesde > 0 && liguillaHasta >= liguillaDesde;

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
            <th className="p-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Rendimiento</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq, i) => {
            const pos = i + 1;
            const esMalleco = eq.equipoId === equipoPrincipalId;
            const esAscensoDirecto = ascensos > 0 && pos <= ascensos;
            const esLiguilla = tieneLiguilla && pos >= liguillaDesde && pos <= liguillaHasta && !esAscensoDirecto;
            const esDescenso = descensos > 0 && pos > equipos.length - descensos;
            return (
              <tr key={eq.equipoId} className={cn(
                'border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors',
                esAscensoDirecto && 'bg-emerald-500/5',
                esLiguilla && 'bg-sky-500/5',
                esDescenso && 'bg-red-500/5',
                esMalleco && 'bg-yellow-500/[0.08] border-l-2 border-yellow-500',
              )}>
                <td className={cn('p-3 text-center font-bold font-mono',
                  esMalleco ? 'text-yellow-600' : esAscensoDirecto ? 'text-emerald-500' : esLiguilla ? 'text-sky-500' : esDescenso ? 'text-red-500' : 'text-[var(--text)]'
                )}>{pos}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {eq.logoBase64 && <img src={eq.logoBase64} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
                      <span className={cn('font-medium whitespace-nowrap', esMalleco ? 'text-yellow-600 font-bold' : 'text-[var(--text)]')}>{eq.nombre}</span>
                      {esMalleco && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    {esAscensoDirecto && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">↑</span>}
                    {esLiguilla && <ListChecks className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />}
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
      <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] flex flex-wrap gap-3">
        {ascensos > 0 && <span><span className="text-emerald-500 font-bold">↑</span> Ascenso directo: {ascensos} equipo(s)</span>}
        {tieneLiguilla && <span><span className="text-sky-500"><ListChecks className="h-3 w-3 inline" /></span> {tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'}: puestos {liguillaDesde} al {liguillaHasta}</span>}
        {descensos > 0 && <span><span className="text-red-500 font-bold">↓</span> Descenso: {descensos} equipo(s)</span>}
      </div>
    </div>
  );
}
