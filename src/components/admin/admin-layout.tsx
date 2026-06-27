'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/admin/top-bar';
import { Breadcrumbs } from '@/components/admin/breadcrumbs';
import {
  LayoutDashboard, Newspaper, Image, Tv,
  Trophy, Shield, Users, Swords, TrendingUp,
  HeartHandshake, MessageCircle, History, LogOut, Zap,
  CalendarDays, PanelLeftClose, PanelLeft, Radio,
  Layers, Medal,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { auth } from '@/lib/firebase';

interface NavItem { href: string; label: string; icon: any; }

const navSections: { label: string; items: NavItem[] }[] = [
  { label: 'Menu', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
    { href: '/admin/multimedia', label: 'Multimedia', icon: Image },
    { href: '/admin/programacion', label: 'Programación', icon: CalendarDays },
  ]},
  { label: 'Deportes', items: [
    { href: '/admin/deportes', label: 'Deportes', icon: Trophy },
    { href: '/admin/divisiones', label: 'Divisiones', icon: Layers },
    { href: '/admin/equipos', label: 'Equipos', icon: Shield },
    { href: '/admin/jugadores', label: 'Jugadores', icon: Users },
  ]},
  { label: 'Competición', items: [
    { href: '/admin/partidos', label: 'Partidos', icon: Swords },
    { href: '/admin/posiciones', label: 'Posiciones', icon: Medal },
    { href: '/admin/estadisticas', label: 'Estadísticas', icon: TrendingUp },
    { href: '/admin/marcador', label: 'Marcador Live', icon: Tv },
  ]},
  { label: 'Media', items: [
    { href: '/admin/transmision', label: 'Transmisión', icon: Radio },
  ]},
  { label: 'Gestión', items: [
    { href: '/admin/sponsors', label: 'Sponsors', icon: HeartHandshake },
    { href: '/admin/contacto', label: 'Contacto', icon: MessageCircle },
    { href: '/admin/historial', label: 'Historial', icon: History },
  ]},
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/admin/login') {
      if (auth.currentUser) return;
      redirectTimer.current = setTimeout(() => router.push('/admin/login'), 3000);
    }
    return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
  }, [user, loading, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (loading || !user) {
    if (auth.currentUser) return <>{children}</>;
    return null;
  }

  const sidebarW = collapsed ? 'w-16' : 'w-56';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className={`${sidebarW} flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col transition-all duration-300 h-full`}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 h-14 border-b border-[var(--border)] flex-shrink-0">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight">
                <span className="font-bold text-sm text-[var(--text)] whitespace-nowrap">PASIÓN ROJA</span>
                <span className="text-[8px] text-[var(--accent)] font-semibold block tracking-wider">ADMIN PANEL</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin">
            {navSections.map((section) => (
              <div key={section.label} className="mb-3 last:mb-0">
                {!collapsed && (
                  <p className="px-2 mb-0.5 text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em]">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} className={cn(
                        'flex items-center gap-3 px-2 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all',
                        collapsed ? 'justify-center px-0' : '',
                        isActive ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                      )} title={collapsed ? item.label : undefined}>
                        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-white')} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="flex-shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
            <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 py-2.5 px-2 hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs border-b border-[var(--border)]">
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span>Colapsar</span></>}
            </button>
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] flex-shrink-0">
                  {user.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[var(--text)] truncate leading-tight">{user.email}</p>
                </div>
                <button onClick={logout} className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors" title="Cerrar sesión">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 scrollbar-thin">
            <div className="max-w-[1440px] mx-auto animate-fade-in-up">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
