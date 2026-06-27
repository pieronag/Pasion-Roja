'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  gradient?: string;
  href?: string;
}

export function MetricCard({ label, value, icon: Icon, change, changeLabel, gradient = 'from-[var(--accent)] to-orange-500', href }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:shadow-md transition-all', href && 'cursor-pointer')} onClick={() => href && (window.location.href = href)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-[var(--radius-sm)] bg-gradient-to-br flex items-center justify-center', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {change !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]')}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
      {changeLabel && <p className="text-[10px] text-[var(--text-muted)] mt-1">{changeLabel}</p>}
    </div>
  );
}
