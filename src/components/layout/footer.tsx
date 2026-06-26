'use client';

import { usePathname } from 'next/navigation';
import { Zap, Heart } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-pizarra-claro bg-pizarra py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-lg font-black">
          <Zap className="h-5 w-5 text-rojo fill-rojo" />
          <span>PASIÓN <span className="text-rojo">ROJA</span></span>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          Hecho con <Heart className="h-3.5 w-3.5 text-rojo fill-rojo" /> para Angol
        </p>
      </div>
    </footer>
  );
}
