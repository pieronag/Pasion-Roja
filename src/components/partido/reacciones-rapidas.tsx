'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Flame, Sparkles, PartyPopper, Frown, Zap } from 'lucide-react';

const emojis = [
  { emoji: '🔥', icon: Flame, label: 'Caliente' },
  { emoji: '⚡', icon: Zap, label: 'Jugada' },
  { emoji: '🎉', icon: PartyPopper, label: 'Gol' },
  { emoji: '😱', icon: Frown, label: 'Uff' },
  { emoji: '✨', icon: Sparkles, label: 'Magia' },
];

export function ReaccionesRapidas() {
  const [reacciones, setReacciones] = useState<Record<string, number>>({
    '🔥': 12, '⚡': 8, '🎉': 25, '😱': 5, '✨': 3,
  });
  const [animating, setAnimating] = useState<string | null>(null);

  const handleReaccion = (emoji: string) => {
    setAnimating(emoji);
    setReacciones((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setTimeout(() => setAnimating(null), 300);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
        Reacciones
      </h3>
      <div className="flex flex-wrap gap-2">
        {emojis.map(({ emoji, icon: Icon, label }) => (
          <button
            key={emoji}
            onClick={() => handleReaccion(emoji)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full bg-pizarra-claro/50 border border-pizarra-claro text-sm transition-all duration-200 active:scale-90 min-h-[44px]',
              animating === emoji && 'scale-110 bg-rojo/20 border-rojo/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{reacciones[emoji] || 0}</span>
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
