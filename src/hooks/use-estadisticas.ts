'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Jugador } from '@/types/jugador';

export function useEstadisticas(deporteId: string, statKey: string = 'goles', max: number = 10) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'jugadores'),
      where('deporteId', '==', deporteId),
      where('activo', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, [deporteId]);

  const rankings = useMemo(() => {
    const filtered = jugadores
      .filter((j) => (j.estadisticasTemp?.[statKey] || 0) > 0)
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
  }, [jugadores, statKey, max]);

  return { rankings, loading };
}
