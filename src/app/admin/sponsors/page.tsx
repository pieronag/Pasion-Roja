'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SponsorForm } from '@/components/admin/sponsor-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { HeartHandshake, Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import type { Sponsor, TipoSponsor } from '@/types/sponsor';

const tipoColors: Record<string, string> = { principal: 'from-yellow-400 to-yellow-600', oficial: 'from-blue-400 to-blue-600', auspiciador: 'from-green-400 to-green-600', media: 'from-gray-400 to-gray-600' };

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'sponsors'), orderBy('orden', 'asc')), (snap) => {
      setSponsors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = sponsors.filter((s) => {
    if (search && !s.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTipo && s.tipo !== filterTipo) return false;
    return true;
  });

  const eliminar = async (id: string) => { if (confirm('¿Eliminar sponsor?')) await deleteDoc(doc(db, 'sponsors', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[var(--text)]">Sponsors</h1><p className="text-sm text-[var(--text-secondary)]">{sponsors.length} sponsors registrados</p></div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Sponsor</Button></DialogTrigger>
          <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nuevo Sponsor</DialogTitle></DialogHeader><SponsorForm onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar sponsor..." className="pl-9" /></div>
        <div className="w-40"><Select value={filterTipo} onValueChange={setFilterTipo}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem><SelectItem value="principal">Principal</SelectItem><SelectItem value="oficial">Oficial</SelectItem><SelectItem value="auspiciador">Auspiciador</SelectItem><SelectItem value="media">Media</SelectItem></SelectContent></Select></div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterTipo ? 'Sin resultados' : 'Sin sponsors'} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <Card key={s.id} className="group hover:shadow-md transition-all overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${tipoColors[s.tipo] || 'from-gray-400 to-gray-600'}`} />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] flex items-center justify-center p-1.5 flex-shrink-0">
                    {s.logoBase64 ? <img src={s.logoBase64} alt="" className="w-full h-full object-contain" /> : <HeartHandshake className="h-4 w-4 text-[var(--text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--text)] truncate">{s.nombre}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.tipo === 'principal' ? 'bg-yellow-500/10 text-yellow-600' : s.tipo === 'oficial' ? 'bg-blue-500/10 text-blue-600' : s.tipo === 'auspiciador' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}`}>{s.tipo}</span>
                    {s.url && <a href={s.url} target="_blank" className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 hover:text-[var(--accent)]"><ExternalLink className="h-3 w-3" /> Web</a>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(s); setShowCreate(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => eliminar(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Editar Sponsor</DialogTitle></DialogHeader>{editing && <SponsorForm sponsor={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
