'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchScoreboard } from './match-scoreboard';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';
import type { Partido } from '@/types/partido';

export function PartidoDetailClient({ partidoId }: { partidoId: string }) {
  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'partidos', partidoId), (snap) => {
      if (snap.exists()) setPartido({ id: snap.id, ...snap.data() } as Partido);
      setLoading(false);
    });
    return () => unsub();
  }, [partidoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-48 w-full rounded-2xl" /></div>;
  if (!partido) return <EmptyState title="Partido no encontrado" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/partidos" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Volver a partidos
      </Link>
      <MatchScoreboard partido={partido} fullWidth />

      {partido.eventos?.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text)] mb-3">
            <Activity className="h-5 w-5 text-[var(--accent)]" /> Eventos del Partido
          </h2>
          <div className="space-y-1">
            {partido.eventos.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
                <span className="text-xs font-bold text-[var(--accent)] font-mono w-10">{e.minuto}'</span>
                <span className="text-sm text-[var(--text)]">{e.jugador}</span>
                <span className="text-xs text-[var(--text-secondary)] capitalize ml-auto">{e.tipo.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
