'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Programa } from '@/types/programa';

export function useProgramacion(tipo?: 'radio' | 'tv') {
  const [allProgramas, setAllProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'programas'), (snap) => {
      setAllProgramas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programa)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const programas = useMemo(() =>
    allProgramas.filter((p) => p.activo && (!tipo || p.tipo === tipo || p.tipo === 'ambos')),
    [allProgramas, tipo]
  );

  return { programas, loading };
}
