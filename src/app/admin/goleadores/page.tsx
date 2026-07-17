'use client';

import { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MetricCard } from '@/components/admin/metric-card';
import { Goal, Plus, Pencil, Trash2, Star, CheckCircle2, AlertCircle, Shield, TrendingUp, Trophy } from 'lucide-react';
import type { Goleador } from '@/types/goleador';
import { useEquiposMap } from '@/hooks/use-equipos-map';

function GoleadorForm({ goleador, onClose }: { goleador?: Goleador; onClose?: () => void }) {
  const { equiposMap } = useEquiposMap();
  const equipos = Object.values(equiposMap).filter(e => e.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const principal = Object.values(equiposMap).find(e => e.esPrincipal);

  const [nombre, setNombre] = useState(goleador?.nombre || '');
  const [equipoId, setEquipoId] = useState(goleador?.equipoId || principal?.id || '');
  const [goles, setGoles] = useState(goleador?.goles?.toString() || '');

  const [activo, setActivo] = useState(goleador?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim() || !goles) { setError('Nombre y goles requeridos'); return; }
    if (!equipoId) { setError('Selecciona un equipo'); return; }
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim(),
        goles: parseInt(goles) || 0,
        equipoId,
        activo,
      };
      if (goleador) await updateDoc(doc(db, 'goleadores', goleador.id), data);
      else await addDoc(collection(db, 'goleadores'), data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />Guardado</div>}

      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--text-muted)]">Nombre del jugador</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--text-muted)]">Equipo</Label>
        <Select value={equipoId} onValueChange={setEquipoId}>
          <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
          <SelectContent>
            {equipos.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                <span className="flex items-center gap-2">
                  {e.logoBase64 && <img src={e.logoBase64} alt="" className="w-4 h-4 object-contain" />}
                  <span>{e.nombre}</span>
                  {e.esPrincipal && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--text-muted)]">Goles</Label>
        <Input type="number" value={goles} onChange={(e) => setGoles(e.target.value)} min={0} placeholder="0" />
      </div>

      <div className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="sr-only peer" />
          <div className="w-9 h-5 rounded-full bg-gray-600 peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
        </label>
        <span className="text-sm text-[var(--text-secondary)]">Jugador activo en la tabla</span>
      </div>

      <Button onClick={handleSubmit} loading={saving} size="full" className="mt-2">
        {goleador ? 'Guardar Cambios' : 'Crear Goleador'}
      </Button>
    </div>
  );
}

export default function AdminGoleadoresPage() {
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Goleador | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { equiposMap } = useEquiposMap();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'goleadores'), orderBy('goles', 'desc'), limit(50)), (snap) => {
      setGoleadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goleador)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalGoles = goleadores.reduce((s, g) => s + g.goles, 0);

  const eliminar = async (id: string) => {
    if (confirm('Eliminar este goleador?')) await deleteDoc(doc(db, 'goleadores', id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Goleadores</h2>
          <p className="text-sm text-[var(--text-secondary)]">{goleadores.length} registrados</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Nuevo Goleador</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nuevo Goleador</DialogTitle></DialogHeader>
            <DialogBody><GoleadorForm onClose={() => setShowCreate(false)} /></DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Goleadores" value={goleadores.length} icon={Goal} gradient="from-yellow-500 to-yellow-700" />
        <MetricCard label="Activos" value={goleadores.filter(g => g.activo).length} icon={Star} gradient="from-emerald-500 to-emerald-700" />
        <MetricCard label="Total Goles" value={totalGoles} icon={TrendingUp} gradient="from-orange-500 to-orange-700" />
        <MetricCard label="Promedio" value={goleadores.length > 0 ? (totalGoles / goleadores.length).toFixed(1) : '0'} icon={Trophy} gradient="from-purple-500 to-purple-700" />
      </div>

      {loading ? <Loader /> : !goleadores.length ? (
        <EmptyState title="Sin goleadores" description="Agrega goleadores manualmente" icon={<Goal />} />
      ) : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-8">#</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Equipo</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Goles</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Activo</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {goleadores.map((g, i) => {
                const eq = equiposMap[g.equipoId];
                return (
                  <tr key={g.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 text-center font-bold text-xs font-mono text-[var(--text-secondary)]">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--accent)] flex-shrink-0">
                          {g.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--text)]">{g.nombre}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {eq?.logoBase64 ? <img src={eq.logoBase64} alt="" className="w-4 h-4 object-contain" /> : <Shield className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
                        <span className="text-sm text-[var(--text-secondary)]">{eq?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-black text-sm">
                        {g.goles}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {g.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 className="h-3 w-3" />SI</span>
                      ) : (
                        <span className="text-red-400 text-xs">NO</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(g); }} title="Editar"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => eliminar(g.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Goleador</DialogTitle></DialogHeader>
          <DialogBody>{editing && <GoleadorForm goleador={editing} onClose={() => setEditing(null)} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
