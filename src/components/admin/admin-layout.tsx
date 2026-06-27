'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  LayoutDashboard, Newspaper, Image, Radio, Tv,
  Trophy, Shield, Users, Swords, TrendingUp,
  HeartHandshake, MessageCircle, History, LogOut, Zap,
  CalendarDays, Search, Sun, Moon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';
import { auth } from '@/lib/firebase';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string | number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Dashboard',
    items: [
      { href: '/admin', label: 'Panel de Control', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
      { href: '/admin/multimedia', label: 'Multimedia', icon: Image },
      { href: '/admin/programacion', label: 'Programación', icon: CalendarDays },
    ],
  },
  {
    label: 'Deportes',
    items: [
      { href: '/admin/deportes', label: 'Deportes', icon: Trophy },
      { href: '/admin/divisiones', label: 'Divisiones', icon: Shield },
      { href: '/admin/equipos', label: 'Equipos', icon: Shield },
      { href: '/admin/jugadores', label: 'Jugadores', icon: Users },
    ],
  },
  {
    label: 'Competición',
    items: [
      { href: '/admin/partidos', label: 'Partidos', icon: Swords },
      { href: '/admin/posiciones', label: 'Posiciones', icon: Trophy },
      { href: '/admin/estadisticas', label: 'Estadísticas', icon: TrendingUp },
      { href: '/admin/marcador', label: 'Marcador Live', icon: Tv },
    ],
  },
  {
    label: 'Media',
    items: [
      { href: '/admin/transmision', label: 'Transmisión', icon: Radio },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { href: '/admin/sponsors', label: 'Sponsors', icon: HeartHandshake },
      { href: '/admin/contacto', label: 'Contacto', icon: MessageCircle },
      { href: '/admin/historial', label: 'Historial', icon: History },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/admin/login') {
      if (auth.currentUser) return;
      redirectTimer.current = setTimeout(() => router.push('/admin/login'), 3000);
    }
    return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
  }, [user, loading, pathname, router]);

  const allItems = useMemo(() => navSections.flatMap((s) => s.items), []);
  const filteredItems = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    return allItems.filter((i) => i.label.toLowerCase().includes(q));
  }, [searchQuery, allItems]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (loading || !user) {
    if (auth.currentUser) return <>{children}</>;
    return null;
  }

  const currentSection = navSections.find((s) => s.items.some((i) => pathname === i.href));

  return (
    <div className="h-screen w-screen flex bg-[var(--bg)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 h-full border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--border)] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <span className="font-bold text-base text-[var(--text)]">Pasión Roja</span>
            <span className="text-[10px] text-[var(--accent)] font-semibold block leading-tight">ADMIN PANEL</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar sección..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] outline-none"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 scrollbar-thin">
          {filteredItems ? (
            <div className="space-y-0.5 mt-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                  )}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {navSections.map((section) => {
                const isSectionActive = currentSection?.label === section.label;
                return (
                  <div key={section.label}>
                    <p className={cn(
                      'px-3 py-1 text-[11px] font-semibold uppercase tracking-widest',
                      isSectionActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                    )}>
                      {section.label}
                    </p>
                    <div className="mt-0.5 space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href} className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-[var(--accent)] text-white shadow-sm'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                          )}>
                            <Icon className={cn('h-4 w-4', isActive && 'text-white')} />
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* User info + Theme Toggle */}
        <div className="border-t border-[var(--border)] p-3 flex-shrink-0 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2 px-2 pb-2">
            <ThemeToggle variant="full" className="flex-1 justify-center text-xs" />
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 border-t border-[var(--border)] pt-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent)]">
              {user.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text)] truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] flex-shrink-0 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">{currentSection?.label || 'Admin'}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {navSections.find((s) => s.items.some((i) => pathname === i.href))?.items.find((i) => pathname === i.href)?.label || 'Panel de Control'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">Ver sitio →</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
