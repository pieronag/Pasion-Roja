'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, Save } from 'lucide-react';
import type { Deporte } from '@/types/deporte';

export function DeporteForm({ deporte }: { deporte?: Deporte }) {
  const [nombre, setNombre] = useState(deporte?.nombre || '');
  const [icono, setIcono] = useState(deporte?.icono || '');
  const [victoria, setVictoria] = useState(deporte?.sistemaPuntos?.victoria || 3);
  const [empate, setEmpate] = useState(deporte?.sistemaPuntos?.empate || 1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = { nombre, icono, activo: true, orden: 0, sistemaPuntos: { victoria, empate, derrota: 0 }, estadisticasDisponibles: ['goles', 'asistencias', 'tarjetas'] };
      if (deporte) await updateDoc(doc(db, 'deportes', deporte.id), data);
      else await addDoc(collection(db, 'deportes'), data);
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">{deporte ? 'Editar' : 'Nuevo'} Deporte</h2></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Fútbol" /></div>
          <div className="space-y-2"><Label>Icono (emoji)</Label><Input value={icono} onChange={(e) => setIcono(e.target.value)} placeholder="Ej: ⚽" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Pts Victoria</Label><Input type="number" value={victoria} onChange={(e) => setVictoria(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Pts Empate</Label><Input type="number" value={empate} onChange={(e) => setEmpate(Number(e.target.value))} /></div>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-2" />{success ? '✓ Guardado' : 'Guardar'}</Button>
      </CardContent>
    </Card>
  );
}
