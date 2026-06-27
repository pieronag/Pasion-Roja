'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sponsor } from '@/types/sponsor';

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sponsors'), where('activo', '==', true), orderBy('orden', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setSponsors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { sponsors, loading };
}
