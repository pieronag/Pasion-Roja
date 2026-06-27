'use client';

import { cn } from '@/lib/utils';

export interface SportIconProps {
  sport: string;
  className?: string;
  size?: number;
}

const sportSvgs: Record<string, (size: number) => React.ReactNode> = {
  '⚽ Fútbol': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 7.5 16.5" /><path d="M12 2a10 10 0 0 0-7.5 16.5" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="M4.93 4.93l14.14 14.14" /><path d="M19.07 4.93L4.93 19.07" />
    </svg>
  ),
  '🏀 Básquetbol': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93a10 10 0 0 1 14.14 0" /><path d="M19.07 4.93A10 10 0 0 1 4.93 19.07" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="M8 2.5a10 10 0 0 1 0 19" /><path d="M16 2.5a10 10 0 0 0 0 19" />
    </svg>
  ),
  '🏐 Voleibol': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2L2 12l10 10 10-10z" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="M7 5a10 10 0 0 0 0 14" /><path d="M17 5a10 10 0 0 1 0 14" />
    </svg>
  ),
  '🏉 Rugby': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="10" ry="7" /><path d="M5 5c3 2 4 5 4 7s-1 5-4 7" /><path d="M19 5c-3 2-4 5-4 7s1 5 4 7" /><path d="M8 3c2 3 2 6 2 9s0 6-2 9" /><path d="M16 3c-2 3-2 6-2 9s0 6 2 9" />
    </svg>
  ),
  '🎾 Tenis': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 4.5 18.5" /><path d="M12 2a10 10 0 0 0-4.5 18.5" /><path d="M8 3a10 10 0 0 0 0 18" /><path d="M16 3a10 10 0 0 1 0 18" /><path d="M3 8h18" /><path d="M3 16h18" />
    </svg>
  ),
  '🥊 Boxeo': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" /><path d="M8 14c0-2 1.5-4 4-4s4 2 4 4" /><path d="M5 20c2-2 4-3 7-3s5 1 7 3" /><circle cx="12" cy="22" r="2" /><path d="M9 8a3 3 0 1 1 6 0" />
    </svg>
  ),
  '🚴 Ciclismo': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="18" r="3" /><circle cx="19" cy="18" r="3" /><path d="M12 18l-2-7 4-2 2 4" /><path d="M7 11l3-3" /><path d="M14 4h4l2 4" />
    </svg>
  ),
  '🏃 Atletismo': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="5" r="2" /><path d="M5 20l5-7 3 3 2-8 3 4" /><path d="M8 12l2-3" /><path d="M13 8l1-3" /><path d="M3 20l2-3" />
    </svg>
  ),
  '🏊 Natación': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18c2-2 4-3 6-3s4 1 6 3 4 3 6 3 4-1 6-3" /><path d="M2 14c2-2 4-3 6-3s4 1 6 3 4 3 6 3 4-1 6-3" /><path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M10 11l2-1 2 3" />
    </svg>
  ),
  '⚾ Béisbol': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M7 5a10 10 0 0 0 5 15" /><path d="M17 5a10 10 0 0 1-5 15" /><path d="M12 2L9 7l3 5-3 5 3 5" /><path d="M12 2l3 5-3 5 3 5-3 5" />
    </svg>
  ),
};

const sportOptions = Object.keys(sportSvgs);

export function SportIcon({ sport, className, size = 24 }: SportIconProps) {
  const renderIcon = sportSvgs[sport];
  if (!renderIcon) return <span className={cn('text-lg', className)}>{sport || '⚽'}</span>;
  return <span className={cn('inline-flex items-center justify-center', className)}>{renderIcon(size)}</span>;
}

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

export { sportSvgs, sportOptions };
