'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Jugador } from '@/types/jugador';

export function useJugadores(equipoId?: string) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, 'jugadores');
    const q = equipoId
      ? query(ref, where('activo', '==', true), orderBy('numero', 'asc'), where('equipoId', '==', equipoId))
      : query(ref, where('activo', '==', true), orderBy('numero', 'asc'));
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar jugadores'); setLoading(false); },
    });
    return () => unsub();
  }, [equipoId]);

  return { jugadores, loading, error };
}
