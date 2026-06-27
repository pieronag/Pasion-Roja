'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { CalendarDays, Plus, Save, Trash2 } from 'lucide-react';
import type { Programa, DiasHorario } from '@/types/programa';

export default function AdminProgramacionPage() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [host, setHost] = useState('');
  const [tipo, setTipo] = useState<'radio' | 'tv' | 'ambos'>('radio');
  const [categoria, setCategoria] = useState('deportes');
  const [descripcion, setDescripcion] = useState('');
  const [dia, setDia] = useState('0');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('09:00');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'programas')), (snap) => {
      setProgramas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programa)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const crear = async () => {
    if (!titulo) return;
    await addDoc(collection(db, 'programas'), {
      titulo, host: host || 'Conductor', tipo, categoria,
      descripcion, activo: true, imagenPortada: '',
      horarios: [{ dia: parseInt(dia), horaInicio, horaFin }],
    });
    setTitulo('');
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'programas', id)); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Programación</h1>

      <Card>
        <CardHeader><h2 className="font-bold text-[var(--text)]">Nuevo Programa</h2></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: La Mañana Deportiva" /></div>
            <div className="space-y-2"><Label>Host / Conductor</Label><Input value={host} onChange={(e) => setHost(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Tipo</Label><Select value={tipo} onValueChange={(v: any) => setTipo(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="radio">Radio</SelectItem><SelectItem value="tv">TV</SelectItem><SelectItem value="ambos">Ambos</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Categoría</Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deportes">Deportes</SelectItem><SelectItem value="noticias">Noticias</SelectItem><SelectItem value="entrevistas">Entrevistas</SelectItem><SelectItem value="musica">Música</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Día</Label><Select value={dia} onValueChange={setDia}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Domingo</SelectItem><SelectItem value="1">Lunes</SelectItem><SelectItem value="2">Martes</SelectItem><SelectItem value="3">Miércoles</SelectItem><SelectItem value="4">Jueves</SelectItem><SelectItem value="5">Viernes</SelectItem><SelectItem value="6">Sábado</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Inicio</Label><Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fin</Label><Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
          <Button onClick={crear}><Plus className="h-4 w-4 mr-1" /> Agregar Programa</Button>
        </CardContent>
      </Card>

      {loading ? <Loader /> : !programas.length ? <EmptyState title="Sin programas" /> : (
        <div className="space-y-2">
          {programas.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <span className="text-sm font-bold text-[var(--accent)]">{p.titulo}</span>
              <span className="text-xs text-[var(--text-secondary)]">{p.host} · {p.horarios.length} horarios</span>
              <Button variant="ghost" size="icon" onClick={() => eliminar(p.id)} className="ml-auto"><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
