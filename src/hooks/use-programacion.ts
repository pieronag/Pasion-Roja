'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Programa } from '@/types/programa';

export function useProgramacion(tipo?: 'radio' | 'tv') {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, 'programas');
    const q = tipo
      ? query(ref, where('activo', '==', true), where('tipo', 'in', [tipo, 'ambos']))
      : query(ref, where('activo', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      setProgramas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programa)));
      setLoading(false);
    });
    return () => unsub();
  }, [tipo]);

  return { programas, loading };
}
