'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Zap, Menu, Home, Swords, Trophy, Newspaper, Radio, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partido', label: 'Partido', icon: Swords },
  { href: '/deportes', label: 'Deportes', icon: Trophy },
  { href: '/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/radio', label: 'Radio', icon: Radio },
  { href: '/tv', label: 'TV', icon: Tv },
];

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl safe-top">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-black tracking-tight">
          <Zap className="h-6 w-6 text-[var(--accent)] fill-[var(--accent)]" />
          <span className="text-[var(--text)]">PASIÓN <span className="text-[var(--accent)]">ROJA</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors',
                pathname === link.href
                  ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
              )}>
                <Icon className="h-4 w-4" />
                {link.label}
                {link.href === '/tv' && <BadgeEnVivo size="sm" className="ml-1.5 relative" />}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <nav className="flex flex-col gap-1 mt-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className={cn(
                      'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-[var(--radius-sm)] transition-colors',
                      pathname === link.href
                        ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                    )}>
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
