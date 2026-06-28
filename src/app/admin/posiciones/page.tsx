'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from '@/components/posiciones/league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricCard } from '@/components/admin/metric-card';
import { Trophy, RefreshCw, Shield, Swords, TrendingUp, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import type { Division } from '@/types/division';

export default function AdminPosicionesPage() {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [selectedDeporte, setSelectedDeporte] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const activeDeporte = selectedDeporte || deportes[0]?.id || '';
  const { tabla, loading } = usePosiciones(activeDeporte);

  // Load divisions
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, []);

  const divisionesFiltradas = divisiones.filter(d => d.deporteId === activeDeporte);
  const divSeleccionada = divisiones.find(d => d.id === selectedDivision);

  // Auto-select first division when sport changes
  useEffect(() => {
    if (divisionesFiltradas.length > 0 && !selectedDivision) {
      setSelectedDivision(divisionesFiltradas[0].id);
    }
  }, [activeDeporte, divisionesFiltradas, selectedDivision]);

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Posiciones</h2><p className="text-sm text-[var(--text-secondary)]">Tablas calculadas automáticamente desde los resultados</p></div>

      {tabla.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Equipos" value={tabla.length} icon={Shield} gradient="from-blue-500 to-blue-600" />
          <MetricCard label="Partidos" value={Math.round(tabla.reduce((s,e)=>s+e.pj,0)/2)} icon={Swords} gradient="from-red-500 to-red-600" />
          <MetricCard label="Goles" value={tabla.reduce((s,e)=>s+e.gf,0)} icon={TrendingUp} gradient="from-orange-500 to-orange-600" />
          <MetricCard label="Prom. gol" value={(tabla.reduce((s,e)=>s+e.gf,0) / Math.max(1, tabla.length)).toFixed(1)} icon={TrendingUp} gradient="from-purple-500 to-purple-600" />
          {divSeleccionada?.tipoLiguilla && divSeleccionada.tipoLiguilla !== 'none' && (
            <MetricCard 
              label={divSeleccionada.tipoLiguilla === 'cuadrangular' ? 'Cuadrangular' : 'Liguilla'} 
              value={`${divSeleccionada.puestosLiguillaDesde}-${divSeleccionada.puestosLiguillaHasta}`} 
              icon={ListChecks} 
              gradient="from-sky-500 to-sky-600" 
            />
          )}
        </div>
      )}

      {/* Sport filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {deportes.map((d) => (
            <button key={d.id} onClick={() => { setSelectedDeporte(d.id); setSelectedDivision(''); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors', activeDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}>
              <SportIcon sport={d.icono} size={14} /> {d.nombre}
            </button>
          ))}
        </div>
        <div className="w-64">
          <Select value={selectedDivision} onValueChange={setSelectedDivision} disabled={!activeDeporte || divisionesFiltradas.length === 0}>
            <SelectTrigger><SelectValue placeholder="Seleccionar división" /></SelectTrigger>
            <SelectContent>
              {divisionesFiltradas.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  <span className="flex items-center gap-2">
                    <span>{d.nombre}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">({d.temporada})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><RefreshCw className="h-3.5 w-3.5" /> Datos actualizados en tiempo real</div>

      {!activeDeporte ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : (
        <LeagueTable 
          equipos={tabla} 
          ascensos={divSeleccionada?.ascensos || 0} 
          descensos={divSeleccionada?.descensos || 0} 
          liguillaDesde={divSeleccionada?.puestosLiguillaDesde || 0}
          liguillaHasta={divSeleccionada?.puestosLiguillaHasta || 0}
          tipoLiguilla={divSeleccionada?.tipoLiguilla || ''}
          equipoPrincipalId={Object.values(equiposMap).find(e => e.esPrincipal)?.id}
        />
      )}
      {tabla.length === 0 && !loading && activeDeporte && <EmptyState title="Sin datos" description="No hay partidos finalizados en este deporte" />}
    </div>
  );
}
