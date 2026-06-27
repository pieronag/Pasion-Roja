'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SponsorForm } from '@/components/admin/sponsor-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { HeartHandshake, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Sponsor } from '@/types/sponsor';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Sponsor | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'sponsors'), orderBy('orden', 'asc')), (snap) => {
      setSponsors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const eliminar = async (id: string) => { if (confirm('¿Eliminar sponsor?')) await deleteDoc(doc(db, 'sponsors', id)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black font-display text-[var(--text)]">Sponsors</h1>
        <Dialog>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Sponsor</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Nuevo Sponsor</h2></DialogHeader><SponsorForm /></DialogContent>
        </Dialog>
      </div>

      {loading ? <Loader /> : !sponsors.length ? <EmptyState title="Sin sponsors" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sponsors.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  {s.logoBase64 ? <img src={s.logoBase64} alt={s.nombre} className="w-12 h-12 object-contain" /> : <HeartHandshake className="h-6 w-6 text-[var(--text-muted)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text)] truncate">{s.nombre}</p>
                  <p className="text-xs text-[var(--text-secondary)] capitalize">{s.tipo}</p>
                  {s.descripcion && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{s.descripcion}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => eliminar(s.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Editar Sponsor</h2></DialogHeader>{editing && <SponsorForm sponsor={editing} />}</DialogContent>
      </Dialog>
    </div>
  );
}
