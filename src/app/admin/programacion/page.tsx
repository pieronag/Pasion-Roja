'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/admin/metric-card';
import { CalendarDays, Plus, Trash2, Radio, Tv } from 'lucide-react';
import type { Programa } from '@/types/programa';

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function AdminProgramacionPage() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      titulo, host: host || 'Conductor', tipo, categoria, descripcion,
      activo: true, imagenPortada: '',
      horarios: [{ dia: parseInt(dia), horaInicio, horaFin }],
    });
    setTitulo(''); setHost(''); setDescripcion('');
    setShowForm(false);
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar programa?')) await deleteDoc(doc(db, 'programas', id)); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Programación</h2>
          <p className="text-sm text-[var(--text-secondary)]">{programas.length} programas registrados</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Programa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Programa</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: La Mañana Deportiva" /></div>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Host / Conductor</Label><Input value={host} onChange={(e) => setHost(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Tipo</Label>
                  <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="radio">Radio</SelectItem><SelectItem value="tv">TV</SelectItem><SelectItem value="ambos">Ambos</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Categoría</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="deportes">Deportes</SelectItem><SelectItem value="noticias">Noticias</SelectItem><SelectItem value="entrevistas">Entrevistas</SelectItem><SelectItem value="musica">Música</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Día</Label>
                  <Select value={dia} onValueChange={setDia}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{diasSemana.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Inicio</Label><Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Fin</Label><Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
              <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button onClick={crear} size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Crear Programa</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Programas" value={programas.length} icon={CalendarDays} gradient="from-green-500 to-green-600" />
        <MetricCard label="Radio" value={programas.filter(p=>p.tipo==='radio'||p.tipo==='ambos').length} icon={Radio} gradient="from-blue-500 to-blue-600" />
        <MetricCard label="TV" value={programas.filter(p=>p.tipo==='tv'||p.tipo==='ambos').length} icon={Tv} gradient="from-purple-500 to-purple-600" />
      </div>

      {/* List */}
      {loading ? <Loader /> : !programas.length ? <EmptyState title="Sin programas" /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Programa</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Tipo</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Host</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Horario</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.map((p) => {
                const horario = p.horarios?.[0];
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 font-medium text-sm text-[var(--text)]">{p.titulo}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">
                      {p.tipo === 'ambos' ? 'Radio + TV' : p.tipo === 'radio' ? 'Radio' : 'TV'}
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{p.host}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                      {horario ? `${diasSemana[horario.dia]} ${horario.horaInicio}-${horario.horaFin}` : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => eliminar(p.id)} title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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
