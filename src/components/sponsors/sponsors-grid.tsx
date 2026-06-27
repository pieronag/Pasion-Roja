'use client';

import { useSponsors } from '@/hooks/use-sponsors';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { TipoSponsor } from '@/types/sponsor';

const tipoOrden: Record<TipoSponsor, number> = { principal: 0, oficial: 1, auspiciador: 2, media: 3 };
const tipoLabels: Record<TipoSponsor, string> = { principal: 'Principal', oficial: 'Oficial', auspiciador: 'Auspiciador', media: 'Media' };

export function SponsorsGrid() {
  const { sponsors, loading } = useSponsors();

  if (loading) return <div className="space-y-4"><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-12 w-3/4 rounded-xl" /></div>;
  if (!sponsors.length) return null;

  const grouped = sponsors.reduce((acc, s) => {
    const key = s.tipo;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, typeof sponsors>);

  const sorted = Object.entries(grouped).sort(([a], [b]) => (tipoOrden[a as TipoSponsor] || 99) - (tipoOrden[b as TipoSponsor] || 99));

  return (
    <div className="space-y-6">
      {sorted.map(([tipo, items]) => (
        <div key={tipo}>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{tipoLabels[tipo as TipoSponsor] || tipo}</p>
          <div className="flex flex-wrap gap-4 items-center">
            {items.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all',
                  tipo === 'principal' ? 'p-4' : 'p-2.5'
                )}
              >
                {s.logoBase64 ? (
                  <img src={s.logoBase64} alt={s.nombre} className={tipo === 'principal' ? 'h-12 object-contain' : 'h-8 object-contain'} />
                ) : (
                  <span className="font-semibold text-[var(--text)]">{s.nombre}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
