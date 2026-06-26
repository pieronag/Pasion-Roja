'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConfigTransmision } from '@/types/transmision';

export function useTransmision() {
  const [config, setConfig] = useState<ConfigTransmision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'config_transmision', 'actual'),
      {
        next: (snap) => {
          if (snap.exists()) {
            setConfig({ id: snap.id, ...snap.data() } as ConfigTransmision);
          } else {
            setConfig(null);
          }
          setLoading(false);
        },
        error: (err) => {
          console.error('Error fetching transmision:', err);
          setError('Error al cargar transmisión');
          setLoading(false);
        },
      }
    );
    return () => unsub();
  }, []);

  return { config, loading, error };
}
