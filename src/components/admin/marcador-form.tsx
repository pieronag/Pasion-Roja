'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Swords, RotateCcw, Goal } from 'lucide-react';

export function MarcadorForm() {
  const { partido } = useMarcador();
  const { equipos } = useEquipos();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ equipoLocal: '', equipoVis: '', marcadorLocal: 0, marcadorVis: 0, minuto: '0', deporteId: '' });

  useEffect(() => {
    if (partido) {
      setForm({
        equipoLocal: partido.equipoLocal || '',
        equipoVis: partido.equipoVis || '',
        marcadorLocal: partido.marcadorLocal,
        marcadorVis: partido.marcadorVis,
        minuto: partido.minuto || '0',
        deporteId: partido.deporteId || '',
      });
    }
  }, [partido]);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        equipoLocal: form.equipoLocal,
        equipoVis: form.equipoVis,
        marcadorLocal: form.marcadorLocal,
        marcadorVis: form.marcadorVis,
        minuto: form.minuto,
        deporteId: form.deporteId || '',
        actualizadoEn: Date.now(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const golLocal = () => { setForm((p) => ({ ...p, marcadorLocal: p.marcadorLocal + 1 })); setTimeout(handleSubmit, 100); };
  const golVisita = () => { setForm((p) => ({ ...p, marcadorVis: p.marcadorVis + 1 })); setTimeout(handleSubmit, 100); };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Marcador en Vivo</h2></div>
          {partido && <BadgeEnVivo size="sm" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Deporte</Label>
          <Select value={form.deporteId} onValueChange={(v) => setForm((p) => ({ ...p, deporteId: v }))}>
            <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
            <SelectContent>
              {equipos.filter((e, i, a) => a.findIndex((x) => x.deporteId === e.deporteId) === i).map((e) => (
                <SelectItem key={e.deporteId} value={e.deporteId}>{e.deporteId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Equipo Local</Label>
            <Select value={form.equipoLocal} onValueChange={(v) => setForm((p) => ({ ...p, equipoLocal: v }))}>
              <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
              <SelectContent>{equipos.map((e) => <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Equipo Visita</Label>
            <Select value={form.equipoVis} onValueChange={(v) => setForm((p) => ({ ...p, equipoVis: v }))}>
              <SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger>
              <SelectContent>{equipos.map((e) => <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Marcador Local</Label>
            <Input type="number" inputMode="numeric" min={0} value={form.marcadorLocal} onChange={(e) => setForm((p) => ({ ...p, marcadorLocal: parseInt(e.target.value) || 0 }))} className="text-2xl font-black font-display text-center h-14" />
          </div>
          <div className="space-y-2"><Label>Marcador Visita</Label>
            <Input type="number" inputMode="numeric" min={0} value={form.marcadorVis} onChange={(e) => setForm((p) => ({ ...p, marcadorVis: parseInt(e.target.value) || 0 }))} className="text-2xl font-black font-display text-center h-14" />
          </div>
        </div>
        <div className="space-y-2"><Label>Minuto</Label><Input value={form.minuto} onChange={(e) => setForm((p) => ({ ...p, minuto: e.target.value }))} placeholder="Ej: 45+2" /></div>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={golLocal} variant="default" size="lg" className="text-base bg-green-600 hover:bg-green-700"><Goal className="h-5 w-5 mr-2" /> Gol Local</Button>
          <Button onClick={golVisita} variant="destructive" size="lg" className="text-base"><Goal className="h-5 w-5 mr-2" /> Gol Visita</Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit} loading={saving} className="flex-1" size="lg">{success ? '✓ Actualizado' : 'Actualizar Marcador'}</Button>
          <Button variant="outline" size="icon" onClick={() => setForm({ equipoLocal: '', equipoVis: '', marcadorLocal: 0, marcadorVis: 0, minuto: '0', deporteId: '' })}><RotateCcw className="h-4 w-4" /></Button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Marcador actualizado en tiempo real</p>}
      </CardContent>
    </Card>
  );
}
