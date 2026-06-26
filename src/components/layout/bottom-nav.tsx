'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Newspaper, Radio, Swords } from 'lucide-react';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';

const tabs = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/partido', label: 'Partido', icon: Swords },
  { href: '/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/en-vivo', label: 'En Vivo', icon: Radio },
];

export function BottomNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-pizarra-claro bg-pizarra/95 backdrop-blur-xl transition-transform duration-300 safe-bottom md:hidden',
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
                isActive ? 'text-rojo' : 'text-gray-500'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-lg transition-colors',
                isActive && 'bg-rojo/10'
              )}>
                <Icon className="h-5 w-5" />
                {tab.href === '/en-vivo' && (
                  <span className="absolute -top-0.5 -right-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rojo opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rojo" />
                    </span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
