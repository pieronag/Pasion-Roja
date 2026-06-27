'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Save } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Jugador } from '@/types/jugador';

export function JugadorForm({ jugador }: { jugador?: Jugador }) {
  const { equipos } = useEquipos();
  const [nombre, setNombre] = useState(jugador?.nombre || '');
  const [apellido, setApellido] = useState(jugador?.apellido || '');
  const [numero, setNumero] = useState(jugador?.numero?.toString() || '');
  const [posicion, setPosicion] = useState(jugador?.posicion || '');
  const [equipoId, setEquipoId] = useState(jugador?.equipoId || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = { nombre, apellido, nombreCompleto: `${nombre} ${apellido}`, numero: parseInt(numero) || 0, posicion, equipoId, activo: true, estadisticasTemp: {} as Record<string, number>, temporadaActual: '2026' };
      if (jugador) await updateDoc(doc(db, 'jugadores', jugador.id), data);
      else await addDoc(collection(db, 'jugadores'), data);
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">{jugador ? 'Editar' : 'Nuevo'} Jugador</h2></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
          <div className="space-y-2"><Label>Apellido</Label><Input value={apellido} onChange={(e) => setApellido(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Número</Label><Input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} /></div>
          <div className="space-y-2"><Label>Posición</Label><Input value={posicion} onChange={(e) => setPosicion(e.target.value)} placeholder="Delantero" /></div>
          <div className="space-y-2"><Label>Equipo</Label><Select value={equipoId} onValueChange={setEquipoId}><SelectTrigger><SelectValue placeholder="Equipo" /></SelectTrigger><SelectContent>{equipos.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-2" />{success ? '✓ Guardado' : 'Guardar Jugador'}</Button>
      </CardContent>
    </Card>
  );
}
