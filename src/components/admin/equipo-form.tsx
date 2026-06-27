'use client';

import { useState, useRef } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Save, Upload } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Equipo } from '@/types/equipo';

export function EquipoForm({ equipo }: { equipo?: Equipo }) {
  const { deportes } = useDeportes();
  const [nombre, setNombre] = useState(equipo?.nombre || '');
  const [nombreCorto, setNombreCorto] = useState(equipo?.nombreCorto || '');
  const [deporteId, setDeporteId] = useState(equipo?.deporteId || '');
  const [ciudad, setCiudad] = useState(equipo?.ciudad || '');
  const [estadio, setEstadio] = useState(equipo?.estadio || '');
  const [color1, setColor1] = useState(equipo?.colorPrimario || '#E11D48');
  const [color2, setColor2] = useState(equipo?.colorSecundario || '#0F172A');
  const [logoBase64, setLogoBase64] = useState(equipo?.logoBase64 || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 200, 0.5); setLogoBase64(b64); }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = { nombre, nombreCorto, deporteId, ciudad, estadio, colorPrimario: color1, colorSecundario: color2, logoBase64, fundacion: 0, entrenador: '', activo: true };
      if (equipo) await updateDoc(doc(db, 'equipos', equipo.id), data);
      else await addDoc(collection(db, 'equipos'), data);
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">{equipo ? 'Editar' : 'Nuevo'} Equipo</h2></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0">
            <label className="block w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] transition-colors" style={{ backgroundColor: color1 }}>
              {logoBase64 ? <img src={logoBase64} alt="" className="w-full h-full object-contain p-1" /> : <div className="w-full h-full flex items-center justify-center text-white text-lg font-black">{nombreCorto?.slice(0, 3).toUpperCase() || '?'}</div>}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
              <div className="space-y-2"><Label>Corto (3 letras)</Label><Input value={nombreCorto} onChange={(e) => setNombreCorto(e.target.value.toUpperCase().slice(0, 3))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Ciudad</Label><Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Angol" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Estadio</Label><Input value={estadio} onChange={(e) => setEstadio(e.target.value)} /></div>
              <div className="space-y-2"><Label>Colores</Label><div className="flex gap-2"><input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="h-12 w-12 rounded-lg cursor-pointer border border-[var(--border)]" /><input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-12 w-12 rounded-lg cursor-pointer border border-[var(--border)]" /></div></div>
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-2" />{success ? '✓ Guardado' : 'Guardar Equipo'}</Button>
      </CardContent>
    </Card>
  );
}
