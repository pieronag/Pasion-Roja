'use client';

import { cn } from '@/lib/utils';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { useNoticias } from '@/hooks/use-noticias';
import { usePartidos } from '@/hooks/use-partidos';
import { useSponsors } from '@/hooks/use-sponsors';
import { WidgetResumen } from '@/components/admin/widget-resumen';
import { MiniAnalytics } from '@/components/admin/mini-analytics';
import { MarcadorForm } from '@/components/admin/marcador-form';
import { Trophy, Shield, Newspaper, HeartHandshake, Swords, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { deportes } = useDeportes();
  const { equipos } = useEquipos();
  const { noticias } = useNoticias(100);
  const { partidos } = usePartidos({ max: 100 });
  const { sponsors } = useSponsors();

  const metrics = [
    { label: 'Deportes', value: deportes.length, icon: Trophy, color: 'text-orange-500' },
    { label: 'Equipos', value: equipos.length, icon: Shield, color: 'text-blue-500' },
    { label: 'Jugadores', value: '—', icon: Users, color: 'text-green-500' },
    { label: 'Partidos', value: partidos.length, icon: Swords, color: 'text-red-500' },
    { label: 'Noticias', value: noticias.length, icon: Newspaper, color: 'text-purple-500' },
    { label: 'Sponsors', value: sponsors.length, icon: HeartHandshake, color: 'text-yellow-500' },
  ];

  const enVivo = partidos.filter((p) => p.estado === 'en_vivo').length;
  const proximos = partidos.filter((p) => p.estado === 'programado').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Panel de Control</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <Icon className={cn('h-5 w-5 mb-2', m.color)} />
              <p className="text-2xl font-black text-[var(--text)]">{m.value}</p>
              <p className="text-xs text-[var(--text-secondary)]">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <WidgetResumen />
        </div>
        <div>
          <MiniAnalytics />
        </div>
      </div>

      {enVivo > 0 && (
        <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <p className="text-[var(--accent)] font-bold">🔴 {enVivo} partido(s) en vivo ahora</p>
        </div>
      )}

      <MarcadorForm />
    </div>
  );
}
