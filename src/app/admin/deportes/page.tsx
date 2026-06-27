'use client';

import { useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';
import { DeporteForm } from '@/components/admin/deporte-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Loader } from '@/components/shared/loader';
import { Trophy, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Deporte } from '@/types/deporte';

export default function AdminDeportesPage() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Deporte | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'deportes'), orderBy('orden', 'asc')), (snap) => {
      setDeportes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deporte)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este deporte?')) await deleteDoc(doc(db, 'deportes', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black font-display text-[var(--text)]">Deportes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
          </DialogTrigger>
          <DialogContent><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Nuevo Deporte</h2></DialogHeader><DeporteForm /></DialogContent>
        </Dialog>
      </div>

      {loading ? <Loader /> : !deportes.length ? <EmptyState title="Sin deportes" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deportes.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-3xl">{d.icono}</span>
                <div className="flex-1">
                  <p className="font-bold text-[var(--text)]">{d.nombre}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Pts: {d.sistemaPuntos.victoria}-{d.sistemaPuntos.empate}-{d.sistemaPuntos.derrota}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Editar Deporte</h2></DialogHeader>{editing && <DeporteForm deporte={editing} />}</DialogContent>
      </Dialog>
    </div>
  );
}
