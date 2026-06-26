'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Noticia } from '@/types/noticia';

export function useNoticias(max = 20) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'noticias'),
      where('publicado', '==', true),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const unsub = onSnapshot(q, {
      next: (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Noticia));
        setNoticias(items);
        setLoading(false);
      },
      error: (err) => {
        console.error('Error fetching noticias:', err);
        setError('Error al cargar noticias');
        setLoading(false);
      },
    });
    return () => unsub();
  }, [max]);

  return { noticias, loading, error };
}
