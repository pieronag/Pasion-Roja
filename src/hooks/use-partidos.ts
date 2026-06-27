'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Partido } from '@/types/partido';

export function usePartidos(opts?: { deporteId?: string; estado?: string; max?: number }) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, 'partidos');
    let q;
    if (opts?.deporteId && opts?.estado) {
      q = query(ref, where('deporteId', '==', opts.deporteId), where('estado', '==', opts.estado), orderBy('fecha', 'desc'));
    } else if (opts?.deporteId) {
      q = query(ref, where('deporteId', '==', opts.deporteId), orderBy('fecha', 'desc'));
    } else if (opts?.estado) {
      q = query(ref, where('estado', '==', opts.estado), orderBy('fecha', 'desc'));
    } else {
      q = query(ref, orderBy('fecha', 'desc'));
    }
    if (opts?.max) q = query(q, limit(opts.max));
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar partidos'); setLoading(false); },
    });
    return () => unsub();
  }, [opts?.deporteId, opts?.estado, opts?.max]);

  return { partidos, loading, error };
}
