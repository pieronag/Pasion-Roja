'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, Plus, Save, Trash2 } from 'lucide-react';
import type { Division } from '@/types/division';

export default function AdminDivisionesPage() {
  const { deportes } = useDeportes();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [deporteId, setDeporteId] = useState('');
  const [temporada, setTemporada] = useState('2026');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const crear = async () => {
    if (!nombre || !deporteId) return;
    await addDoc(collection(db, 'divisiones'), { nombre, deporteId, temporada, tipo: 'liga', activa: true, equipoIds: [] });
    setNombre('');
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'divisiones', id)); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Divisiones / Ligas</h1>

      <Card>
        <CardHeader><h2 className="font-bold text-[var(--text)]">Nueva División</h2></CardHeader>
        <CardContent className="flex gap-3 items-end">
          <div className="space-y-2 flex-1"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Primera División" /></div>
          <div className="space-y-2"><Label>Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger className="w-40"><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={crear}><Plus className="h-4 w-4 mr-1" /> Crear</Button>
        </CardContent>
      </Card>

      {loading ? <Loader /> : !divisiones.length ? <EmptyState title="Sin divisiones" /> : (
        <div className="space-y-2">
          {divisiones.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              <div className="flex-1"><p className="font-medium text-[var(--text)]">{d.nombre}</p><p className="text-xs text-[var(--text-secondary)]">{deportes.find((x) => x.id === d.deporteId)?.nombre || d.deporteId} · {d.temporada}</p></div>
              <Button variant="ghost" size="icon" onClick={() => eliminar(d.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
