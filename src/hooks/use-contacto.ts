'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MensajeContacto } from '@/types/contacto';

export function useContacto() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'contacto'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMensajes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MensajeContacto)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const enviarMensaje = async (data: Omit<MensajeContacto, 'id' | 'timestamp' | 'leido'>) => {
    await addDoc(collection(db, 'contacto'), { ...data, leido: false, timestamp: Date.now() });
  };

  return { mensajes, loading, enviarMensaje };
}
