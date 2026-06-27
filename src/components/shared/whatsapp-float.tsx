'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface WhatsAppFloatProps {
  phone?: string;
  message?: string;
  className?: string;
}

export function WhatsAppFloat({
  phone = '+56912345678',
  message = '¡Hola! Quiero más información sobre Pasión Roja',
  className,
}: WhatsAppFloatProps) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-20 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--success)] text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95',
        className
      )}
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
