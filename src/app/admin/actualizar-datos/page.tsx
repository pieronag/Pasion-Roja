'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/shared/loader';
import { cn } from '@/lib/utils';
import { Shield, RefreshCw, CheckCircle2, AlertCircle, Building, Trophy, TrendingUp } from 'lucide-react';
import type { Equipo } from '@/types/equipo';

interface ClubData {
  nombre: string;
  capacidad: number;
  proveedor: string;
  auspiciador: string;
  entrenador: string;
}

interface GolData {
  nombre: string;
  club: string;
  goles: number;
}

const CLUBES: ClubData[] = [
  { nombre: 'Aguará FC', capacidad: 3515, proveedor: 'OLYMPHUS', auspiciador: 'AIR', entrenador: 'FELIPE LUENGO' },
  { nombre: 'Atlético Oriente', capacidad: 2500, proveedor: 'CAPELLI', auspiciador: 'SABRO SUSHI', entrenador: 'AGUSTÍN SALVATIERRA' },
  { nombre: 'Chimbarongo F.C', capacidad: 1500, proveedor: 'VANDIX', auspiciador: 'FRUTTITA', entrenador: 'JOHN BUSTAMANTE' },
  { nombre: 'Comunal Cabrero', capacidad: 3500, proveedor: 'SQUADRA', auspiciador: 'HERNÁNDEZ', entrenador: 'YURI FERNÁNDEZ' },
  { nombre: 'Constitución Unido', capacidad: 2060, proveedor: 'KS7', auspiciador: 'DIMACO', entrenador: 'ALEJANDRO PÉREZ' },
  { nombre: 'Deportes Rancagua', capacidad: 2000, proveedor: 'CELE SIDE', auspiciador: 'VICMAR MINERA', entrenador: 'ÍTALO PINOCHET' },
  { nombre: 'Futuro', capacidad: 3000, proveedor: 'MACRON', auspiciador: 'RG MUSIC', entrenador: 'JORGE SÁEZ' },
  { nombre: 'Imperial Unido', capacidad: 2000, proveedor: 'KOTODUO', auspiciador: 'CMPC', entrenador: 'JOHN BUSTAMANTE' },
  { nombre: 'Lautaro de Buin', capacidad: 2600, proveedor: 'TOQUI', auspiciador: 'PASTO', entrenador: 'CARLOS ENCINAS' },
  { nombre: 'Malleco Unido', capacidad: 2345, proveedor: 'REVOLUCIÓN', auspiciador: 'CMPC', entrenador: 'LUIS PÉREZ' },
  { nombre: 'Municipal Puente Alto', capacidad: 1900, proveedor: 'GIVOVA', auspiciador: 'VOLCÁN', entrenador: 'MIGUEL VALDÉS' },
  { nombre: 'Naval', capacidad: 7200, proveedor: 'FORZA', auspiciador: 'LCT', entrenador: 'SEBASTIÁN ORTIZ' },
  { nombre: 'Quintero Unido', capacidad: 2500, proveedor: 'ZEUS', auspiciador: 'MUNI. DE QUINTERO', entrenador: 'MARCELO PALMA' },
  { nombre: 'Rodelindo Román', capacidad: 3515, proveedor: 'CRON', auspiciador: '', entrenador: 'MANUEL RODRÍGUEZ' },
];

const GOLEADORES: GolData[] = [
  { nombre: 'Matías Leiva', club: 'Quintero Unido', goles: 11 },
  { nombre: 'Luciano Parra', club: 'Aguará', goles: 7 },
  { nombre: 'Pablo Araya', club: 'Atlético Oriente', goles: 6 },
  { nombre: 'Carlos Vásquez', club: 'Constitución Unido', goles: 6 },
  { nombre: 'Matías Aguilar', club: 'Malleco Unido', goles: 6 },
];

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '');
}

function findEquipoMatch(nombre: string, equipos: Equipo[]): Equipo | null {
  const q = normalize(nombre);
  for (const eq of equipos) {
    const eqName = normalize(eq.nombre);
    if (eqName.includes(q) || q.includes(eqName)) return eq;
  }
  return null;
}

export default function ActualizarDatosPage() {
  const { equipos } = useEquipos();
  const [tab, setTab] = useState<'clubes' | 'goleadores'>('clubes');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [allJugadores, setAllJugadores] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setAllJugadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const actualizarClubes = async () => {
    setUpdating(true);
    setLog([]);
    let ok = 0, err = 0, skipped = 0;

    for (const c of CLUBES) {
      const match = findEquipoMatch(c.nombre, equipos);
      if (!match) {
        err++;
        setLog(prev => [...prev, `❌ ${c.nombre} — no encontrado en DB`]);
        continue;
      }

      const updateData: any = {};
      if (match.capacidad !== c.capacidad) updateData.capacidad = c.capacidad;
      if ((match.proveedor || '') !== c.proveedor) updateData.proveedor = c.proveedor;
      if ((match.auspiciador || '') !== c.auspiciador) updateData.auspiciador = c.auspiciador;
      if (match.entrenador !== c.entrenador) updateData.entrenador = c.entrenador;

      if (Object.keys(updateData).length === 0) {
        skipped++;
        setLog(prev => [...prev, `⏭ ${c.nombre} — sin cambios`]);
        continue;
      }

      try {
        await updateDoc(doc(db, 'equipos', match.id), { ...updateData, actualizadoEn: Date.now() });
        ok++;
        setLog(prev => [...prev, `✅ ${c.nombre} — ${Object.keys(updateData).join(', ')}`]);
      } catch (e: any) {
        err++;
        setLog(prev => [...prev, `❌ ${c.nombre} — ${e.message}`]);
      }
    }

    setLog(prev => [...prev, '', `📊 ${ok} actualizados, ${skipped} sin cambios, ${err} errores`]);
    setUpdating(false);
  };

  const actualizarGoles = async () => {
    setUpdating(true);
    setLog([]);
    let ok = 0, err = 0, skipped = 0;

    for (const g of GOLEADORES) {
      const j = allJugadores.find((j: any) => {
        const jq = normalize(j.nombreCompleto || '');
        const q = normalize(g.nombre);
        const eq = findEquipoMatch(g.club, equipos);
        return (jq.includes(q) || q.includes(jq)) && j.equipoId === eq?.id;
      });

      if (!j) {
        err++;
        setLog(prev => [...prev, `❌ ${g.nombre} — no encontrado en ${g.club}`]);
        continue;
      }

      const golesActual = j.estadisticasTemp?.goles || 0;
      if (golesActual === g.goles) {
        skipped++;
        setLog(prev => [...prev, `⏭ ${g.nombre} — ya tiene ${g.goles} goles`]);
        continue;
      }

      try {
        await updateDoc(doc(db, 'jugadores', j.id), {
          estadisticasTemp: { ...j.estadisticasTemp, goles: g.goles },
          actualizadoEn: Date.now(),
        });
        ok++;
        setLog(prev => [...prev, `✅ ${g.nombre} — ${golesActual} → ${g.goles} goles`]);
      } catch (e: any) {
        err++;
        setLog(prev => [...prev, `❌ ${g.nombre} — ${e.message}`]);
      }
    }

    setLog(prev => [...prev, '', `📊 ${ok} actualizados, ${skipped} sin cambios, ${err} errores`]);
    setUpdating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">Actualizar Datos</h2>
        <p className="text-sm text-[var(--text-secondary)]">Actualización masiva de clubes y goleadores</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('clubes')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5', tab === 'clubes' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
          <Building className="h-4 w-4" /> Clubes ({CLUBES.length})
        </button>
        <button onClick={() => setTab('goleadores')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5', tab === 'goleadores' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
          <TrendingUp className="h-4 w-4" /> Goleadores ({GOLEADORES.length})
        </button>
      </div>

      {loading ? (
        <Loader size="sm" />
      ) : tab === 'clubes' ? (
        <>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
              <Building className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Clubes</span>
              <span className="text-[10px] text-[var(--text-muted)] ml-auto">Capacidad · Proveedor · Auspiciador · DT</span>
            </div>
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {CLUBES.map((c) => {
                const match = findEquipoMatch(c.nombre, equipos);
                return (
                  <div key={c.nombre} className={cn('rounded-[var(--radius-sm)] border p-2.5 text-xs', match ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-red-500/30 bg-red-500/[0.04]')}>
                    <p className="font-bold text-[var(--text)] mb-1">{c.nombre.toUpperCase()}</p>
                    <div className="space-y-0.5 text-[var(--text-secondary)]">
                      <p>{c.capacidad} esp. · {c.proveedor}</p>
                      <p>{c.auspiciador || '—'}</p>
                      <p>DT: {c.entrenador}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={actualizarClubes} loading={updating} disabled={updating} size="lg" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            {updating ? 'Actualizando...' : `Actualizar ${CLUBES.length} clubes`}
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Goleadores a actualizar</span>
            </div>
            <div className="p-3 space-y-1">
              {GOLEADORES.map((g) => {
                const match = allJugadores.find((j: any) => {
                  const jq = normalize(j.nombreCompleto || '');
                  const q = normalize(g.nombre);
                  const eq = findEquipoMatch(g.club, equipos);
                  return (jq.includes(q) || q.includes(jq)) && j.equipoId === eq?.id;
                });
                const actual = match?.estadisticasTemp?.goles || 0;
                return (
                  <div key={g.nombre} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border border-[var(--border)]">
                    <Trophy className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">{g.nombre}</p>
                      <p className="text-xs text-[var(--text-muted)]">{g.club}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {match ? <span className="text-[10px] text-emerald-500 font-medium">Encontrado</span> : <span className="text-[10px] text-red-400 font-medium">Sin match</span>}
                      <span className="text-lg font-black text-[var(--accent)]">{actual}</span>
                      <span className="text-xs text-[var(--text-muted)]">→</span>
                      <span className="text-lg font-black text-emerald-500">{g.goles}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={actualizarGoles} loading={updating} disabled={updating} size="lg" className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            {updating ? 'Actualizando...' : `Actualizar ${GOLEADORES.length} goleadores`}
          </Button>
        </>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--text)]">Bitacora</span>
          </div>
          <div className="p-3 max-h-64 overflow-y-auto text-xs font-mono space-y-0.5 scrollbar-thin">
            {log.map((line, i) => (
              <p key={i} className={cn(
                line.startsWith('❌') ? 'text-red-400' : line.startsWith('✅') ? 'text-emerald-400' : line.startsWith('⏭') ? 'text-yellow-400' : line.startsWith('📊') ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
              )}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
