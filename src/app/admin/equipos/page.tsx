'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';
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
import type { Division } from '@/types/division';

export default function AdminEquiposPage() {
  const { deportes } = useDeportes();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDeporte, setFilterDeporte] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      setEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!filterDeporte) { setDivisiones([]); return; }
    const unsub = onSnapshot(query(collection(db, 'divisiones'), where('deporteId', '==', filterDeporte)), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, [filterDeporte]);

  const filtered = equipos.filter((e) => {
    if (search && !e.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDeporte && e.deporteId !== filterDeporte) return false;
    if (filterDivision && e.divisionId !== filterDivision) return false;
    return true;
  });

  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este equipo?')) await deleteDoc(doc(db, 'equipos', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[var(--text)]">Equipos</h1><p className="text-sm text-[var(--text-secondary)]">{equipos.length} equipos registrados</p></div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Equipo</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nuevo Equipo</DialogTitle></DialogHeader><EquipoForm onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar equipo..." className="pl-9" /></div>
        <div className="w-44"><Select value={filterDeporte} onValueChange={(v) => { setFilterDeporte(v); setFilterDivision(''); }}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
        <div className="w-44"><Select value={filterDivision} onValueChange={setFilterDivision} disabled={!filterDeporte}><SelectTrigger><SelectValue placeholder="División" /></SelectTrigger><SelectContent><SelectItem value="">Todas</SelectItem>{divisiones.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent></Select></div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterDeporte || filterDivision ? 'Sin resultados' : 'Sin equipos'} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Equipo</th>
              <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Deporte</th>
              <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">División</th>
              <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Ciudad</th>
              <th className="text-right p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((e) => {
                const deporte = deportes.find((d) => d.id === e.deporteId);
                const division = divisiones.find((d) => d.id === e.divisionId);
                return (
                  <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: e.colorPrimario || '#E11D48' }}>{e.logoBase64 ? <img src={e.logoBase64} alt="" className="w-7 h-7 object-contain" /> : e.nombreCorto?.slice(0, 3) || e.nombre.slice(0, 3)}</div><div><p className="font-medium text-sm text-[var(--text)]">{e.nombre}</p><p className="text-[11px] text-[var(--text-muted)]">{e.nombreCorto}{e.entrenador ? ` · ${e.entrenador}` : ''}</p></div></div></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{deporte?.icono} {deporte?.nombre || '—'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{division?.nombre || '—'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]"><div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.ciudad || e.estadio || '—'}</div></td>
                    <td className="p-3 text-right"><div className="flex justify-end gap-1"><Link href={`/admin/equipos/${e.id}/jugadores`}><Button variant="ghost" size="sm" className="h-7 text-xs"><Users className="h-3 w-3 mr-1" /> Plantilla</Button></Link><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(e); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Editar Equipo</DialogTitle></DialogHeader>{editing && <EquipoForm equipo={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
