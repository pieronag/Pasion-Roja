'use client';

import { cn } from '@/lib/utils';

export interface SportIconProps {
  sport: string;
  className?: string;
  size?: number;
}

const sportFiles: Record<string, string> = {
  '⚽ Fútbol': '/icons/soccer.svg',
  '🏀 Básquetbol': '/icons/basketball.svg',
  '🏐 Voleibol': '/icons/volleyball.svg',
  '🏉 Rugby': '/icons/rugby.svg',
  '🎾 Tenis': '/icons/tennis.svg',
  '🥊 Boxeo': '/icons/boxing.svg',
  '🚴 Ciclismo': '/icons/cycling.svg',
  '🏃 Atletismo': '/icons/running.svg',
  '🏊 Natación': '/icons/swimming.svg',
  '⚾ Béisbol': '/icons/baseball.svg',
};

// For fallback: sport name without emoji prefix
const sportNameToFile: Record<string, string> = {};
Object.entries(sportFiles).forEach(([key, val]) => {
  const name = key.split(' ').slice(1).join(' ');
  sportNameToFile[name] = val;
  sportNameToFile[key] = val;
});

export function SportIcon({ sport, className, size = 24 }: SportIconProps) {
  const src = sportFiles[sport] || sportNameToFile[sport];
  if (!src) return <span className={cn('text-lg', className)}>{sport || '⚽'}</span>;

  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={sport}
        className="w-full h-full"
        style={{ filter: 'var(--sport-icon-filter, none)' }}
      />
    </span>
  );
}

const sportOptions = Object.keys(sportFiles);

export function SportIconPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {sportOptions.map((sport) => (
        <button
          key={sport}
          type="button"
          onClick={() => onChange(sport)}
          className={`flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] border transition-all ${
            value === sport
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--text-secondary)]'
          }`}
        >
          <SportIcon sport={sport} size={20} />
          <span className="text-[10px] font-medium truncate w-full text-center">{sport.split(' ').slice(1).join(' ')}</span>
        </button>
      ))}
    </div>
  );
}

export { sportFiles, sportOptions };
