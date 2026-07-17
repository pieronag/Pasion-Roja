'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Partido } from '@/types/partido';
import type { EquipoPosicion } from '@/types/estadistica';
import { useEquiposMap } from './use-equipos-map';

const SISTEMA_FUTBOL = { victoria: 3, empate: 1, derrota: 0 };

function calcularTabla(partidos: Partido[], equiposMap: Record<string, any>): EquipoPosicion[] {
  const map = new Map<string, EquipoPosicion>();

  partidos.forEach((p) => {
    [p.equipoLocalId, p.equipoVisitaId].forEach((id) => {
      if (!map.has(id)) {
        const eq = equiposMap[id];
        map.set(id, {
          equipoId: id,
          nombre: eq?.nombre || (id === p.equipoLocalId ? p.equipoLocalNombre : p.equipoVisitaNombre),
          nombreCorto: eq?.nombreCorto || '',
          logoBase64: eq?.logoBase64 || '',
          posicion: 0, posicionAnterior: null,
          pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0, ultimos5: [],
        });
      }
    });
  });

  partidos.forEach((p) => {
    const local = map.get(p.equipoLocalId)!;
    const visita = map.get(p.equipoVisitaId)!;
    local.pj++; visita.pj++;
    local.gf += p.marcadorLocal; local.gc += p.marcadorVisita;
    visita.gf += p.marcadorVisita; visita.gc += p.marcadorLocal;
    if (p.marcadorLocal > p.marcadorVisita) {
      local.pg++; local.pts += SISTEMA_FUTBOL.victoria;
      visita.pp++;
      local.ultimos5.push('G'); visita.ultimos5.push('P');
    } else if (p.marcadorLocal < p.marcadorVisita) {
      visita.pg++; visita.pts += SISTEMA_FUTBOL.victoria;
      local.pp++;
      local.ultimos5.push('P'); visita.ultimos5.push('G');
    } else {
      local.pe++; visita.pe++;
      local.pts += SISTEMA_FUTBOL.empate; visita.pts += SISTEMA_FUTBOL.empate;
      local.ultimos5.push('E'); visita.ultimos5.push('E');
    }
    local.dg = local.gf - local.gc;
    visita.dg = visita.gf - visita.gc;
  });

  return Array.from(map.values()).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

export function usePosiciones() {
  const { equiposMap } = useEquiposMap();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'partidos'),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido));
        setPartidos(all.filter((p) => p.estado === 'finalizado'));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const tabla = useMemo(() => {
    if (!partidos.length) return [];
    const jornadas = [...new Set(partidos.map(p => p.jornada))].sort((a, b) => b - a);
    const tablaActual = calcularTabla(partidos, equiposMap).map((e, i) => ({ ...e, posicion: i + 1 }));
    let tablaAnterior: EquipoPosicion[] = [];
    if (jornadas.length > 1) {
      const partidosAnteriores = partidos.filter(p => p.jornada < jornadas[0]);
      if (partidosAnteriores.length > 0) {
        tablaAnterior = calcularTabla(partidosAnteriores, equiposMap).map((e, i) => ({ ...e, posicion: i + 1 }));
      }
    }
    const posAnteriorMap = new Map<string, number>();
    tablaAnterior.forEach(e => posAnteriorMap.set(e.equipoId, e.posicion));
    return tablaActual.map(e => ({ ...e, posicionAnterior: posAnteriorMap.get(e.equipoId) ?? null }));
  }, [partidos, equiposMap]);

  return { tabla, loading };
}
