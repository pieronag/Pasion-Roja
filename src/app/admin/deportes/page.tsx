'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DeporteForm } from '@/components/admin/deporte-form';
import { SportIcon } from '@/components/shared/sport-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Trophy, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react';
import type { Deporte } from '@/types/deporte';

export default function AdminDeportesPage() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Deporte | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'deportes'), orderBy('orden', 'asc')), (snap) => {
      setDeportes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deporte)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = deportes.filter((d) => d.nombre.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este deporte?')) await deleteDoc(doc(db, 'deportes', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[var(--text)]">Deportes</h1><p className="text-sm text-[var(--text-secondary)]">{deportes.length} deportes registrados</p></div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Deporte</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Nuevo Deporte</DialogTitle></DialogHeader><DeporteForm onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar deporte..." className="pl-9" />
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search ? 'Sin resultados' : 'Sin deportes'} /> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <Card key={d.id} className="group hover:shadow-md transition-all overflow-hidden">
              <div className={`h-1 bg-gradient-to-r from-[var(--accent)] to-orange-500`} />
              <CardContent className="p-0">
                <div className="flex">
                  {d.bannerBase64 && (
                    <div className="w-28 flex-shrink-0 bg-[var(--bg-secondary)]">
                      <img src={d.bannerBase64} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <SportIcon sport={d.icono} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[var(--text)] uppercase">{d.nombre}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                        <span>Pts: {d.sistemaPuntos.victoria}-{d.sistemaPuntos.empate}-{d.sistemaPuntos.derrota}</span>
                        <span className={d.activo ? 'text-green-500' : 'text-red-400'}>{d.activo ? 'Activo' : 'Inactivo'}</span>
                        {d.bannerBase64 && <span className="text-[var(--text-muted)]">Con banner</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(d); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Editar Deporte</DialogTitle></DialogHeader>{editing && <DeporteForm deporte={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
