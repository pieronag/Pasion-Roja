'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadioPlayerProps {
  src?: string;
  stationName?: string;
}

export function RadioPlayer({ src, stationName = 'Pasión Roja Radio' }: RadioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    } else if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
      <BadgeEnVivo size="sm" className="mb-3" />
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Volume2 className="h-8 w-8 text-white" />
      </div>
      <h3 className="font-bold text-lg text-[var(--text)] mb-1">{stationName}</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Transmisión en vivo</p>
      <Button
        onClick={toggle}
        size="lg"
        className={cn('rounded-full w-16 h-16', playing ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]')}
      >
        {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
      </Button>
    </div>
  );
}
