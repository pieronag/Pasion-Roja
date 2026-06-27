import * as React from 'react';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }>(
  ({ className, pressed, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--accent-light)] data-[state=on]:text-[var(--accent)] min-h-[44px] px-3',
        pressed ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]',
        className
      )}
      data-state={pressed ? 'on' : 'off'}
      {...props}
    />
  )
);
Toggle.displayName = 'Toggle';

export { Toggle };
