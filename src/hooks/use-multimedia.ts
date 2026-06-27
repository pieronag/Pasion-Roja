'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Multimedia } from '@/types/multimedia';

export function useMultimedia(tipo?: string, max = 20) {
  const [items, setItems] = useState<Multimedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'multimedia'), orderBy('fecha', 'desc'), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Multimedia)));
      setLoading(false);
    });
    return () => unsub();
  }, [tipo, max]);

  return { items, loading };
}
