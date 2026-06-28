'use client';

import Link from 'next/link';
import type { Equipo } from '@/types/equipo';
import { Star, MapPin } from 'lucide-react';

interface ClubCardProps {
  equipo: Equipo;
  esPrincipal?: boolean;
  deporteNombre?: string;
}

export function ClubCard({ equipo, esPrincipal, deporteNombre }: ClubCardProps) {
  return (
    <Link
      href={`/equipos/${equipo.id}`}
      className={`block rounded-[var(--radius)] border ${esPrincipal ? 'border-yellow-500/40 bg-yellow-500/[0.06] hover:border-yellow-500' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]'} hover:shadow-md transition-all group`}
    >
      <div className="p-4 flex items-center gap-4">
        <div
          className={`${esPrincipal ? 'w-16 h-16' : 'w-12 h-12'} rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0`}
          style={{ backgroundColor: equipo.colorPrimario || '#E11D48' }}
        >
          {equipo.logoBase64 ? (
            <img src={equipo.logoBase64} alt={equipo.nombre} className="w-3/4 h-3/4 object-contain" />
          ) : (
            <span className="font-black">{equipo.nombreCorto?.slice(0, 2).toUpperCase() || equipo.nombre.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className={`font-bold truncate ${esPrincipal ? 'text-yellow-600 text-base' : 'text-[var(--text)] text-sm'} group-hover:text-[var(--accent)] transition-colors`}>
              {equipo.nombre}
            </h3>
            {esPrincipal && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{deporteNombre || '-'}</p>
          {(equipo.ciudad || equipo.estadio) && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {equipo.ciudad || equipo.estadio}
            </p>
          )}
        </div>
        <span className={`text-xs font-medium ${esPrincipal ? 'text-yellow-600' : 'text-[var(--accent)]'} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
          Ver →
        </span>
      </div>
    </Link>
  );
}
