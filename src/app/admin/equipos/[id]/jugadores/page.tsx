'use client';

import { useState, useEffect, use } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JugadorForm } from '@/components/admin/jugador-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Jugador } from '@/types/jugador';

export default function AdminEquipoJugadoresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Jugador | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'jugadores'), where('equipoId', '==', id));
    const unsub = onSnapshot(q, (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const eliminar = async (jugadorId: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'jugadores', jugadorId)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/equipos" className="text-[var(--text-secondary)] hover:text-[var(--text)]"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-black font-display text-[var(--text)]">Plantilla</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Añadir Jugador</Button></DialogTrigger>
          <DialogContent><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Nuevo Jugador</h2></DialogHeader><JugadorForm /></DialogContent>
        </Dialog>
      </div>

      {loading ? <Loader /> : !jugadores.length ? <EmptyState title="Sin jugadores" /> : (
        <div className="grid grid-cols-1 gap-2">
          {jugadores.sort((a, b) => a.numero - b.numero).map((j) => (
            <div key={j.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <span className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-sm font-bold text-[var(--accent)] font-mono">{j.numero}</span>
              <div className="flex-1"><p className="font-medium text-[var(--text)]">{j.nombre} {j.apellido}</p><p className="text-xs text-[var(--text-secondary)]">{j.posicion}</p></div>
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
