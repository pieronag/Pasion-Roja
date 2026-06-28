'use client';

import Link from 'next/link';
import { cn, equipoUrl } from '@/lib/utils';
import type { Equipo } from '@/types/equipo';
import { MapPin } from 'lucide-react';

export function EquipoCard({ equipo }: { equipo: Equipo }) {
  return (
    <Link
      href={equipoUrl(equipo.id, equipo.nombre)}
      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-md transition-all group"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
        style={{ backgroundColor: equipo.colorPrimario || '#E11D48' }}
      >
        {equipo.logoBase64 ? (
          <img src={equipo.logoBase64} alt={equipo.nombre} className="w-10 h-10 object-contain logo-img" />
        ) : (
          equipo.nombreCorto?.slice(0, 3).toUpperCase() || equipo.nombre.slice(0, 3).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
          {equipo.nombre}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3" /> {equipo.ciudad || equipo.estadio}
        </p>
      </div>
    </Link>
  );
}
