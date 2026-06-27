'use client';

import { useTheme } from '@/providers/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 rounded-lg transition-all duration-200 min-h-[44px]',
        variant === 'icon'
          ? 'p-2.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)]'
          : 'px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]',
        className
      )}
      aria-label={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-[var(--warning)]" />}
      {variant === 'full' && <span className="text-sm font-medium">{theme === 'light' ? 'Oscuro' : 'Claro'}</span>}
    </button>
  );
}
