'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SportIcon } from '@/components/shared/sport-icons';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { ActionsDropdown } from '@/components/admin/actions-dropdown';
import { Swords, Plus, Trash2, Search, Play, Square, Filter } from 'lucide-react';
import type { Partido, EstadoPartido } from '@/types/partido';

export default function AdminPartidosPage() {
  const { equipos } = useEquipos();
  const { deportes } = useDeportes();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDeporte, setFilterDeporte] = useState('');
  const [deporteId, setDeporteId] = useState('');
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [jornada, setJornada] = useState('1');
  const [estadio, setEstadio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'partidos'), orderBy('fecha', 'desc'), limit(200)), (snap) => {
      setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = partidos.filter((p) => {
    if (filterEstado && p.estado !== filterEstado) return false;
    if (filterDeporte && p.deporteId !== filterDeporte) return false;
    if (search) { const q = search.toLowerCase(); if (!p.equipoLocalNombre?.toLowerCase().includes(q) && !p.equipoVisitaNombre?.toLowerCase().includes(q)) return false; }
    return true;
  });

  const crearPartido = async () => {
    if (!deporteId || !localId || !visitaId || !fecha) return;
    setSaveLoading(true);
    const local = equipos.find((e) => e.id === localId);
    const visita = equipos.find((e) => e.id === visitaId);
    await addDoc(collection(db, 'partidos'), { deporteId, equipoLocalId: localId, equipoLocalNombre: local?.nombre || '', equipoVisitaId: visitaId, equipoVisitaNombre: visita?.nombre || '', fecha: new Date(fecha).getTime(), estado: 'programado', marcadorLocal: 0, marcadorVisita: 0, minuto: '0', jornada: parseInt(jornada) || 1, estadio: estadio || local?.estadio || '', eventos: [], actualizadoEn: Date.now() });
    setShowForm(false); setSaveLoading(false);
  };

  const cambiarEstado = async (id: string, estado: EstadoPartido) => { await updateDoc(doc(db, 'partidos', id), { estado, actualizadoEn: Date.now() }); };
  const eliminar = async (id: string) => { if (confirm('¿Eliminar partido?')) await deleteDoc(doc(db, 'partidos', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-[var(--text)]">Partidos</h2><p className="text-sm text-[var(--text-secondary)]">{partidos.length} partidos registrados</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1.5" /> Nuevo Partido</Button>
      </div>

      {showForm && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <h3 className="font-semibold text-sm text-[var(--text)]">Crear nuevo partido</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Jornada</Label><Input type="number" value={jornada} onChange={(e) => setJornada(e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Fecha</Label><Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Estadio</Label><Input value={estadio} onChange={(e) => setEstadio(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Local</Label><Select value={localId} onValueChange={setLocalId}><SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger><SelectContent>{equipos.filter((e) => !deporteId || e.deporteId === deporteId).map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Visita</Label><Select value={visitaId} onValueChange={setVisitaId}><SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger><SelectContent>{equipos.filter((e) => !deporteId || e.deporteId === deporteId).map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button><Button onClick={crearPartido} loading={saveLoading} size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Crear Partido</Button></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar equipo..." className="pl-9" /></div>
        <div className="w-40"><Select value={filterEstado} onValueChange={setFilterEstado}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem><SelectItem value="en_vivo">En Vivo</SelectItem><SelectItem value="programado">Programado</SelectItem><SelectItem value="finalizado">Finalizado</SelectItem></SelectContent></Select></div>
        <div className="w-40"><Select value={filterDeporte} onValueChange={setFilterDeporte}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
      </div>

      {loading ? <Loader /> : !filtered.length ? <EmptyState title="Sin partidos" /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-12">#</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Partido</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Deporte</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Estado</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Resultado</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3 text-sm font-mono text-[var(--text-muted)]">{p.jornada}</td>
                  <td className="p-3"><div className="flex items-center gap-2"><span className="text-sm font-medium text-[var(--text)]">{p.equipoLocalNombre}</span><span className="text-xs text-[var(--text-muted)]">vs</span><span className="text-sm font-medium text-[var(--text)]">{p.equipoVisitaNombre}</span></div></td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell"><SportIcon sport={deportes.find((d) => d.id === p.deporteId)?.icono || ''} size={16} /></td>
                  <td className="p-3"><StatusBadge status={p.estado === 'en_vivo' ? 'error' : p.estado === 'finalizado' ? 'success' : 'neutral'} label={p.estado === 'en_vivo' ? 'En Vivo' : p.estado === 'finalizado' ? 'Finalizado' : 'Programado'} /></td>
                  <td className="p-3 text-center"><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorLocal}</span><span className="text-[var(--text-muted)] mx-0.5">-</span><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorVisita}</span></td>
                  <td className="p-3 text-right"><ActionsDropdown actions={[
                    ...(p.estado === 'programado' ? [{ label: 'Iniciar partido', icon: <Play className="h-3.5 w-3.5" />, onClick: () => cambiarEstado(p.id, 'en_vivo') }] : []),
                    ...(p.estado === 'en_vivo' ? [{ label: 'Finalizar', icon: <Square className="h-3.5 w-3.5" />, onClick: () => cambiarEstado(p.id, 'finalizado') }] : []),
                    { label: 'Eliminar', icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => eliminar(p.id), danger: true },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
