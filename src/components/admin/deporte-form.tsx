'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SportIconPicker } from '@/components/shared/sport-icons';
import { Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Deporte } from '@/types/deporte';

export function DeporteForm({ deporte, onClose }: { deporte?: Deporte; onClose?: () => void }) {
  const [nombre, setNombre] = useState(deporte?.nombre || '');
  const [icono, setIcono] = useState(deporte?.icono || '⚽ Fútbol');
  const [victoria, setVictoria] = useState(deporte?.sistemaPuntos?.victoria?.toString() || '3');
  const [empate, setEmpate] = useState(deporte?.sistemaPuntos?.empate?.toString() || '1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim(),
        icono,
        activo: true, orden: deporte?.orden || 0,
        sistemaPuntos: { victoria: parseInt(victoria) || 3, empate: parseInt(empate) || 1, derrota: 0 },
        estadisticasDisponibles: ['goles', 'asistencias', 'tarjetas'],
      };
      if (deporte) await updateDoc(doc(db, 'deportes', deporte.id), data);
      else await addDoc(collection(db, 'deportes'), data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
      {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-green-500/10 border border-green-500/20"><CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" /><p className="text-xs text-green-400">Deporte guardado</p></div>}

      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--text-muted)]">Nombre del deporte</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Fútbol" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-[var(--text-muted)]">Icono del deporte</Label>
        <SportIconPicker value={icono} onChange={setIcono} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Pts victoria</Label><Input type="number" value={victoria} onChange={(e) => setVictoria(e.target.value)} min={1} /></div>
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Pts empate</Label><Input type="number" value={empate} onChange={(e) => setEmpate(e.target.value)} min={0} /></div>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="h-3.5 w-3.5 mr-1" /> Cancelar</Button>}
        <Button onClick={handleSubmit} loading={saving} disabled={success} size="sm"><Save className="h-3.5 w-3.5 mr-1" /> {deporte ? 'Guardar Cambios' : 'Crear Deporte'}</Button>
      </div>
    </div>
  );
}
