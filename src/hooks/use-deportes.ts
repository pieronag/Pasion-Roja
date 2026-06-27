'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Deporte } from '@/types/deporte';

export function useDeportes() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'deportes'), orderBy('orden', 'asc'));
    const unsub = onSnapshot(q, {
      next: (snap) => {
        setDeportes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deporte)));
        setLoading(false);
      },
      error: (err) => { console.error(err); setError('Error al cargar deportes'); setLoading(false); },
    });
    return () => unsub();
  }, []);

  return { deportes, loading, error };
}
