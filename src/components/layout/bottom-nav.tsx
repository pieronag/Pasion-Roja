'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Newspaper, Radio, Tv, Swords } from 'lucide-react';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const tabs = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partido', label: 'Partido', icon: Swords },
  { href: '/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/radio', label: 'Radio', icon: Radio },
  { href: '/tv', label: 'TV', icon: Tv },
];

export function BottomNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl transition-transform duration-300 safe-bottom md:hidden',
        scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full px-2 transition-colors',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              )}
            >
              <div className={cn('relative p-1.5 rounded-lg', isActive && 'bg-[var(--accent-light)]')}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
