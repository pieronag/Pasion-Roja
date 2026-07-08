'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Noticia } from '@/types/noticia';

export function useNoticias(max = 20) {
  const [allNoticias, setAllNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'noticias'),
      orderBy('createdAt', 'desc'),
      limit(max * 3)
    );
    const unsub = onSnapshot(q, {
      next: (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Noticia));
        setAllNoticias(items);
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

  const noticias = useMemo(() =>
    allNoticias.filter((n) => n.publicado).slice(0, max),
    [allNoticias, max]
  );

  return { noticias, loading, error };
}
