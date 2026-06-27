'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function DashboardMetrics({ metrics }: { metrics: Metric[] }) {
  return (
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
  );
}
