'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JugadorForm } from '@/components/admin/jugador-form';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { MetricCard } from '@/components/admin/metric-card';
import { Users, Plus, Pencil, Trash2, Search, ExternalLink, Trophy, Shield, Star, Ruler } from 'lucide-react';
import type { Jugador } from '@/types/jugador';

export default function AdminJugadoresPage() {
  const { deportes } = useDeportes();
  const { equiposMap } = useEquiposMap();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Jugador | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  // Auto-select Malleco's deporte
  const principalEquipo = Object.values(equiposMap).find(e => e.esPrincipal);
  const principalDeporteId = principalEquipo?.deporteId || '';

  const [filterDeporte, setFilterDeporte] = useState(principalDeporteId);
  const [filterEquipo, setFilterEquipo] = useState(principalEquipo?.id || '');

  const equipos = Object.values(equiposMap).filter(e => !filterDeporte || e.deporteId === filterDeporte);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = jugadores.filter((j) => {
    const name = `${j.nombre} ${j.apellido}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (filterDeporte && j.deporteId !== filterDeporte) return false;
    if (filterEquipo && j.equipoId !== filterEquipo) return false;
    return true;
  });

  const handleDelete = async (id: string) => { if (confirm('¿Eliminar este jugador?')) await deleteDoc(doc(db, 'jugadores', id)); };

  const calcularEdad = (fechaNac: number) => {
    if (!fechaNac) return '—';
    const edad = Math.floor((Date.now() - fechaNac) / 31557600000);
    return `${edad} años`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-[var(--text)]">Jugadores</h2><p className="text-sm text-[var(--text-secondary)]">{jugadores.length} jugadores registrados</p></div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Jugador</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Jugador</DialogTitle></DialogHeader>
            <DialogBody><JugadorForm onClose={() => setShowCreate(false)} /></DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Jugadores" value={jugadores.length} icon={Users} gradient="from-purple-500 to-purple-600" />
        <MetricCard label="Activos" value={jugadores.filter(j=>j.activo).length} icon={Users} gradient="from-emerald-500 to-emerald-600" />
        <MetricCard label="Equipos" value={equipos.length} icon={Shield} gradient="from-blue-500 to-blue-600" />
        <MetricCard label="Deportes" value={deportes.length} icon={Trophy} gradient="from-orange-500 to-orange-600" />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugador..." className="pl-9" /></div>
        <div className="w-44"><Select value={filterDeporte} onValueChange={(v) => { setFilterDeporte(v); setFilterEquipo(''); }}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
        <div className="w-44"><Select value={filterEquipo} onValueChange={setFilterEquipo} disabled={!filterDeporte}><SelectTrigger><SelectValue placeholder="Equipo" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{[...equipos].sort((a,b) => a.nombre.localeCompare(b.nombre,'es')).map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title={search || filterDeporte || filterEquipo ? 'Sin resultados' : 'Sin jugadores'} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-10">#</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Posición</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Nac./Edad</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Nac.</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center hidden lg:table-cell">Altura</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center hidden lg:table-cell">Pie</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden lg:table-cell">Equipo</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Estado</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr></thead>
              <tbody>
                {filtered.sort((a, b) => (a.numero || 0) - (b.numero || 0)).map((j) => {
                  const equipo = equiposMap[j.equipoId];
                  const esMalleco = equipo?.esPrincipal;
                  return (
                    <tr key={j.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors ${esMalleco ? 'bg-yellow-500/[0.04]' : ''}`}>
                      <td className="p-3 text-center font-bold text-[var(--accent)] font-mono text-sm">{j.numero}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] overflow-hidden flex-shrink-0">
                            {j.fotoBase64 ? <img src={j.fotoBase64} alt="" className="w-full h-full object-cover" /> : `${j.nombre[0]}${j.apellido[0]}`}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-[var(--text)]">{j.nombre} {j.apellido}</span>
                              {esMalleco && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)]">{j.posicion || '—'}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                        {j.fechaNacimiento ? `${new Date(j.fechaNacimiento).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })} (${calcularEdad(j.fechaNacimiento)})` : '—'}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{j.nacionalidad || '—'}</td>
                      <td className="p-3 text-center text-sm text-[var(--text-secondary)] hidden lg:table-cell">{j.altura ? `${j.altura}cm` : '—'}</td>
                      <td className="p-3 text-center text-sm text-[var(--text-secondary)] hidden lg:table-cell">{j.pie || '—'}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{equipo?.nombre || '—'}</td>
                      <td className="p-3 text-center"><StatusBadge status={j.activo ? 'success' : 'error'} label={j.activo ? 'Activo' : 'Inactivo'} /></td>
                      <td className="p-3 text-right"><div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(j); setShowCreate(true); }} title="Editar"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/jugadores/${j.id}`, '_blank')} title="Ver perfil"><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(j.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Jugador</DialogTitle></DialogHeader>
          <DialogBody>{editing && <JugadorForm jugador={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
