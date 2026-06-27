'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import type { Programa } from '@/types/programa';

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
    await addDoc(collection(db, 'programas'), { titulo, host: host || 'Conductor', tipo, categoria, descripcion, activo: true, imagenPortada: '', horarios: [{ dia: parseInt(dia), horaInicio, horaFin }] });
    setTitulo('');
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'programas', id)); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Programación</h1><p className="text-sm text-[var(--text-secondary)]">Gestiona la programación de radio y TV.</p></div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600" />
        <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Nuevo Programa</h3></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: La Mañana Deportiva" /></div>
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Host</Label><Input value={host} onChange={(e) => setHost(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Tipo</Label><Select value={tipo} onValueChange={(v: any) => setTipo(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="radio">Radio</SelectItem><SelectItem value="tv">TV</SelectItem><SelectItem value="ambos">Ambos</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Categoría</Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deportes">Deportes</SelectItem><SelectItem value="noticias">Noticias</SelectItem><SelectItem value="entrevistas">Entrevistas</SelectItem><SelectItem value="musica">Música</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Día</Label><Select value={dia} onValueChange={setDia}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((d,i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Inicio</Label><Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Fin</Label><Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
          <Button onClick={crear} size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" /> Agregar Programa</Button>
        </CardContent>
      </Card>

      {loading ? <Loader /> : !programas.length ? <EmptyState title="Sin programas" /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]"><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Programa</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Tipo</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Host</th><th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th></tr></thead>
            <tbody>
              {programas.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3 font-medium text-[var(--text)]">{p.titulo}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)]">{p.tipo === 'ambos' ? 'Radio + TV' : p.tipo === 'radio' ? '📻 Radio' : '📺 TV'}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)]">{p.host}</td>
                  <td className="p-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => eliminar(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
