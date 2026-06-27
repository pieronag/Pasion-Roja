'use client';

import { BadgeEnVivo } from './badge-en-vivo';
import { Radio, Tv } from 'lucide-react';
import Link from 'next/link';

interface LiveNowBarProps {
  programa?: string;
  tipo?: 'radio' | 'tv';
}

export function LiveNowBar({ programa, tipo = 'radio' }: LiveNowBarProps) {
  return (
    <Link
      href={tipo === 'radio' ? '/radio' : '/tv'}
      className="block bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <BadgeEnVivo size="sm" />
        {tipo === 'radio' ? <Radio className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
        <span className="text-sm font-semibold truncate">
          {programa || `Transmisión en vivo`}
        </span>
        <span className="text-xs text-white/70 ml-auto flex-shrink-0">Toca para ver →</span>
      </div>
    </Link>
  );
}
