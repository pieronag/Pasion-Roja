'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
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
import { MetricCard } from '@/components/admin/metric-card';
import { Swords, Plus, Trash2, Search, Play, CheckCircle, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { Partido, EstadoPartido } from '@/types/partido';
import type { Division } from '@/types/division';

export default function AdminPartidosPage() {
  const { equipos } = useEquipos();
  const { deportes } = useDeportes();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDeporte, setFilterDeporte] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [jornadaActual, setJornadaActual] = useState(1);
  const [deporteId, setDeporteId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [jornadaNuevo, setJornadaNuevo] = useState('1');
  const [estadio, setEstadio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Load partidos ordered by fecha ascending
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'partidos'), orderBy('fecha', 'asc')), (snap) => {
      setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load divisions for filter
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, []);

  // Auto-select deporte when only one exists
  useEffect(() => {
    if (deportes.length === 1 && !filterDeporte) {
      setFilterDeporte(deportes[0].id);
    }
  }, [deportes, filterDeporte]);

  const divisionesFiltradas = divisiones.filter(d => !filterDeporte || d.deporteId === filterDeporte);

  // Auto-select division when only one exists for the sport
  useEffect(() => {
    if (divisionesFiltradas.length === 1 && !filterDivision) {
      setFilterDivision(divisionesFiltradas[0].id);
    }
  }, [divisionesFiltradas, filterDivision]);

  const divSeleccionada = divisiones.find(d => d.id === (filterDivision || divisionId));
  const totalJornadas = divSeleccionada?.totalJornadas || 38;

  const filtered = partidos.filter((p) => {
    if (filterEstado && p.estado !== filterEstado) return false;
    if (filterDeporte && p.deporteId !== filterDeporte) return false;
    if (filterDivision && p.divisionId !== filterDivision) return false;
    if (p.jornada !== jornadaActual) return false;
    if (search) { const q = search.toLowerCase(); if (!p.equipoLocalNombre?.toLowerCase().includes(q) && !p.equipoVisitaNombre?.toLowerCase().includes(q)) return false; }
    return true;
  }).sort((a, b) => a.fecha - b.fecha);

  // Teams already playing in this jornada
  const equiposEnJornada = partidos
    .filter(p => p.jornada === parseInt(jornadaNuevo) && p.deporteId === deporteId)
    .flatMap(p => [p.equipoLocalId, p.equipoVisitaId]);

  const equiposDisponibles = [...equipos]
    .filter(e => !deporteId || e.deporteId === deporteId)
    .filter(e => !equiposEnJornada.includes(e.id))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const crearPartido = async () => {
    if (!deporteId || !localId || !visitaId || !fecha) return;
    setSaveLoading(true);
    const local = equipos.find((e) => e.id === localId);
    const visita = equipos.find((e) => e.id === visitaId);
    await addDoc(collection(db, 'partidos'), {
      deporteId, divisionId: divisionId || '',
      equipoLocalId: localId, equipoLocalNombre: local?.nombre || '',
      equipoVisitaId: visitaId, equipoVisitaNombre: visita?.nombre || '',
      fecha: new Date(fecha).getTime(), estado: 'programado',
      marcadorLocal: 0, marcadorVisita: 0, minuto: '0', minutoSegundos: 0,
      penalesLocal: 0, penalesVisita: 0, estadoTiempo: 'pendiente',
      tiempoInicio: 0, inicioPartido: 0,
      jornada: parseInt(jornadaNuevo) || 1, estadio: estadio || local?.estadio || '',
      eventos: [], actualizadoEn: Date.now(),
    });
    setShowForm(false); setSaveLoading(false);
  };

  const cambiarEstado = async (id: string, estado: EstadoPartido) => { await updateDoc(doc(db, 'partidos', id), { estado, actualizadoEn: Date.now() }); };
  const eliminar = async (id: string) => { if (confirm('¿Eliminar partido?')) await deleteDoc(doc(db, 'partidos', id)); };

  const partidosDivision = partidos.filter(p => !filterDeporte || p.deporteId === filterDeporte);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-[var(--text)]">Partidos</h2><p className="text-sm text-[var(--text-secondary)]">{partidos.length} partidos registrados</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1.5" /> Nuevo Partido</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Partidos" value={partidos.length} icon={Swords} gradient="from-red-500 to-red-600" />
        <MetricCard label="En Vivo" value={partidos.filter(p=>p.estado==='en_vivo').length} icon={Swords} gradient="from-red-500 to-rose-600" />
        <MetricCard label="Programados" value={partidos.filter(p=>p.estado==='programado').length} icon={Calendar} gradient="from-blue-500 to-blue-600" />
        <MetricCard label="Finalizados" value={partidos.filter(p=>p.estado==='finalizado').length} icon={CheckCircle} gradient="from-emerald-500 to-emerald-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar equipo..." className="pl-9" /></div>
        <div className="w-36"><Select value={filterEstado} onValueChange={setFilterEstado}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem><SelectItem value="en_vivo">En Vivo</SelectItem><SelectItem value="programado">Programado</SelectItem><SelectItem value="finalizado">Finalizado</SelectItem></SelectContent></Select></div>
        <div className="w-36"><Select value={filterDeporte} onValueChange={(v) => { setFilterDeporte(v); setFilterDivision(''); }}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent><SelectItem value="">Todos</SelectItem>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
        <div className="w-36"><Select value={filterDivision} onValueChange={setFilterDivision} disabled={!filterDeporte}><SelectTrigger><SelectValue placeholder="División" /></SelectTrigger><SelectContent><SelectItem value="">Todas</SelectItem>{divisionesFiltradas.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent></Select></div>
      </div>

      {/* Jornada Navigation */}
      <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setJornadaActual(1)} disabled={jornadaActual <= 1} title="Primera jornada"><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setJornadaActual(j => Math.max(1, j - 1))} disabled={jornadaActual <= 1} title="Anterior"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
        <div className="text-center">
          <span className="text-sm font-bold text-[var(--text)]">JORNADA {jornadaActual}</span>
          <span className="text-xs text-[var(--text-muted)] ml-2">de {totalJornadas}</span>
          <div className="text-[10px] text-[var(--text-muted)]">{filtered.length} partidos</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setJornadaActual(j => Math.min(totalJornadas, j + 1))} disabled={jornadaActual >= totalJornadas} title="Siguiente"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setJornadaActual(totalJornadas)} disabled={jornadaActual >= totalJornadas} title="Última jornada"><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* New match form */}
      {showForm && (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3 animate-fade-in">
          <h3 className="font-semibold text-sm text-[var(--text)]">Crear partido en Jornada {jornadaNuevo}</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Deporte</Label><Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setDivisionId(''); setLocalId(''); setVisitaId(''); }}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">División</Label><Select value={divisionId} onValueChange={setDivisionId} disabled={!deporteId}><SelectTrigger><SelectValue placeholder="División" /></SelectTrigger><SelectContent><SelectItem value="">Sin división</SelectItem>{divisiones.filter(d=>d.deporteId===deporteId).map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Jornada</Label><Input type="number" value={jornadaNuevo} onChange={(e) => setJornadaNuevo(e.target.value)} min={1} /></div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Fecha / Hora</Label><Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Local</Label>
              <Select value={localId} onValueChange={setLocalId} disabled={!deporteId}>
                <SelectTrigger><SelectValue placeholder={deporteId ? equiposDisponibles.length === 0 ? 'No hay equipos disponibles' : 'Seleccionar local' : 'Primero deporte'} /></SelectTrigger>
                <SelectContent>
                  {equiposDisponibles.length === 0 && <SelectItem value="" disabled>Todos los equipos tienen partido</SelectItem>}
                  {equiposDisponibles.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-[10px] text-[var(--text-muted)]">Visita</Label>
              <Select value={visitaId} onValueChange={setVisitaId} disabled={!deporteId}>
                <SelectTrigger><SelectValue placeholder={deporteId ? 'Seleccionar visita' : 'Primero deporte'} /></SelectTrigger>
                <SelectContent>
                  {equiposDisponibles.length === 0 && <SelectItem value="" disabled>Todos los equipos tienen partido</SelectItem>}
                  {equiposDisponibles.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {equiposDisponibles.length < 2 && <p className="text-xs text-amber-500">Se necesitan al menos 2 equipos disponibles en esta jornada</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={crearPartido} loading={saveLoading} size="sm" disabled={equiposDisponibles.length < 2}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Crear Partido
            </Button>
          </div>
        </div>
      )}

      {/* Partidos list */}
      {loading ? <Loader /> : !filtered.length ? <EmptyState title="Sin partidos en esta jornada" description={filterEstado || filterDeporte || filterDivision ? 'Prueba cambiando los filtros' : ''} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-20">Hora</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Partido</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Dep</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Estado</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Resultado</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => {
                const fechaPartido = new Date(p.fecha);
                const hora = `${fechaPartido.getHours().toString().padStart(2, '0')}:${fechaPartido.getMinutes().toString().padStart(2, '0')}`;
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 text-sm font-mono text-[var(--text-muted)]">{hora}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><span className="text-sm font-medium text-[var(--text)]">{p.equipoLocalNombre}</span><span className="text-xs text-[var(--text-muted)]">vs</span><span className="text-sm font-medium text-[var(--text)]">{p.equipoVisitaNombre}</span></div></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell"><SportIcon sport={deportes.find((d) => d.id === p.deporteId)?.icono || ''} size={16} /></td>
                    <td className="p-3"><StatusBadge status={p.estado === 'en_vivo' ? 'error' : p.estado === 'finalizado' ? 'success' : 'neutral'} label={p.estado === 'en_vivo' ? 'En Vivo' : p.estado === 'finalizado' ? 'Finalizado' : 'Programado'} /></td>
                    <td className="p-3 text-center"><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorLocal}</span><span className="text-[var(--text-muted)] mx-0.5">-</span><span className="font-bold font-display text-base text-[var(--text)]">{p.marcadorVisita}</span></td>
                    <td className="p-3 text-right"><div className="flex justify-end gap-1">
                      {p.estado === 'programado' && <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600" onClick={() => cambiarEstado(p.id, 'en_vivo')} title="Iniciar"><Play className="h-4 w-4" /></Button>}
                      {p.estado === 'en_vivo' && <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600" onClick={() => cambiarEstado(p.id, 'finalizado')} title="Finalizar"><CheckCircle className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => eliminar(p.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
