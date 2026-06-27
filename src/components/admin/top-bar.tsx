'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/admin': 'Panel de Control',
  '/admin/deportes': 'Deportes',
  '/admin/divisiones': 'Divisiones',
  '/admin/equipos': 'Equipos',
  '/admin/jugadores': 'Jugadores',
  '/admin/partidos': 'Partidos',
  '/admin/posiciones': 'Posiciones',
  '/admin/estadisticas': 'Estadísticas',
  '/admin/marcador': 'Marcador en Vivo',
  '/admin/noticias': 'Noticias',
  '/admin/multimedia': 'Multimedia',
  '/admin/programacion': 'Programación',
  '/admin/transmision': 'Transmisión',
  '/admin/sponsors': 'Sponsors',
  '/admin/contacto': 'Contacto',
  '/admin/historial': 'Historial',
};

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || 'Admin';

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] flex-shrink-0 flex items-center justify-between px-4 lg:px-6 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onToggleSidebar} className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </button>
        <h1 className="text-lg font-bold text-[var(--text)] hidden sm:block">{title}</h1>
        <div className="hidden md:flex items-center gap-1 text-xs text-[var(--text-muted)] ml-2">
          <Link href="/admin" className="hover:text-[var(--accent)]">Dashboard</Link>
          {pathname !== '/admin' && (
            <>
              <span>/</span>
              <span className="text-[var(--text-secondary)] font-medium">{title}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input placeholder="Buscar..." className="w-56 h-9 pl-9 pr-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
        </div>

        <ThemeToggle />

        <button className="relative p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <ChevronDown className="h-4 w-4 text-[var(--text-muted)] hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--text)] truncate">{user?.email}</p>
              </div>
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
