'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Equipo } from '@/types/equipo';

export function useEquipos(deporteId?: string) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, 'equipos');
    const q = deporteId
      ? query(ref, where('activo', '==', true), where('deporteId', '==', deporteId))
      : query(ref, where('activo', '==', true));
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar equipos'); setLoading(false); },
    });
    return () => unsub();
  }, [deporteId]);

  return { equipos, loading, error };
}
