'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Newspaper, Image, Radio, Tv,
  Trophy, Shield, Users, Swords, TrendingUp,
  HeartHandshake, MessageCircle, History, LogOut, Zap,
  ChevronDown, ChevronRight, CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { auth } from '@/lib/firebase';

interface NavSection {
  label: string;
  items: { href: string; label: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    label: 'CONTENIDO',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
      { href: '/admin/multimedia', label: 'Multimedia', icon: Image },
      { href: '/admin/programacion', label: 'Programación', icon: CalendarDays },
    ],
  },
  {
    label: 'DEPORTES',
    items: [
      { href: '/admin/deportes', label: 'Deportes', icon: Trophy },
      { href: '/admin/divisiones', label: 'Divisiones', icon: Shield },
      { href: '/admin/equipos', label: 'Equipos', icon: Shield },
      { href: '/admin/jugadores', label: 'Jugadores', icon: Users },
    ],
  },
  {
    label: 'COMPETICIÓN',
    items: [
      { href: '/admin/partidos', label: 'Partidos', icon: Swords },
      { href: '/admin/posiciones', label: 'Posiciones', icon: Shield },
      { href: '/admin/estadisticas', label: 'Estadísticas', icon: TrendingUp },
    ],
  },
  {
    label: 'MEDIA',
    items: [
      { href: '/admin/transmision', label: 'Transmisión', icon: Tv },
    ],
  },
  {
    label: 'GESTIÓN',
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/admin/login') {
      const directUser = auth.currentUser;
      if (directUser) return;
      redirectTimer.current = setTimeout(() => router.push('/admin/login'), 3000);
    }
    return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
  }, [user, loading, pathname, router]);

  useEffect(() => {
    navSections.forEach((section) => {
      const isActive = section.items.some((item) => pathname === item.href);
      if (isActive) setExpandedSections((prev) => ({ ...prev, [section.label]: true }));
    });
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (loading || !user) {
    const directUser = auth.currentUser;
    if (directUser) return <>{children}</>;
    return null;
  }

  const toggleSection = (label: string) => setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-[var(--border)] bg-[var(--bg-secondary)]/50 p-4 fixed left-0 top-0 overflow-y-auto">
          <div className="flex items-center gap-2 font-display text-lg font-black mb-6 px-3">
            <Zap className="h-5 w-5 text-[var(--accent)] fill-[var(--accent)]" />
            <span className="text-[var(--text)]">ADMIN</span>
          </div>

          <nav className="flex-1 space-y-4">
            {navSections.map((section) => {
              const isSectionActive = section.items.some((item) => pathname === item.href);
              return (
                <div key={section.label}>
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text)]"
                  >
                    {section.label}
                    {expandedSections[section.label] !== false ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                  {(expandedSections[section.label] !== false) && (
                    <div className="mt-1 space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]')}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border)] pt-4 px-3 space-y-2 mt-4">
            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
            <Button variant="ghost" size="sm" className="w-full justify-start text-[var(--text-secondary)]" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </aside>

        <div className="flex-1 md:ml-64">
          <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="font-display text-base font-black"><span className="text-[var(--accent)]">ADMIN</span></div>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /></Button>
          </header>
          <nav className="md:hidden flex overflow-x-auto gap-1 p-2 border-b border-[var(--border)]">
            {navSections.flatMap((s) => s.items).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors', isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)]')}>
                  <Icon className="h-3.5 w-3.5" />{item.label}
                </Link>
              );
            })}
          </nav>
          <main className="p-4 md:p-6 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
