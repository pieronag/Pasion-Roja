'use client';

import type { Programa } from '@/types/programa';
import { cn } from '@/lib/utils';
import { Radio, Tv, Clock, User } from 'lucide-react';

const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function ProgramCard({ programa }: { programa: Programa }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
          {programa.tipo === 'radio' || programa.tipo === 'ambos' ? (
            <Radio className="h-5 w-5 text-[var(--accent)]" />
          ) : (
            <Tv className="h-5 w-5 text-[var(--accent)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--text)] truncate">{programa.titulo}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">{programa.descripcion}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{programa.host}</span>
            {programa.horarios[0] && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{dias[programa.horarios[0].dia]} {programa.horarios[0].horaInicio}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
