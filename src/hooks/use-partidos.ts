'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Partido } from '@/types/partido';

export function usePartidos(opts?: { estado?: string; max?: number }) {
  const [allPartidos, setAllPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, 'partidos');
    const q = query(ref, orderBy('fecha', 'desc'), limit((opts?.max ?? 50) * 3));
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setAllPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar partidos'); setLoading(false); },
    });
    return () => unsub();
  }, []);

  const partidos = useMemo(() => {
    let filtered = allPartidos;
    if (opts?.estado) {
      filtered = filtered.filter((p) => p.estado === opts.estado);
    }
    filtered.sort((a, b) => (b.fecha ?? 0) - (a.fecha ?? 0));
    if (opts?.max) {
      filtered = filtered.slice(0, opts.max);
    }
    return filtered;
  }, [allPartidos, opts?.estado, opts?.max]);

  return { partidos, loading, error };
}
