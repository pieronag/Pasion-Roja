'use client';

import { useNoticias } from '@/hooks/use-noticias';
import { cn } from '@/lib/utils';
import { Newspaper } from 'lucide-react';

export function SportsTicker() {
  const { noticias } = useNoticias(10);
  if (!noticias.length) return null;

  return (
    <div className="bg-[var(--accent)] text-white overflow-hidden h-8 flex items-center">
      <div className="flex items-center gap-2 px-3 bg-[var(--accent-hover)] h-full font-bold text-xs whitespace-nowrap">
        <Newspaper className="h-3.5 w-3.5" /> ÚLTIMO MOMENTO
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="animate-ticker whitespace-nowrap flex gap-12 absolute px-4 items-center h-full text-xs font-medium">
          {noticias.map((n) => (
            <span key={n.id}>{n.titulo}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
