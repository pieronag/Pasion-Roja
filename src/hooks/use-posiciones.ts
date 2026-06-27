'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Partido } from '@/types/partido';
import type { Deporte } from '@/types/deporte';
import type { EquipoPosicion } from '@/types/estadistica';

export function usePosiciones(deporteId: string) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [deporte, setDeporte] = useState<Deporte | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'partidos'), where('deporteId', '==', deporteId), where('estado', '==', 'finalizado')),
      (snap) => {
        setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
        setLoading(false);
      }
    );
    const unsub2 = onSnapshot(
      query(collection(db, 'deportes')),
      (snap) => {
        const d = snap.docs.find((d) => d.id === deporteId);
        if (d) setDeporte({ id: d.id, ...d.data() } as Deporte);
      }
    );
    return () => { unsub1(); unsub2(); };
  }, [deporteId]);

  const tabla = useMemo(() => {
    if (!partidos.length) return [];
    const equiposMap = new Map<string, EquipoPosicion>();
    const sistema = deporte?.sistemaPuntos || { victoria: 3, empate: 1, derrota: 0 };

    partidos.forEach((p) => {
      [p.equipoLocalId, p.equipoVisitaId].forEach((id) => {
        if (!equiposMap.has(id)) {
          equiposMap.set(id, {
            equipoId: id,
            nombre: id === p.equipoLocalId ? p.equipoLocalNombre : p.equipoVisitaNombre,
            nombreCorto: '',
            logoBase64: '',
            posicion: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0, ultimos5: [],
          });
        }
      });
    });

    partidos.forEach((p) => {
      const local = equiposMap.get(p.equipoLocalId)!;
      const visita = equiposMap.get(p.equipoVisitaId)!;
      local.pj++; visita.pj++;
      local.gf += p.marcadorLocal; local.gc += p.marcadorVisita;
      visita.gf += p.marcadorVisita; visita.gc += p.marcadorLocal;
      if (p.marcadorLocal > p.marcadorVisita) {
        local.pg++; local.pts += sistema.victoria;
        visita.pp++;
        local.ultimos5.push('G'); visita.ultimos5.push('P');
      } else if (p.marcadorLocal < p.marcadorVisita) {
        visita.pg++; visita.pts += sistema.victoria;
        local.pp++;
        local.ultimos5.push('P'); visita.ultimos5.push('G');
      } else {
        local.pe++; visita.pe++;
        local.pts += sistema.empate; visita.pts += sistema.empate;
        local.ultimos5.push('E'); visita.ultimos5.push('E');
      }
      local.dg = local.gf - local.gc;
      visita.dg = visita.gf - visita.gc;
    });

    const sorted = Array.from(equiposMap.values()).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
    return sorted.map((e, i) => ({ ...e, posicion: i + 1 }));
  }, [partidos, deporte]);

  return { tabla, loading };
}
