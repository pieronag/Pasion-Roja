import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn('flex h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text)] px-3 py-1.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors caret-[var(--accent)]', className)} ref={ref} {...props} />
  )
);
Input.displayName = 'Input';
export { Input };
