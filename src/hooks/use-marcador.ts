'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LiveScore {
  id: string;
  equipoLocal: string;
  equipoVis: string;
  equipoLocalId?: string;
  equipoVisitaId?: string;
  marcadorLocal: number;
  marcadorVis: number;
  penalesLocal?: number;
  penalesVis?: number;
  minuto: string;
  minutoSegundos?: number;
  estadoTiempo?: string;
  tiempoInicio?: number;
  inicioPartido?: number;
  actualizadoEn: number;
  deporteId?: string;
}

export function useMarcador() {
  const [partido, setPartido] = useState<LiveScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'partidos_en_vivo', 'actual'),
      {
        next: (snap) => {
          if (snap.exists()) {
            setPartido({ id: snap.id, ...snap.data() } as LiveScore);
          } else {
            setPartido(null);
          }
          setLoading(false);
        },
        error: (err) => {
          console.error('Error fetching partido:', err);
          setError('Error al cargar el marcador');
          setLoading(false);
        },
      }
    );
    return () => unsub();
  }, []);

  return { partido, loading, error };
}
