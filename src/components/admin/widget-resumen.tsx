'use client';

import { useMarcador } from '@/hooks/use-marcador';
import { useTransmision } from '@/hooks/use-transmision';
import { useNoticias } from '@/hooks/use-noticias';
import { usePartidos } from '@/hooks/use-partidos';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Swords, Newspaper, Radio, Clock, Calendar } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export function WidgetResumen() {
  const { partido } = useMarcador();
  const { config } = useTransmision();
  const { noticias } = useNoticias(1);
  const { partidos } = usePartidos({ estado: 'programado', max: 3 });

  const widgets = [
    {
      icon: Swords,
      label: 'Marcador',
      value: partido ? `${partido.equipoLocal} ${partido.marcadorLocal}-${partido.marcadorVis} ${partido.equipoVis}` : 'Sin partido',
      meta: partido ? `Min ${partido.minuto}'` : null,
    },
    {
      icon: Radio,
      label: 'Transmisión',
      value: config?.estadoTransmision === 'en_vivo' ? 'En Vivo' : config?.estadoTransmision === 'programado' ? 'Programado' : 'Inactivo',
      badge: config?.estadoTransmision === 'en_vivo' ? <BadgeEnVivo size="sm" /> : null,
    },
    {
      icon: Newspaper,
      label: 'Última noticia',
      value: noticias[0]?.titulo || 'Sin noticias',
      meta: noticias[0] ? formatRelativeTime(noticias[0].createdAt) : null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-[var(--text)]">Resumen General</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {widgets.map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.label} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <Icon className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-muted)]">{w.label}</p>
                <p className="text-sm text-[var(--text)] truncate font-medium">{w.value}</p>
                {w.meta && <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><Clock className="h-3 w-3" />{w.meta}</p>}
              </div>
              {w.badge}
            </div>
          );
        })}
        {partidos.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1"><Calendar className="h-3 w-3" />Próximos partidos</p>
            {partidos.slice(0, 3).map((p) => (
              <div key={p.id} className="text-xs text-[var(--text-secondary)] py-0.5">{p.equipoLocalNombre} vs {p.equipoVisitaNombre}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
