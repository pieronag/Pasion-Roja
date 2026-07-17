'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goleador } from '@/types/goleador';

export function useGoleadores() {
  const [allGoleadores, setAllGoleadores] = useState<Goleador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'goleadores'), (snap) => {
      setAllGoleadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goleador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const goleadores = useMemo(() =>
    allGoleadores.filter((g) => g.activo).sort((a, b) => b.goles - a.goles),
    [allGoleadores]
  );

  return { goleadores, loading };
}
