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
import { Shield, Plus, Trash2, Trophy, Users } from 'lucide-react';
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

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const crear = async () => {
    if (!nombre || !deporteId) return;
    setSaving(true);
    await addDoc(collection(db, 'divisiones'), { nombre, deporteId, temporada, tipo: 'liga', activa: true, equipoIds: [] });
    setNombre(''); setSaving(false);
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar división?')) await deleteDoc(doc(db, 'divisiones', id)); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Divisiones / Ligas</h1><p className="text-sm text-[var(--text-secondary)]">{divisiones.length} divisiones registradas</p></div>

      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
        <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Nueva División</h3></CardHeader>
        <CardContent className="flex gap-3 items-end">
          <div className="space-y-1.5 flex-1"><Label className="text-xs text-[var(--text-muted)]">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Primera División" /></div>
          <div className="space-y-1.5 w-44"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 w-28"><Label className="text-xs text-[var(--text-muted)]">Temporada</Label><Input value={temporada} onChange={(e) => setTemporada(e.target.value)} /></div>
          <Button onClick={crear} loading={saving}><Plus className="h-4 w-4 mr-1.5" /> Crear</Button>
        </CardContent>
      </Card>

      {loading ? <Loader /> : !divisiones.length ? <EmptyState title="Sin divisiones" /> : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Deporte</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Temporada</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Equipos</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {divisiones.map((d) => {
                const deporte = deportes.find((x) => x.id === d.deporteId);
                const equiposDivision = equipos.filter((e) => d.equipoIds?.includes(e.id));
                return (
                  <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 font-medium text-[var(--text)]">{d.nombre}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{deporte?.icono} {deporte?.nombre}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{d.temporada}</td>
                    <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{equiposDivision.length}</td>
                    <td className="p-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => eliminar(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
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
