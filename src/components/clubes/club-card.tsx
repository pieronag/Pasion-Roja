'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, limit as fLimit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Equipo } from '@/types/equipo';
import type { Partido } from '@/types/partido';
import { Star, MapPin } from 'lucide-react';
import { cn, equipoUrl } from '@/lib/utils';

interface ClubCardProps {
  equipo: Equipo;
  esPrincipal?: boolean;
  deporteNombre?: string;
}

export function ClubCard({ equipo, esPrincipal, deporteNombre }: ClubCardProps) {
  const [ultimos5, setUltimos5] = useState<{ resultado: 'G' | 'E' | 'P' }[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'partidos'), orderBy('fecha', 'desc'), fLimit(50));
    const unsub = onSnapshot(q, (snap) => {
      const todos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      const delEquipo = todos.filter(
        p => p.estado === 'finalizado' && (p.equipoLocalId === equipo.id || p.equipoVisitaId === equipo.id)
      ).slice(0, 5);
      const res = delEquipo.map(p => {
        const localGano = p.marcadorLocal > p.marcadorVisita;
        const empate = p.marcadorLocal === p.marcadorVisita;
        const esLocal = p.equipoLocalId === equipo.id;
        if (empate) return { resultado: 'E' as const };
        if ((esLocal && localGano) || (!esLocal && !localGano)) return { resultado: 'G' as const };
        return { resultado: 'P' as const };
      });
      setUltimos5(res);
    }, () => {});
    return () => unsub();
  }, [equipo.id]);

  return (
    <Link
      href={equipoUrl(equipo.id, equipo.nombre)}
      className={`block rounded-[var(--radius)] border ${esPrincipal ? 'border-yellow-500/40 bg-yellow-500/[0.06] hover:border-yellow-500' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]'} hover:shadow-md transition-all group`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Logo sin fondo circular - más grande y transparente */}
        <div className={`${esPrincipal ? 'w-16 h-16' : 'w-14 h-14'} flex items-center justify-center flex-shrink-0`}>
          {equipo.logoBase64 ? (
            <img src={equipo.logoBase64} alt={equipo.nombre} className="w-full h-full object-contain logo-img" />
          ) : (
            <span className="font-black text-lg">{equipo.nombreCorto?.slice(0, 2).toUpperCase() || equipo.nombre.slice(0, 2).toUpperCase()}</span>
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
          {ultimos5.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[9px] text-[var(--text-muted)] mr-0.5">Últ.5:</span>
              {ultimos5.map((r, i) => (
                <span key={i} className={cn(
                  'inline-flex items-center justify-center w-4 h-4 rounded-full text-[7px] font-bold text-white',
                  r.resultado === 'G' ? 'bg-[var(--success)]' : r.resultado === 'E' ? 'bg-[var(--warning)]' : 'bg-[var(--error)]'
                )}>{r.resultado}</span>
              ))}
            </div>
          )}
        </div>
        <span className={`text-xs font-medium ${esPrincipal ? 'text-yellow-600' : 'text-[var(--accent)]'} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
          Ver →
        </span>
      </div>
    </Link>
  );
}
