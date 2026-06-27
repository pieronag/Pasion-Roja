'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JugadorForm } from '@/components/admin/jugador-form';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Jugador } from '@/types/jugador';

export default function AdminJugadoresPage() {
  const { equipos } = useEquipos();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Jugador | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEquipo, setFilterEquipo] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = jugadores.filter((j) => {
    const fullName = `${j.nombre} ${j.apellido}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase())) return false;
    if (filterEquipo && j.equipoId !== filterEquipo) return false;
    return true;
  });

  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este jugador?')) await deleteDoc(doc(db, 'jugadores', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[var(--text)]">Jugadores</h1><p className="text-sm text-[var(--text-secondary)]">{jugadores.length} jugadores registrados</p></div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Jugador</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nuevo Jugador</DialogTitle></DialogHeader><JugadorForm onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugador..." className="pl-9" />
        </div>
        <div className="w-48">
          <Select value={filterEquipo} onValueChange={setFilterEquipo}>
            <SelectTrigger><SelectValue placeholder="Todos los equipos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los equipos</SelectItem>
              {equipos.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterEquipo ? 'Sin resultados' : 'Sin jugadores'} /> : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-12">#</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Posición</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Equipo</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Goles</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Estado</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => a.numero - b.numero).map((j) => {
                const equipo = equipos.find((e) => e.id === j.equipoId);
                return (
                  <tr key={j.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 text-center font-bold text-[var(--accent)] font-mono">{j.numero}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] overflow-hidden">
                          {j.fotoBase64 ? <img src={j.fotoBase64} alt="" className="w-full h-full object-cover" /> : j.nombre[0]}{j.apellido[0]}
                        </div>
                        <span className="font-medium text-[var(--text)]">{j.nombre} {j.apellido}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{j.posicion || '—'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{equipo?.nombre || '—'}</td>
                    <td className="p-3 text-center font-bold text-[var(--accent)]">{j.estadisticasTemp?.goles || 0}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${j.activo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                        {j.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(j); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(j.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Editar Jugador</DialogTitle></DialogHeader>{editing && <JugadorForm jugador={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
