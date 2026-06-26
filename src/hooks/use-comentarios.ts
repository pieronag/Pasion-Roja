'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Comentario } from '@/types/partido';

export function useComentarios(partidoId: string) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, `partidos_en_vivo/${partidoId}/comentarios`),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      setComentarios(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comentario)));
      setLoading(false);
    });
    return () => unsub();
  }, [partidoId]);

  const enviarComentario = async (usuario: string, texto: string) => {
    await addDoc(collection(db, `partidos_en_vivo/${partidoId}/comentarios`), {
      usuario,
      texto,
      timestamp: Date.now(),
    });
  };

  return { comentarios, loading, enviarComentario };
}
