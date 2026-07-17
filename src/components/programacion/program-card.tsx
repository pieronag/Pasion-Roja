'use client';

import type { Programa } from '@/types/programa';
import { Clock, User } from 'lucide-react';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function ProgramCard({ programa }: { programa: Programa }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent)]/30 transition-all">
      {programa.imagenPortada && (
        <img src={programa.imagenPortada} alt={programa.titulo} className="w-full aspect-video object-cover rounded-[var(--radius-xs)] mb-3" />
      )}
      <h3 className="font-bold text-sm text-[var(--text)]">{programa.titulo}</h3>
      {programa.descripcion && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{programa.descripcion}</p>}
      {programa.host && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
          <User className="h-3 w-3" /> {programa.host}
        </p>
      )}
      {programa.horarios?.map((h, i) => (
        <p key={i} className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {diasSemana[h.dia]} {h.horaInicio} - {h.horaFin}
        </p>
      ))}
    </div>
  );
}
