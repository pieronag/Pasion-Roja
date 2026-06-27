'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Save, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Equipo } from '@/types/equipo';
import type { Division } from '@/types/division';

export function EquipoForm({ equipo, onClose }: { equipo?: Equipo; onClose?: () => void }) {
  const { deportes } = useDeportes();
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [nombre, setNombre] = useState(equipo?.nombre || '');
  const [nombreCorto, setNombreCorto] = useState(equipo?.nombreCorto || '');
  const [deporteId, setDeporteId] = useState(equipo?.deporteId || '');
  const [divisionId, setDivisionId] = useState(equipo?.divisionId || '');
  const [ciudad, setCiudad] = useState(equipo?.ciudad || '');
  const [estadio, setEstadio] = useState(equipo?.estadio || '');
  const [fundacion, setFundacion] = useState(equipo?.fundacion?.toString() || '');
  const [entrenador, setEntrenador] = useState(equipo?.entrenador || '');
  const [color1, setColor1] = useState(equipo?.colorPrimario || '#E11D48');
  const [color2, setColor2] = useState(equipo?.colorSecundario || '#0F172A');
  const [logoBase64, setLogoBase64] = useState(equipo?.logoBase64 || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load divisions when deporte changes
  useEffect(() => {
    if (!deporteId) { setDivisiones([]); return; }
    const q = query(collection(db, 'divisiones'), where('deporteId', '==', deporteId), where('activa', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      setDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, [deporteId]);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 300, 0.5); setLogoBase64(b64); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    if (!deporteId) { setError('Selecciona un deporte'); return; }
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim(),
        nombreCorto: nombreCorto.toUpperCase().slice(0, 3) || nombre.slice(0, 3).toUpperCase(),
        deporteId,
        divisionId: divisionId || '',
        ciudad: ciudad.trim(),
        estadio: estadio.trim(),
        fundacion: parseInt(fundacion) || 0,
        entrenador: entrenador.trim(),
        colorPrimario: color1,
        colorSecundario: color2,
        logoBase64,
        activo: true,
      };

      // If creating, add equipoId to division's equipoIds array
      if (equipo) {
        await updateDoc(doc(db, 'equipos', equipo.id), data);
      } else {
        const docRef = await addDoc(collection(db, 'equipos'), data);
        if (divisionId) {
          const divRef = doc(db, 'divisiones', divisionId);
          const div = divisiones.find((d) => d.id === divisionId);
          if (div) {
            await updateDoc(divRef, { equipoIds: [...(div.equipoIds || []), docRef.id] });
          }
        }
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1200);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const divisionesFiltradas = divisiones.filter((d) => d.deporteId === deporteId);

  return (
    <div className="space-y-5">
      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}
      {success && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="h-4 w-4 text-green-400" /><p className="text-sm text-green-400">Equipo guardado</p></div>}

      {/* Logo + basic info row */}
      <div className="flex gap-5 items-start">
        <div className="flex-shrink-0 text-center">
          <label className="block w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] transition-colors" style={{ backgroundColor: color1 }}>
            {logoBase64 ? <img src={logoBase64} alt="" className="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex flex-col items-center justify-center text-white"><Upload className="h-6 w-6 mb-1" /><span className="text-[10px] font-medium">Logo</span></div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Nombre del equipo</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Angol FC" /></div>
            <div className="space-y-1.5"><Label>Abreviatura (3 letras)</Label><Input value={nombreCorto} onChange={(e) => setNombreCorto(e.target.value.toUpperCase().slice(0, 3))} placeholder="ANG" maxLength={3} className="font-mono uppercase" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Deporte</Label>
              <Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setDivisionId(''); }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
                <SelectContent>{deportes.filter((d) => d.activo).map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>División / Liga</Label>
              <Select value={divisionId} onValueChange={setDivisionId} disabled={!deporteId}>
                <SelectTrigger><SelectValue placeholder={deporteId ? 'Seleccionar división' : 'Primero elige deporte'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin división</SelectItem>
                  {divisionesFiltradas.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre} ({d.temporada})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Estadio</Label><Input value={estadio} onChange={(e) => setEstadio(e.target.value)} placeholder="Ej: Estadio Angol" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Ciudad</Label><Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Angol" /></div>
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Año fundación</Label><Input type="number" value={fundacion} onChange={(e) => setFundacion(e.target.value)} placeholder="2020" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Entrenador</Label><Input value={entrenador} onChange={(e) => setEntrenador(e.target.value)} placeholder="Nombre del DT" /></div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--text-muted)]">Colores del equipo</Label>
          <div className="flex gap-3 items-center pt-1">
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] font-mono">{color1}</span>
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] font-mono">{color2}</span>
            <div className="w-10 h-10 rounded-lg border border-[var(--border)]" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
        {onClose && <Button type="button" variant="outline" onClick={onClose}><X className="h-4 w-4 mr-1.5" /> Cancelar</Button>}
        <Button onClick={handleSubmit} loading={saving} disabled={success}>
          <Save className="h-4 w-4 mr-1.5" /> {equipo ? 'Guardar Cambios' : 'Crear Equipo'}
        </Button>
      </div>
    </div>
  );
}
