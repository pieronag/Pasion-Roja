'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }
>(({ className, pressed, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rojo disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-rojo/20 data-[state=on]:text-rojo min-h-[44px] px-3',
      pressed ? 'bg-rojo/20 text-rojo' : 'text-gray-400 hover:text-white',
      className
    )}
    data-state={pressed ? 'on' : 'off'}
    {...props}
  />
));
Toggle.displayName = 'Toggle';

export { Toggle };
