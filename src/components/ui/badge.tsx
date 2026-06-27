import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent)] text-white',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]',
        outline: 'border border-[var(--accent)] text-[var(--accent)]',
        live: 'bg-[var(--accent)] text-white animate-pulse-rojo',
        success: 'bg-[var(--success)] text-white',
        warning: 'bg-[var(--warning)] text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
