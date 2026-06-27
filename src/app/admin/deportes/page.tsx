'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DeporteForm } from '@/components/admin/deporte-form';
import { SportIcon } from '@/components/shared/sport-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Trophy, Plus, Pencil, Trash2, Search, Shield, Users, Swords, CheckCircle2 } from 'lucide-react';
import type { Deporte } from '@/types/deporte';

export default function AdminDeportesPage() {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [counts, setCounts] = useState<Record<string, { equipos: number; jugadores: number; partidos: number }>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Deporte | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'deportes'), orderBy('orden', 'asc')), async (snap) => {
      const deportesData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deporte));
      setDeportes(deportesData);

      // Count related data per sport
      const countPromises = deportesData.map(async (d) => {
        const [equiposSnap, jugadoresSnap, partidosSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'equipos'), where('deporteId', '==', d.id))),
          getCountFromServer(query(collection(db, 'jugadores'), where('deporteId', '==', d.id))),
          getCountFromServer(query(collection(db, 'partidos'), where('deporteId', '==', d.id))),
        ]);
        return [d.id, {
          equipos: equiposSnap.data().count,
          jugadores: jugadoresSnap.data().count,
          partidos: partidosSnap.data().count,
        }];
      });
      const countResults = await Promise.all(countPromises);
      setCounts(Object.fromEntries(countResults));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = deportes.filter((d) => d.nombre.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este deporte?')) await deleteDoc(doc(db, 'deportes', id)); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Deportes</h2>
          <p className="text-sm text-[var(--text-secondary)]">{deportes.length} deportes registrados</p>
        </div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Deporte</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Deporte</DialogTitle></DialogHeader>
            <DialogBody><DeporteForm onClose={() => setShowCreate(false)} /></DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar deporte..." className="pl-9" />
      </div>

      {/* Grid */}
      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search ? 'Sin resultados' : 'Sin deportes'} /> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((d) => {
            const c = counts[d.id] || { equipos: 0, jugadores: 0, partidos: 0 };
            return (
              <Card key={d.id} className="group hover:shadow-lg transition-all overflow-hidden">
                {/* Banner or gradient header */}
                {d.bannerBase64 ? (
                  <div className="h-28 relative overflow-hidden bg-[var(--bg-secondary)]">
                    <img src={d.bannerBase64} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <SportIcon sport={d.icono} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white uppercase drop-shadow-sm">{d.nombre}</h3>
                        <span className="text-[10px] text-white/70 flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> {d.sistemaPuntos.victoria}-{d.sistemaPuntos.empate}-{d.sistemaPuntos.derrota}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white rounded-[var(--radius-xs)]" onClick={() => { setEditing(d); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/30 hover:bg-black/50 text-red-300 hover:text-red-400 rounded-[var(--radius-xs)]" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-1 bg-gradient-to-r from-[var(--accent)] to-orange-500" />
                )}

                <CardContent className="p-4">
                  {!d.bannerBase64 && (
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--accent)]/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <SportIcon sport={d.icono} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-[var(--text)] uppercase">{d.nombre}</h3>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(d); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">Pts: {d.sistemaPuntos.victoria}-{d.sistemaPuntos.empate}-{d.sistemaPuntos.derrota}</p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-[var(--radius-xs)] bg-[var(--bg-secondary)]">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text)]">{c.equipos}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">Equipos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-[var(--radius-xs)] bg-[var(--bg-secondary)]">
                      <Users className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text)]">{c.jugadores}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">Jugadores</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-[var(--radius-xs)] bg-[var(--bg-secondary)]">
                      <Swords className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text)]">{c.partidos}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">Partidos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Deporte</DialogTitle></DialogHeader>
          <DialogBody>{editing && <DeporteForm deporte={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
