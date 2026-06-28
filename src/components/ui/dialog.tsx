'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in', className)} {...props} />
  )
);
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] shadow-2xl ring-1 ring-[var(--border)] w-full p-0 max-h-[85vh] overflow-hidden flex flex-col',
        'data-[state=open]:animate-scale-in',
        className
      )} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0', className)} {...props}>
    <div className="flex-1">{children}</div>
    <DialogPrimitive.Close className="rounded-[var(--radius-sm)] p-1.5 opacity-60 hover:opacity-100 hover:bg-[var(--bg-hover)] transition-all flex-shrink-0 -mr-1">
      <X className="h-4 w-4" />
    </DialogPrimitive.Close>
  </div>
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn('text-sm font-semibold text-[var(--text)]', className)} {...props} />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 overflow-y-auto flex-1', className)} {...props} />
);
DialogBody.displayName = 'DialogBody';

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogClose };
