'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JugadorForm } from '@/components/admin/jugador-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Jugador } from '@/types/jugador';

export default function AdminJugadoresPage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Jugador | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = jugadores.filter((j) => `${j.nombre} ${j.apellido}`.toLowerCase().includes(search.toLowerCase()));
  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'jugadores', id)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black font-display text-[var(--text)]">Jugadores</h1>
        <Dialog>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo</Button></DialogTrigger>
          <DialogContent><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Nuevo Jugador</h2></DialogHeader><JugadorForm /></DialogContent>
        </Dialog>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugador..." className="w-full h-12 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text)] px-4 text-sm focus:outline-none focus:border-[var(--accent)]" />

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search ? 'Sin resultados' : 'Sin jugadores'} /> : (
        <div className="space-y-1">
          {filtered.map((j) => (
            <div key={j.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <span className="text-xs font-bold text-[var(--accent)] font-mono w-6 text-center">#{j.numero}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[var(--text)] truncate">{j.nombre} {j.apellido}</p><p className="text-xs text-[var(--text-secondary)]">{j.posicion}</p></div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(j)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => eliminar(j.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Editar Jugador</h2></DialogHeader>{editing && <JugadorForm jugador={editing} />}</DialogContent>
      </Dialog>
    </div>
  );
}
