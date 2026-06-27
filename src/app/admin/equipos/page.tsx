'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EquipoForm } from '@/components/admin/equipo-form';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, Plus, Pencil, Trash2, Search, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Equipo } from '@/types/equipo';

export default function AdminEquiposPage() {
  const { deportes } = useDeportes();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDeporte, setFilterDeporte] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      setEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = equipos.filter((e) => {
    if (search && !e.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDeporte && e.deporteId !== filterDeporte) return false;
    return true;
  });

  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este equipo?')) await deleteDoc(doc(db, 'equipos', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[var(--text)]">Equipos</h1><p className="text-sm text-[var(--text-secondary)]">{equipos.length} equipos registrados</p></div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Equipo</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Nuevo Equipo</DialogTitle></DialogHeader><EquipoForm onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar equipo..." className="pl-9" />
        </div>
        <div className="w-48">
          <Select value={filterDeporte} onValueChange={setFilterDeporte}>
            <SelectTrigger><SelectValue placeholder="Todos los deportes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los deportes</SelectItem>
              {deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterDeporte ? 'Sin resultados' : 'Sin equipos'} /> : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Equipo</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Deporte</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Ciudad / Estadio</th>
                <th className="text-right p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const deporte = deportes.find((d) => d.id === e.deporteId);
                return (
                  <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: e.colorPrimario || '#E11D48' }}>
                          {e.logoBase64 ? <img src={e.logoBase64} alt="" className="w-8 h-8 object-contain" /> : e.nombreCorto?.slice(0, 3) || e.nombre.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text)]">{e.nombre}</p>
                          <p className="text-xs text-[var(--text-muted)]">{e.nombreCorto} · {e.entrenador ? `DT: ${e.entrenador}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{deporte?.icono} {deporte?.nombre || '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                        <MapPin className="h-3.5 w-3.5" />
                        {e.ciudad || e.estadio || '—'}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/equipos/${e.id}/jugadores`}>
                          <Button variant="ghost" size="sm" className="h-8"><Users className="h-3.5 w-3.5 mr-1" /> Plantilla</Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(e); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Editar Equipo</DialogTitle></DialogHeader>{editing && <EquipoForm equipo={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
