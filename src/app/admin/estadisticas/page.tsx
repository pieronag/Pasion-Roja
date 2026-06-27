'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import type { Jugador } from '@/types/jugador';

export default function AdminEstadisticasPage() {
  const { deportes } = useDeportes();
  const [deporteId, setDeporteId] = useState('');
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!deporteId) return;
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setJugadores(snap.docs.filter((d) => d.data().deporteId === deporteId).map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, [deporteId]);

  const startEdit = (j: Jugador) => {
    setEditing(j.id);
    setStats(j.estadisticasTemp || {});
  };

  const saveStats = async () => {
    if (!editing) return;
    setSaving(true);
    await updateDoc(doc(db, 'jugadores', editing), { estadisticasTemp: stats });
    setEditing(null);
    setSaving(false);
  };

  const deporte = deportes.find((d) => d.id === deporteId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Estadísticas</h1>
      <div className="space-y-2">
        <Label>Deporte</Label>
        <Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setEditing(null); }}>
          <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
          <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!deporteId ? <EmptyState title="Selecciona un deporte" /> : loading ? <Loader /> : (
        <div className="space-y-2">
          {jugadores.filter((j) => j.activo).map((j) => (
            <div key={j.id} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent)] font-mono">#{j.numero}</span>
                <span className="text-sm font-medium text-[var(--text)] flex-1">{j.nombre} {j.apellido}</span>
                <Button variant="ghost" size="sm" onClick={() => startEdit(j)}>
                  {editing === j.id ? 'Editando...' : 'Editar stats'}
                </Button>
              </div>
              {editing === j.id && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {(deporte?.estadisticasDisponibles || ['goles', 'asistencias', 'tarjetas']).map((key) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-xs text-[var(--text-secondary)] capitalize">{key}:</span>
                        <Input
                          type="number"
                          className="w-16 h-8 text-sm text-center"
                          value={stats[key] || 0}
                          onChange={(e) => setStats((s) => ({ ...s, [key]: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" onClick={saveStats} loading={saving}><Save className="h-3.5 w-3.5 mr-1" /> Guardar</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
