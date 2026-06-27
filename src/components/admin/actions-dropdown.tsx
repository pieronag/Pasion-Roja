'use client';

import { useState, useRef, useEffect } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ActionsDropdownProps {
  actions: ActionItem[];
}

export function ActionsDropdown({ actions }: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
        <EllipsisVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] shadow-lg py-1 z-50 animate-slide-up">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors', action.danger ? 'text-[var(--error)] hover:bg-red-500/5' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
