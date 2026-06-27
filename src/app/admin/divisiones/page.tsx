'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, Plus, Trash2 } from 'lucide-react';
import type { Division } from '@/types/division';

export default function AdminDivisionesPage() {
  const { deportes } = useDeportes();
  const { equipos } = useEquipos();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [deporteId, setDeporteId] = useState('');
  const [temporada, setTemporada] = useState('2026');
  const [saving, setSaving] = useState(false);
  const [filterDeporte, setFilterDeporte] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const divisionesFiltradas = divisiones.filter((d) => !filterDeporte || d.deporteId === filterDeporte);

  const crear = async () => {
    if (!nombre || !deporteId) return;
    setSaving(true);
    await addDoc(collection(db, 'divisiones'), { nombre, deporteId, temporada, tipo: 'liga', activa: true, equipoIds: [] });
    setNombre(''); setSaving(false);
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar división?')) await deleteDoc(doc(db, 'divisiones', id)); };

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Divisiones / Ligas</h1><p className="text-sm text-[var(--text-secondary)]">{divisiones.length} divisiones registradas</p></div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Nueva División</h3></CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="space-y-1 flex-1"><Label className="text-xs text-[var(--text-muted)]">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Primera División" /></div>
          <div className="space-y-1 w-40"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1 w-24"><Label className="text-xs text-[var(--text-muted)]">Temporada</Label><Input value={temporada} onChange={(e) => setTemporada(e.target.value)} /></div>
          <Button onClick={crear} loading={saving} size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Crear</Button>
        </CardContent>
      </Card>

      {/* Sport filter */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setFilterDeporte('')} className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${!filterDeporte ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>Todos</button>
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setFilterDeporte(d.id)} className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${filterDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>{d.icono} {d.nombre}</button>
        ))}
      </div>

      {loading ? <Loader /> : !divisionesFiltradas.length ? <EmptyState title={filterDeporte ? 'Sin divisiones en este deporte' : 'Sin divisiones'} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]"><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Deporte</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Temporada</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Equipos</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th></tr></thead>
            <tbody>
              {divisionesFiltradas.map((d) => {
                const deporte = deportes.find((x) => x.id === d.deporteId);
                const count = equipos.filter((e) => d.equipoIds?.includes(e.id)).length;
                return (
                  <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 font-medium text-sm text-[var(--text)]">{d.nombre}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{deporte?.icono} {deporte?.nombre}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{d.temporada}</td>
                    <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{count}</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => eliminar(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
