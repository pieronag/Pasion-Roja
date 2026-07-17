'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePosiciones } from '@/hooks/use-posiciones';
import { LeagueTable } from '@/components/posiciones/league-table';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricCard } from '@/components/admin/metric-card';
import { RefreshCw, Shield, Swords, TrendingUp, Trophy } from 'lucide-react';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import type { Division } from '@/types/division';

export default function AdminPosicionesPage() {
  const { equiposMap } = useEquiposMap();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const { tabla, loading } = usePosiciones();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, []);

  const divSeleccionada = divisiones.find(d => d.id === selectedDivision);

  useEffect(() => {
    if (divisiones.length > 0 && !selectedDivision) {
      setSelectedDivision(divisiones[0].id);
    }
  }, [divisiones, selectedDivision]);

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Posiciones</h2><p className="text-sm text-[var(--text-secondary)]">Tablas calculadas automáticamente desde los resultados</p></div>

      {tabla.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Equipos" value={tabla.length} icon={Shield} gradient="from-blue-500 to-blue-600" />
          <MetricCard label="Partidos" value={Math.round(tabla.reduce((s,e)=>s+e.pj,0)/2)} icon={Swords} gradient="from-red-500 to-red-600" />
          <MetricCard label="Goles" value={tabla.reduce((s,e)=>s+e.gf,0)} icon={TrendingUp} gradient="from-orange-500 to-orange-600" />
          <MetricCard label="Prom. gol" value={(tabla.reduce((s,e)=>s+e.gf,0) / Math.max(1, tabla.length)).toFixed(1)} icon={TrendingUp} gradient="from-purple-500 to-purple-600" />
        </div>
      )}

      {/* Division filter */}
      {divisiones.length > 0 && (
        <div className="w-64">
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger><SelectValue placeholder="Seleccionar división" /></SelectTrigger>
            <SelectContent>
              {divisiones.map((d) => (
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
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><RefreshCw className="h-3.5 w-3.5" /> Datos actualizados en tiempo real</div>

      {loading ? <Loader /> : tabla.length > 0 ? (
        <LeagueTable 
          equipos={tabla} 
          ascensos={divSeleccionada?.ascensos || 0} 
          descensos={divSeleccionada?.descensos || 0} 
          liguillaDesde={divSeleccionada?.puestosLiguillaDesde || 0}
          liguillaHasta={divSeleccionada?.puestosLiguillaHasta || 0}
          tipoLiguilla={divSeleccionada?.tipoLiguilla || ''}
          promocionDesde={divSeleccionada?.puestosPromocionDesde || 0}
          promocionHasta={divSeleccionada?.puestosPromocionHasta || 0}
          equipoPrincipalId={Object.values(equiposMap).find(e => e.esPrincipal)?.id}
        />
      ) : (
        <EmptyState title="Sin datos" description="No hay partidos finalizados" icon={<Trophy />} />
      )}
    </div>
  );
}
