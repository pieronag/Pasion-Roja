'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Swords, RotateCcw, Undo2, Goal } from 'lucide-react';
import { marcadorSchema, type MarcadorFormData } from '@/lib/validations';
import { cn } from '@/lib/utils';

export function MarcadorForm() {
  const { partido } = useMarcador();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<MarcadorFormData>({
    equipoLocal: '', equipoVis: '', marcadorLocal: 0, marcadorVis: 0, minuto: '0',
  });

  useEffect(() => {
    if (partido) {
      setForm({
        equipoLocal: partido.equipoLocal,
        equipoVis: partido.equipoVis,
        marcadorLocal: partido.marcadorLocal,
        marcadorVis: partido.marcadorVis,
        minuto: partido.minuto,
      });
    }
  }, [partido]);

  const handleSubmit = async () => {
    setError('');
    const result = marcadorSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues.map((e) => e.message).join('. '));
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        ...result.data,
        actualizadoEn: Date.now(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const golLocal = () => handleGol('local');
  const golVisita = () => handleGol('visita');

  const handleGol = (equipo: 'local' | 'visita') => {
    setForm((prev) => ({
      ...prev,
      [equipo === 'local' ? 'marcadorLocal' : 'marcadorVis']:
        (equipo === 'local' ? prev.marcadorLocal : prev.marcadorVis) + 1,
    }));
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-rojo" />
            <h2 className="text-lg font-bold text-white">Marcador en Vivo</h2>
          </div>
          {partido && <BadgeEnVivo size="sm" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Equipo Local</Label>
            <Input value={form.equipoLocal} onChange={(e) => setForm((p) => ({ ...p, equipoLocal: e.target.value }))} placeholder="Ej: Angol FC" />
          </div>
          <div className="space-y-2">
            <Label>Equipo Visita</Label>
            <Input value={form.equipoVis} onChange={(e) => setForm((p) => ({ ...p, equipoVis: e.target.value }))} placeholder="Ej: Deportes Temuco" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Marcador Local</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.marcadorLocal}
              onChange={(e) => setForm((p) => ({ ...p, marcadorLocal: parseInt(e.target.value) || 0 }))}
              className="text-2xl font-black font-display text-center h-14"
            />
          </div>
          <div className="space-y-2">
            <Label>Marcador Visita</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={form.marcadorVis}
              onChange={(e) => setForm((p) => ({ ...p, marcadorVis: parseInt(e.target.value) || 0 }))}
              className="text-2xl font-black font-display text-center h-14"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Minuto</Label>
          <Input value={form.minuto} onChange={(e) => setForm((p) => ({ ...p, minuto: e.target.value }))} placeholder="Ej: 45+2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={golLocal} variant="default" size="lg" className="text-base bg-verde-cancha hover:bg-verde-cancha/80">
            <Goal className="h-5 w-5 mr-2" /> Gol Local
          </Button>
          <Button onClick={golVisita} variant="default" size="lg" className="text-base bg-rojo hover:bg-rojo-oscuro">
            <Goal className="h-5 w-5 mr-2" /> Gol Visita
          </Button>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} loading={saving} className="flex-1" size="lg">
            {success ? '✓ Actualizado' : 'Actualizar Marcador'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setForm({ equipoLocal: '', equipoVis: '', marcadorLocal: 0, marcadorVis: 0, minuto: '0' })}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-verde-cancha">Marcador actualizado en tiempo real</p>}
      </CardContent>
    </Card>
  );
}
