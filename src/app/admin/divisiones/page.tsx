'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/admin/metric-card';
import { Shield, Plus, Trash2, Trophy, Users, Save, X, CheckCircle2, AlertCircle, ListChecks, Pencil } from 'lucide-react';
import type { Division, TipoLiguilla } from '@/types/division';

export default function AdminDivisionesPage() {
  const { deportes } = useDeportes();
  const { equipos } = useEquipos();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);
  const [nombre, setNombre] = useState('');
  const [deporteId, setDeporteId] = useState('');
  const [temporada, setTemporada] = useState('2026');
  const [totalJornadas, setTotalJornadas] = useState('30');
  const [tieneCuadrangular, setTieneCuadrangular] = useState(false);
  const [equiposCuadrangular, setEquiposCuadrangular] = useState('4');
  const [ascensos, setAscensos] = useState('2');
  const [descensos, setDescensos] = useState('2');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDeporte, setFilterDeporte] = useState('');
  const [tipoLiguilla, setTipoLiguilla] = useState<TipoLiguilla>('none');
  const [puestosDesde, setPuestosDesde] = useState('1');
  const [puestosHasta, setPuestosHasta] = useState('4');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const divisionesFiltradas = divisiones.filter((d) => !filterDeporte || d.deporteId === filterDeporte);

  const resetForm = () => {
    setNombre(''); setDeporteId(''); setTemporada('2026');
    setTotalJornadas('30'); setTieneCuadrangular(false);
    setEquiposCuadrangular('4'); setAscensos('2'); setDescensos('2');
    setTipoLiguilla('none'); setPuestosDesde('1'); setPuestosHasta('4');
    setError(''); setSuccess('');
  };

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };
  const openEdit = (d: Division) => {
    setEditing(d); setNombre(d.nombre); setDeporteId(d.deporteId);
    setTemporada(d.temporada); setTotalJornadas(d.totalJornadas?.toString() || '30');
    setTieneCuadrangular(d.tieneCuadrangular || false);
    setEquiposCuadrangular(d.equiposCuadrangular?.toString() || '4');
    setAscensos(d.ascensos?.toString() || '2'); setDescensos(d.descensos?.toString() || '2');
    setTipoLiguilla(d.tipoLiguilla || 'none');
    setPuestosDesde(d.puestosLiguillaDesde?.toString() || '1');
    setPuestosHasta(d.puestosLiguillaHasta?.toString() || '4');
    setShowForm(true);
  };

  const guardar = async () => {
    setError('');
    if (!nombre || !deporteId) { setError('Nombre y deporte requeridos'); return; }
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim(), deporteId, temporada, tipo: 'liga' as const,
        activa: true, equipoIds: editing?.equipoIds || [],
        totalJornadas: parseInt(totalJornadas) || 30,
        tieneCuadrangular,
        equiposCuadrangular: tieneCuadrangular ? parseInt(equiposCuadrangular) || 4 : 0,
        tipoLiguilla: tieneCuadrangular ? tipoLiguilla : 'none',
        puestosLiguillaDesde: tieneCuadrangular ? parseInt(puestosDesde) || 1 : 0,
        puestosLiguillaHasta: tieneCuadrangular ? parseInt(puestosHasta) || 4 : 0,
        ascensos: parseInt(ascensos) || 0,
        descensos: parseInt(descensos) || 0,
      };
      if (editing) {
        await updateDoc(doc(db, 'divisiones', editing.id), data);
      } else {
        await addDoc(collection(db, 'divisiones'), data);
      }
      setSuccess('División guardada');
      setTimeout(() => { setShowForm(false); setSuccess(''); }, 1200);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar división?')) await deleteDoc(doc(db, 'divisiones', id)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-[var(--text)]">Divisiones / Ligas</h2><p className="text-sm text-[var(--text-secondary)]">{divisiones.length} divisiones registradas</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Nueva División</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Divisiones" value={divisiones.length} icon={Shield} gradient="from-blue-500 to-blue-600" />
        <MetricCard label="Deportes" value={deportes.length} icon={Trophy} gradient="from-orange-500 to-orange-600" />
        <MetricCard label="Equipos" value={equipos.length} icon={Users} gradient="from-emerald-500 to-emerald-600" />
        <MetricCard label="Con cuadrangular" value={divisiones.filter(d => d.tieneCuadrangular).length} icon={Trophy} gradient="from-purple-500 to-purple-600" />
      </div>

      {/* Filter by sport */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setFilterDeporte('')} className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${!filterDeporte ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>Todos</button>
        {deportes.map((d) => (
          <button key={d.id} onClick={() => setFilterDeporte(d.id)} className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${filterDeporte === d.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>
            <SportIcon sport={d.icono} size={14} /> {d.nombre}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : !divisionesFiltradas.length ? <EmptyState title={filterDeporte ? 'Sin divisiones en este deporte' : 'Sin divisiones'} /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Deporte</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Temporada</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Jornadas</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Cuad.</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Asc/Desc</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Equipos</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
            </tr></thead>
            <tbody>
              {divisionesFiltradas.map((d) => {
                const deporte = deportes.find((x) => x.id === d.deporteId);
                const count = equipos.filter((e) => d.equipoIds?.includes(e.id)).length;
                return (
                  <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 font-medium text-sm text-[var(--text)]">{d.nombre}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]"><span className="flex items-center gap-1.5"><SportIcon sport={deporte?.icono || ''} size={14} /><span>{deporte?.nombre}</span></span></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{d.temporada}</td>
                    <td className="p-3 text-center text-sm text-[var(--text)] font-semibold">{d.totalJornadas || 30}</td>
                    <td className="p-3 text-center text-sm">{d.tieneCuadrangular ? <span className="text-emerald-500 font-medium">Sí ({d.equiposCuadrangular})</span> : <span className="text-[var(--text-muted)]">No</span>}</td>
                    <td className="p-3 text-center text-sm text-[var(--text-secondary)]">↑{d.ascensos || 0} / ↓{d.descensos || 0}</td>
                    <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{count}</td>
                    <td className="p-3 text-right"><div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => eliminar(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditing(null); }}}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nueva'} División</DialogTitle></DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
              {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><p className="text-xs text-emerald-400">{success}</p></div>}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Primera División" /></div>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Temporada</Label><Input value={temporada} onChange={(e) => setTemporada(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label>
                <Select value={deporteId} onValueChange={setDeporteId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <h4 className="text-xs font-semibold text-[var(--text)] mb-3">📅 Jornadas</h4>
                <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Total de jornadas</Label><Input type="number" value={totalJornadas} onChange={(e) => setTotalJornadas(e.target.value)} min={1} max={99} /></div>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <h4 className="text-xs font-semibold text-[var(--text)] mb-3">🏆 Playoff / Liguilla</h4>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="tieneCuad" checked={tieneCuadrangular} onChange={(e) => setTieneCuadrangular(e.target.checked)} className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]" />
                  <Label htmlFor="tieneCuad" className="text-xs text-[var(--text-secondary)]">Tiene fase final (playoff/liguilla)</Label>
                </div>
                {tieneCuadrangular && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-[var(--text-muted)]">Formato</Label>
                      <Select value={tipoLiguilla} onValueChange={(v: TipoLiguilla) => setTipoLiguilla(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cuadrangular">🏟️ Cuadrangular (eliminación directa)</SelectItem>
                          <SelectItem value="liguilla">📊 Liguilla (todos contra todos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Clasifican desde puesto</Label><Input type="number" value={puestosDesde} onChange={(e) => setPuestosDesde(e.target.value)} min={1} max={20} /></div>
                      <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Hasta puesto</Label><Input type="number" value={puestosHasta} onChange={(e) => setPuestosHasta(e.target.value)} min={1} max={20} /></div>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] p-2 rounded bg-[var(--bg-secondary)]">
                      Ejemplo: Del puesto <strong>{puestosDesde}</strong> al <strong>{puestosHasta}</strong> clasifican a {tipoLiguilla === 'cuadrangular' ? 'cuadrangular' : 'liguilla'} ({Math.max(0, (parseInt(puestosHasta) || 4) - (parseInt(puestosDesde) || 1) + 1)} equipos)
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <h4 className="text-xs font-semibold text-[var(--text)] mb-3">📊 Ascensos y Descensos</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Ascienden</Label><Input type="number" value={ascensos} onChange={(e) => setAscensos(e.target.value)} min={0} max={10} /></div>
                  <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Descienden</Label><Input type="number" value={descensos} onChange={(e) => setDescensos(e.target.value)} min={0} max={10} /></div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-3.5 w-3.5 mr-1" /> Cancelar</Button>
                <Button onClick={guardar} loading={saving} size="sm"><Save className="h-3.5 w-3.5 mr-1" /> {editing ? 'Guardar Cambios' : 'Crear División'}</Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
