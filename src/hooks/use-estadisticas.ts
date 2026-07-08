'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Jugador } from '@/types/jugador';

export function useEstadisticas(deporteId: string, statKey: string = 'goles', max: number = 10) {
  const [allJugadores, setAllJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jugadores'), (snap) => {
      setAllJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const rankings = useMemo(() => {
    const filtered = allJugadores
      .filter((j) => j.activo && j.deporteId === deporteId && (j.estadisticasTemp?.[statKey] || 0) > 0)
      .sort((a, b) => (b.estadisticasTemp?.[statKey] || 0) - (a.estadisticasTemp?.[statKey] || 0))
      .slice(0, max)
      .map((j, i) => ({
        posicion: i + 1,
        jugadorId: j.id,
        nombre: `${j.nombre} ${j.apellido}`,
        equipoId: j.equipoId,
        numero: j.numero,
        fotoBase64: j.fotoBase64,
        valor: j.estadisticasTemp?.[statKey] || 0,
      }));
    return filtered;
  }, [allJugadores, deporteId, statKey, max]);

  return { rankings, loading };
}
