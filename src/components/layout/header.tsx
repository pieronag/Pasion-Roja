'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/partido', label: 'Partido' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/en-vivo', label: 'En Vivo' },
];

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-pizarra-claro bg-pizarra/95 backdrop-blur-xl safe-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-black tracking-tight">
          <Zap className="h-6 w-6 text-rojo fill-rojo" />
          <span className="text-white">PASIÓN <span className="text-rojo">ROJA</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                pathname === link.href
                  ? 'text-rojo bg-rojo/10'
                  : 'text-gray-400 hover:text-white hover:bg-pizarra-claro/50'
              )}
            >
              {link.label}
              {link.href === '/en-vivo' && (
                <BadgeEnVivo size="sm" className="absolute -top-1 -right-1" />
              )}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <nav className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-rojo bg-rojo/10'
                      : 'text-gray-400 hover:text-white hover:bg-pizarra-claro/50'
                  )}
                >
                  {link.label}
                  {link.href === '/en-vivo' && <BadgeEnVivo size="sm" />}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
