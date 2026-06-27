'use client';

import { cn } from '@/lib/utils';

interface BadgeEnVivoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeEnVivo({ className, size = 'md' }: BadgeEnVivoProps) {
  const sizes = { sm: 'text-[10px] px-1.5 py-0.5 gap-1', md: 'text-xs px-2.5 py-1 gap-1.5', lg: 'text-sm px-3 py-1.5 gap-2' };
  return (
    <span className={cn('inline-flex items-center rounded-full bg-[var(--accent)] text-white font-bold animate-pulse-rojo', sizes[size], className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      EN VIVO
    </span>
  );
}
