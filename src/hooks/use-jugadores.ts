'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Jugador } from '@/types/jugador';

export function useJugadores(equipoId?: string) {
  const [allJugadores, setAllJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jugadores'), {
      next: (snap) => {
        setAllJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar jugadores'); setLoading(false); },
    });
    return () => unsub();
  }, []);

  const jugadores = useMemo(() => {
    let filtered = allJugadores.filter((j) => j.activo);
    if (equipoId) {
      filtered = filtered.filter((j) => j.equipoId === equipoId);
    }
    return filtered.sort((a, b) => (a.numero ?? 99) - (b.numero ?? 99));
  }, [allJugadores, equipoId]);

  return { jugadores, loading, error };
}
