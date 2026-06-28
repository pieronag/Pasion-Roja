'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Equipo } from '@/types/equipo';

export function useEquiposMap() {
  const [map, setMap] = useState<Record<string, Equipo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      const m: Record<string, Equipo> = {};
      snap.docs.forEach((d) => { m[d.id] = { id: d.id, ...d.data() } as Equipo; });
      setMap(m);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { equiposMap: map, loading };
}
