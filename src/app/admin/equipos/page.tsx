'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EquipoForm } from '@/components/admin/equipo-form';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/admin/metric-card';
import { Shield, Plus, Pencil, Trash2, Search, Users, MapPin, Eye, ExternalLink, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import type { Equipo } from '@/types/equipo';
import type { Division } from '@/types/division';

export default function AdminEquiposPage() {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const principalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [allDivisiones, setAllDivisiones] = useState<Division[]>([]);
  const [filterDivisiones, setFilterDivisiones] = useState<Division[]>([]);
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
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setAllDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!filterDeporte) { setFilterDivisiones([]); return; }
    setFilterDivisiones(allDivisiones.filter((d) => d.deporteId === filterDeporte));
  }, [filterDeporte, allDivisiones]);

  const filtered = equipos.filter((e) => {
    if (search && !e.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDeporte && e.deporteId !== filterDeporte) return false;
    if (filterDivision && e.divisionId !== filterDivision) return false;
    return true;
  }).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este equipo?')) await deleteDoc(doc(db, 'equipos', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-[var(--text)]">Equipos</h2><p className="text-sm text-[var(--text-secondary)]">{equipos.length} equipos registrados</p></div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Equipo</Button></DialogTrigger>
          <DialogContent className="max-w-[1200px] mx-4">
            <DialogHeader><DialogTitle>Nuevo Equipo</DialogTitle></DialogHeader>
            <DialogBody><EquipoForm onClose={() => setShowCreate(false)} defaultDeporteId={filterDeporte} defaultDivisionId={filterDivision} /></DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Equipos" value={equipos.length} icon={Shield} gradient="from-blue-500 to-blue-600" />
        <MetricCard label="Deportes" value={deportes.length} icon={Trophy} gradient="from-orange-500 to-orange-600" />
        <MetricCard label="Divisiones" value={allDivisiones.length} icon={Shield} gradient="from-green-500 to-green-600" />
        <MetricCard label="Jugadores" value={0} icon={Users} gradient="from-purple-500 to-purple-600" />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar equipo..." className="pl-9" /></div>
        <div className="w-44"><Select value={filterDeporte} onValueChange={(v) => { setFilterDeporte(v); setFilterDivision(''); }}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
        <div className="w-48"><Select value={filterDivision} onValueChange={setFilterDivision} disabled={!filterDeporte}><SelectTrigger><SelectValue placeholder="División" /></SelectTrigger><SelectContent><SelectItem value="">Todas</SelectItem>{filterDivisiones.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent></Select></div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterDeporte || filterDivision ? 'Sin resultados' : 'Sin equipos'} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Equipo</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase hidden md:table-cell">Deporte</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase hidden lg:table-cell">División</th>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-muted)] uppercase hidden md:table-cell">Ciudad</th>
                <th className="text-right p-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const deporte = deportes.find((d) => d.id === e.deporteId);
                const division = allDivisiones.find((d) => d.id === e.divisionId);
                return (
                  <tr key={e.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors ${e.id === principalId ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: e.colorPrimario || '#E11D48' }}>
                          {e.logoBase64 ? <img src={e.logoBase64} alt="" className="w-7 h-7 object-contain" /> : e.nombreCorto?.slice(0, 3) || e.nombre.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[var(--text)] flex items-center gap-1.5">
                            {e.nombre}
                            {e.id === principalId && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">{e.nombreCorto}{e.entrenador ? ` · ${e.entrenador}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell"><span className="flex items-center gap-1.5"><SportIcon sport={deporte?.icono || ''} size={14} /><span>{deporte?.nombre || '—'}</span></span></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{division?.nombre || <span className="text-[var(--text-muted)]">—</span>}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell"><div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.ciudad || e.estadio || '—'}{e.region ? `, ${e.region}` : ''}</div></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/equipos/${e.id}/jugadores`}><Button variant="ghost" size="sm" className="h-7 text-xs"><Users className="h-3 w-3 mr-1" /> Plantilla</Button></Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(e); setShowCreate(true); }} title="Editar"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/equipos/${e.id}`, '_blank')} title="Ver en web"><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(e.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-[1200px] mx-4">
          <DialogHeader><DialogTitle>Editar Equipo</DialogTitle></DialogHeader>
          <DialogBody>{editing && <EquipoForm equipo={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
