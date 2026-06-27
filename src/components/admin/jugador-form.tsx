'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Save, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Jugador } from '@/types/jugador';

export function JugadorForm({ jugador, equipoId: defaultEquipoId, onClose }: { jugador?: Jugador; equipoId?: string; onClose?: () => void }) {
  const { deportes } = useDeportes();
  const [deporteId, setDeporteId] = useState(jugador?.deporteId || '');
  const { equipos } = useEquipos(deporteId);
  const [nombre, setNombre] = useState(jugador?.nombre || '');
  const [apellido, setApellido] = useState(jugador?.apellido || '');
  const [numero, setNumero] = useState(jugador?.numero?.toString() || '');
  const [posicion, setPosicion] = useState(jugador?.posicion || '');
  const [equipoId, setEquipoId] = useState(jugador?.equipoId || defaultEquipoId || '');
  const [nacionalidad, setNacionalidad] = useState(jugador?.nacionalidad || 'Chilena');
  const [altura, setAltura] = useState(jugador?.altura?.toString() || '');
  const [peso, setPeso] = useState(jugador?.peso?.toString() || '');
  const [fotoBase64, setFotoBase64] = useState(jugador?.fotoBase64 || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 300, 0.5); setFotoBase64(b64); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim() || !apellido.trim()) { setError('Nombre y apellido requeridos'); return; }
    if (!equipoId) { setError('Selecciona un equipo'); return; }
    setSaving(true);
    try {
      const data = { nombre: nombre.trim(), apellido: apellido.trim(), nombreCompleto: `${nombre.trim()} ${apellido.trim()}`, numero: parseInt(numero) || 0, posicion: posicion.trim(), equipoId, deporteId, fotoBase64, activo: true, fechaNacimiento: 0, nacionalidad, altura: parseInt(altura) || 0, peso: parseInt(peso) || 0, estadisticasTemp: {} as Record<string, number>, temporadaActual: '2026' };
      if (jugador) await updateDoc(doc(db, 'jugadores', jugador.id), data);
      else await addDoc(collection(db, 'jugadores'), data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
      {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-green-500/10 border"><CheckCircle2 className="h-4 w-4 text-green-400" /><p className="text-xs text-green-400">Jugador guardado</p></div>}

      <div className="flex gap-3 items-start">
        <label className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] transition-colors bg-[var(--bg-secondary)] flex items-center justify-center">
          {fotoBase64 ? <img src={fotoBase64} alt="" className="w-full h-full object-cover" /> : <Upload className="h-5 w-5 text-[var(--text-muted)]" />}
          <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </label>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" /></div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Apellido</Label><Input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Número</Label><Input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} min={0} max={99} placeholder="00" /></div>
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Posición</Label><Input value={posicion} onChange={(e) => setPosicion(e.target.value)} placeholder="Delantero" /></div>
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Nacionalidad</Label><Input value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Altura (cm)</Label><Input type="number" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="175" /></div>
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Peso (kg)</Label><Input type="number" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="70" /></div>
        <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label>
          <Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setEquipoId(''); }}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Equipo</Label>
        <Select value={equipoId} onValueChange={setEquipoId} disabled={!deporteId}>
          <SelectTrigger><SelectValue placeholder={deporteId ? 'Seleccionar equipo' : 'Primero elige deporte'} /></SelectTrigger>
          <SelectContent>{equipos.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="h-3.5 w-3.5 mr-1" /> Cancelar</Button>}
        <Button onClick={handleSubmit} loading={saving} disabled={success} size="sm"><Save className="h-3.5 w-3.5 mr-1" /> {jugador ? 'Guardar' : 'Crear'}</Button>
      </div>
    </div>
  );
}
