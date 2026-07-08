'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Equipo } from '@/types/equipo';

export function useEquipos(deporteId?: string) {
  const [allEquipos, setAllEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'equipos'), {
      next: (snap) => {
        setAllEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar equipos'); setLoading(false); },
    });
    return () => unsub();
  }, []);

  const equipos = useMemo(() => {
    let filtered = allEquipos.filter((e) => e.activo);
    if (deporteId) {
      filtered = filtered.filter((e) => e.deporteId === deporteId);
    }
    return filtered;
  }, [allEquipos, deporteId]);

  return { equipos, loading, error };
}
