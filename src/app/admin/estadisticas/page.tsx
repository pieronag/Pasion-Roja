'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/admin/metric-card';
import { TrendingUp, Save, Search, Users } from 'lucide-react';
import type { Jugador } from '@/types/jugador';

export default function AdminEstadisticasPage() {
  const { deportes } = useDeportes();
  const [deporteId, setDeporteId] = useState('');
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!deporteId) { setLoading(false); return; }
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setJugadores(snap.docs.filter((d) => d.data().deporteId === deporteId).map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, [deporteId]);

  const filtered = jugadores.filter((j) => `${j.nombre} ${j.apellido}`.toLowerCase().includes(search.toLowerCase()));
  const deporte = deportes.find((d) => d.id === deporteId);
  const statsKeys = deporte?.estadisticasDisponibles || ['goles', 'asistencias'];

  const startEdit = (j: Jugador) => { setEditing(j.id); setStats(j.estadisticasTemp || {}); };
  const saveStats = async () => {
    if (!editing) return;
    setSaving(true);
    await updateDoc(doc(db, 'jugadores', editing), { estadisticasTemp: stats });
    setEditing(null); setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Estadísticas</h2><p className="text-sm text-[var(--text-secondary)]">Gestiona estadísticas de jugadores por deporte</p></div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
        <CardContent className="p-4">
          <div className="space-y-1 max-w-xs">
            <Label className="text-[10px] text-[var(--text-muted)]">Deporte</Label>
            <Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setEditing(null); }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
              <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {deporteId && jugadores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Jugadores" value={jugadores.length} icon={Users} gradient="from-purple-500 to-purple-600" />
          <MetricCard label="Activos" value={jugadores.filter(j=>j.activo).length} icon={Users} gradient="from-emerald-500 to-emerald-600" />
          <MetricCard label="Con goles" value={jugadores.filter(j=>(j.estadisticasTemp?.goles||0)>0).length} icon={TrendingUp} gradient="from-orange-500 to-orange-600" />
          <MetricCard label="Total goles" value={jugadores.reduce((s,j)=> s + (j.estadisticasTemp?.goles||0), 0)} icon={TrendingUp} gradient="from-red-500 to-red-600" />
        </div>
      )}

      {deporteId && (
        <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugador..." className="pl-9" /></div>
      )}

      {!deporteId ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : !filtered.length ? <EmptyState title="Sin jugadores" /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">#</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Jugador</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Posición</th>
                {statsKeys.map((key) => (
                  <th key={key} className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">{key}</th>
                ))}
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter((j) => j.activo).map((j) => (
                <tr key={j.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3 text-center font-bold text-[var(--accent)] font-mono text-sm">{j.numero}</td>
                  <td className="p-3 font-medium text-sm text-[var(--text)]">{j.nombre} {j.apellido}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)]">{j.posicion}</td>
                  {statsKeys.map((key) => (
                    <td key={key} className="p-3 text-center">
                      {editing === j.id ? (
                        <Input type="number" className="w-16 h-8 text-sm text-center mx-auto" value={stats[key] || 0} onChange={(e) => setStats((s) => ({ ...s, [key]: parseInt(e.target.value) || 0 }))} />
                      ) : (
                        <span className="font-bold text-[var(--text)]">{j.estadisticasTemp?.[key] || 0}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    {editing === j.id ? (
                      <Button size="sm" onClick={saveStats} loading={saving}><Save className="h-3.5 w-3.5 mr-1" /> Guardar</Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => startEdit(j)} className="text-xs">Editar stats</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
