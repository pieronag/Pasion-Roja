'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, House } from 'lucide-react';
import { cn } from '@/lib/utils';

const pageLabels: Record<string, string> = {
  'admin': 'Dashboard',
  'deportes': 'Deportes',
  'divisiones': 'Divisiones',
  'equipos': 'Equipos',
  'jugadores': 'Jugadores',
  'partidos': 'Partidos',
  'posiciones': 'Posiciones',
  'estadisticas': 'Estadísticas',
  'marcador': 'Marcador Live',
  'noticias': 'Noticias',
  'multimedia': 'Multimedia',
  'programacion': 'Programación',
  'transmision': 'Transmisión',
  'sponsors': 'Sponsors',
  'contacto': 'Contacto',
  'historial': 'Historial',
  'importar-jugadores': 'Importar Jugadores',
  'actualizar-clubes': 'Actualizar Clubes',
  'actualizar-datos': 'Actualizar Datos',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/admin/login') return null;

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
      <Link href="/admin" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
        <House className="h-3.5 w-3.5" /> Dashboard
      </Link>
      {segments.slice(1).map((seg, i) => {
        const label = pageLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const href = '/' + segments.slice(0, i + 2).join('/');
        const isLast = i === segments.length - 2;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-[var(--text-secondary)] font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-[var(--accent)] transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
