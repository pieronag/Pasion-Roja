'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { EstadoTiempo } from '@/types/partido';

interface CronometroState {
  estadoTiempo: EstadoTiempo;
  minutoDisplay: string;
  minutoSegundos: number;
  tiempoInicio: number;
  inicioPartido: number;
  penalesLocal: number;
  penalesVisita: number;
}

const BASES: Record<string, number> = {
  pendiente: 0,
  primer_tiempo: 0,
  descanso: 0,
  segundo_tiempo: 45,
  te1: 90,
  descanso_te: 90,
  te2: 105,
  penales: 120,
  finalizado: 0,
};

export function useCronometro(partidoId: string, initialData?: Partial<CronometroState>) {
  const [estadoTiempo, setEstadoTiempo] = useState<EstadoTiempo>(initialData?.estadoTiempo || 'pendiente');
  const [minutoDisplay, setMinutoDisplay] = useState(initialData?.minutoDisplay || '0');
  const [minutoSegundos, setMinutoSegundos] = useState(initialData?.minutoSegundos || 0);
  const [tiempoInicio, setTiempoInicio] = useState(initialData?.tiempoInicio || 0);
  const [inicioPartido, setInicioPartido] = useState(initialData?.inicioPartido || 0);
  const [penalesLocal, setPenalesLocal] = useState(initialData?.penalesLocal || 0);
  const [penalesVisita, setPenalesVisita] = useState(initialData?.penalesVisita || 0);
  const [marcadorLocal, setMarcadorLocal] = useState(0);
  const [marcadorVisita, setMarcadorVisita] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef(initialData);
  const firstRender = useRef(true);

  // Re-sync when initialData arrives after mount (e.g. Firestore data loads async)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      initialDataRef.current = initialData;
      return;
    }
    if (!initialData || initialData === initialDataRef.current) return;
    initialDataRef.current = initialData;
    if (initialData.estadoTiempo) setEstadoTiempo(initialData.estadoTiempo);
    if (initialData.minutoDisplay !== undefined) setMinutoDisplay(initialData.minutoDisplay);
    if (initialData.minutoSegundos !== undefined) setMinutoSegundos(initialData.minutoSegundos);
    if (initialData.tiempoInicio !== undefined) setTiempoInicio(initialData.tiempoInicio);
    if (initialData.inicioPartido !== undefined) setInicioPartido(initialData.inicioPartido);
    if (initialData.penalesLocal !== undefined) setPenalesLocal(initialData.penalesLocal);
    if (initialData.penalesVisita !== undefined) setPenalesVisita(initialData.penalesVisita);
  }, [initialData]);

  // Escribe en Firestore
  const syncToFirestore = useCallback(async (data: any) => {
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        ...data,
        actualizadoEn: Date.now(),
      }, { merge: true });
      if (partidoId) {
        await updateDoc(doc(db, 'partidos', partidoId), {
          ...data,
          actualizadoEn: Date.now(),
        });
      }
    } catch {}
  }, [partidoId]);

  // Temporizador: corre cada segundo cuando está en tiempo de juego
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!['primer_tiempo', 'segundo_tiempo', 'te1', 'te2'].includes(estadoTiempo) || !tiempoInicio) return;

    intervalRef.current = setInterval(() => {
      const ahora = Date.now();
      const segundos = Math.floor((ahora - tiempoInicio) / 1000);
      setMinutoSegundos(segundos);

      const base = BASES[estadoTiempo] || 0;
      const mins = Math.floor(segundos / 60);
      const total = base + mins;
      const display = total.toString();
      setMinutoDisplay(display);

      // Sync a Firestore cada 3 segundos para no saturar
      if (segundos % 3 === 0) {
        syncToFirestore({
          minuto: display,
          minutoSegundos: segundos,
          estadoTiempo,
          tiempoInicio,
          inicioPartido,
        });
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [estadoTiempo, tiempoInicio, inicioPartido, syncToFirestore]);

  const iniciarPrimerTiempo = useCallback(async () => {
    const now = Date.now();
    setEstadoTiempo('primer_tiempo');
    setTiempoInicio(now);
    setInicioPartido(now);
    setMinutoDisplay('0');
    setMinutoSegundos(0);
    await syncToFirestore({
      estadoTiempo: 'primer_tiempo',
      minuto: '0',
      minutoSegundos: 0,
      tiempoInicio: now,
      inicioPartido: now,
      estado: 'en_vivo',
    });
  }, [syncToFirestore]);

  const pausarDescanso = useCallback(async () => {
    const segundos = minutoSegundos;
    setEstadoTiempo('descanso');
    const display = Math.min(45, Math.floor(segundos / 60)).toString();
    setMinutoDisplay(display);
    await syncToFirestore({ estadoTiempo: 'descanso', minuto: display, minutoSegundos: segundos, tiempoInicio: 0 });
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [minutoSegundos, syncToFirestore]);

  const iniciarSegundoTiempo = useCallback(async () => {
    const now = Date.now();
    setEstadoTiempo('segundo_tiempo');
    setTiempoInicio(now);
    setMinutoDisplay('45');
    setMinutoSegundos(0);
    await syncToFirestore({ estadoTiempo: 'segundo_tiempo', minuto: '45', minutoSegundos: 0, tiempoInicio: now });
  }, [syncToFirestore]);

  const iniciarTE1 = useCallback(async () => {
    const now = Date.now();
    setEstadoTiempo('te1');
    setTiempoInicio(now);
    setMinutoDisplay('90');
    setMinutoSegundos(0);
    await syncToFirestore({ estadoTiempo: 'te1', minuto: '90', minutoSegundos: 0, tiempoInicio: now });
  }, [syncToFirestore]);

  const pausarDescansoTE = useCallback(async () => {
    const segundos = minutoSegundos;
    setEstadoTiempo('descanso_te');
    const display = (BASES.te1 + Math.floor(segundos / 60)).toString();
    setMinutoDisplay(display);
    await syncToFirestore({ estadoTiempo: 'descanso_te', minuto: display, minutoSegundos: segundos, tiempoInicio: 0 });
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [minutoSegundos, syncToFirestore]);

  const iniciarTE2 = useCallback(async () => {
    const now = Date.now();
    setEstadoTiempo('te2');
    setTiempoInicio(now);
    setMinutoDisplay('105');
    setMinutoSegundos(0);
    await syncToFirestore({ estadoTiempo: 'te2', minuto: '105', minutoSegundos: 0, tiempoInicio: now });
  }, [syncToFirestore]);

  const iniciarPenales = useCallback(async () => {
    setEstadoTiempo('penales');
    setMinutoDisplay('PEN');
    setMinutoSegundos(0);
    setTiempoInicio(0);
    await syncToFirestore({ estadoTiempo: 'penales', minuto: 'PEN', minutoSegundos: 0, tiempoInicio: 0 });
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [syncToFirestore]);

  const golPenalLocal = useCallback(async () => {
    const nuevo = penalesLocal + 1;
    setPenalesLocal(nuevo);
    await syncToFirestore({ penalesLocal: nuevo });
  }, [penalesLocal, syncToFirestore]);

  const golPenalVisita = useCallback(async () => {
    const nuevo = penalesVisita + 1;
    setPenalesVisita(nuevo);
    await syncToFirestore({ penalesVisita: nuevo });
  }, [penalesVisita, syncToFirestore]);

  const finalizarPartido = useCallback(async () => {
    setEstadoTiempo('finalizado');
    if (intervalRef.current) clearInterval(intervalRef.current);
    const display = minutoDisplay || 'FT';
    setMinutoDisplay(display);
    await syncToFirestore({
      estadoTiempo: 'finalizado',
      estado: 'finalizado',
      minuto: display,
      minutoSegundos,
      tiempoInicio: 0,
    });
  }, [minutoDisplay, minutoSegundos, syncToFirestore]);

  const hayEmpate = marcadorLocal === marcadorVisita;
  const puedeTE = estadoTiempo === 'segundo_tiempo' || estadoTiempo === 'te2';
  const puedePenales = estadoTiempo === 'segundo_tiempo' || estadoTiempo === 'te2';

  return {
    estadoTiempo,
    minutoDisplay,
    minutoSegundos,
    tiempoInicio,
    penalesLocal,
    penalesVisita,
    marcadorLocal, setMarcadorLocal,
    marcadorVisita, setMarcadorVisita,
    hayEmpate,
    puedeTE,
    puedePenales,
    iniciarPrimerTiempo,
    pausarDescanso,
    iniciarSegundoTiempo,
    iniciarTE1,
    pausarDescansoTE,
    iniciarTE2,
    iniciarPenales,
    golPenalLocal,
    golPenalVisita,
    finalizarPartido,
  };
}
