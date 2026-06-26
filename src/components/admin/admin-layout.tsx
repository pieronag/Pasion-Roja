'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Swords, Newspaper, Radio, History, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/marcador', label: 'Marcador', icon: Swords },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/transmision', label: 'Transmisión', icon: Radio },
  { href: '/admin/historial', label: 'Historial', icon: History },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-pizarra">
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-pizarra-claro bg-pizarra/50 p-4 fixed left-0 top-0">
          <div className="flex items-center gap-2 font-display text-lg font-black mb-8 px-3">
            <Zap className="h-5 w-5 text-rojo fill-rojo" />
            <span>PASIÓN <span className="text-rojo">ROJA</span></span>
            <span className="text-[10px] text-gray-600 font-sans font-normal ml-auto">ADMIN</span>
          </div>

          <nav className="flex-1 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-rojo/10 text-rojo' : 'text-gray-400 hover:text-white hover:bg-pizarra-claro/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-pizarra-claro pt-4 px-3 space-y-2">
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </aside>

        <div className="flex-1 md:ml-64">
          <header className="md:hidden flex items-center justify-between p-4 border-b border-pizarra-claro">
            <div className="flex items-center gap-2 font-display text-base font-black">
              <Zap className="h-4 w-4 text-rojo fill-rojo" />
              <span>ADMIN</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </header>

          <nav className="md:hidden flex overflow-x-auto gap-1 p-2 border-b border-pizarra-claro">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-rojo/10 text-rojo' : 'text-gray-400'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main className="p-4 md:p-6 max-w-5xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
