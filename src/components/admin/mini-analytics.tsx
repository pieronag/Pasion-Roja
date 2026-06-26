'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, MousePointerClick, Smartphone } from 'lucide-react';

export function MiniAnalytics() {
  const stats = [
    { label: 'Visitas hoy', value: '—', icon: Eye },
    { label: 'Clics', value: '—', icon: MousePointerClick },
    { label: 'Móvil', value: '—', icon: Smartphone },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-white">Estadísticas Rápidas</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-3">Conecta Firebase Analytics para ver datos</p>
      </CardContent>
    </Card>
  );
}
