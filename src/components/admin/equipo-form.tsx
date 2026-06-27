'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Save, X, Upload, CheckCircle2, AlertCircle, MapPin, User, CalendarDays, Palette } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Equipo } from '@/types/equipo';
import type { Division } from '@/types/division';

export function EquipoForm({ equipo, onClose }: { equipo?: Equipo; onClose?: () => void }) {
  const { deportes } = useDeportes();
  const [allDivisiones, setAllDivisiones] = useState<Division[]>([]);
  const [filteredDivisiones, setFilteredDivisiones] = useState<Division[]>([]);
  const [nombre, setNombre] = useState(equipo?.nombre || '');
  const [nombreCorto, setNombreCorto] = useState(equipo?.nombreCorto || '');
  const [deporteId, setDeporteId] = useState(equipo?.deporteId || '');
  const [divisionId, setDivisionId] = useState(equipo?.divisionId || '');
  const [ciudad, setCiudad] = useState(equipo?.ciudad || '');
  const [estadio, setEstadio] = useState(equipo?.estadio || '');
  const [fundacion, setFundacion] = useState(equipo?.fundacion?.toString() || '');
  const [entrenador, setEntrenador] = useState(equipo?.entrenador || '');
  const [presidente, setPresidente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [color1, setColor1] = useState(equipo?.colorPrimario || '#E11D48');
  const [color2, setColor2] = useState(equipo?.colorSecundario || '#0F172A');
  const [logoBase64, setLogoBase64] = useState(equipo?.logoBase64 || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load ALL divisions for display in the table (not just filtered ones)
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'divisiones')), (snap) => {
      setAllDivisiones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Division)));
    });
    return () => unsub();
  }, []);

  // Filter divisions by selected deporte
  useEffect(() => {
    if (!deporteId) { setFilteredDivisiones([]); return; }
    setFilteredDivisiones(allDivisiones.filter((d) => d.deporteId === deporteId && d.activa));
    // If editing, make sure to set the correct division
    if (equipo?.divisionId) {
      const div = allDivisiones.find((d) => d.id === equipo.divisionId);
      if (div && div.deporteId === deporteId) setDivisionId(equipo.divisionId);
    }
  }, [deporteId, allDivisiones, equipo]);

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
        presidente: presidente.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        colorPrimario: color1,
        colorSecundario: color2,
        logoBase64,
        activo: true,
      };

      if (equipo) {
        // Update: remove from old division, add to new
        if (equipo.divisionId && equipo.divisionId !== divisionId) {
          const oldDiv = allDivisiones.find((d) => d.id === equipo.divisionId);
          if (oldDiv) {
            await updateDoc(doc(db, 'divisiones', equipo.divisionId), {
              equipoIds: (oldDiv.equipoIds || []).filter((id) => id !== equipo.id),
            });
          }
        }
        if (divisionId && divisionId !== equipo.divisionId) {
          const newDiv = allDivisiones.find((d) => d.id === divisionId);
          if (newDiv) {
            await updateDoc(doc(db, 'divisiones', divisionId), {
              equipoIds: [...(newDiv.equipoIds || []), equipo.id],
            });
          }
        }
        await updateDoc(doc(db, 'equipos', equipo.id), data);
      } else {
        const docRef = await addDoc(collection(db, 'equipos'), data);
        if (divisionId) {
          const div = allDivisiones.find((d) => d.id === divisionId);
          if (div) {
            await updateDoc(doc(db, 'divisiones', divisionId), {
              equipoIds: [...(div.equipoIds || []), docRef.id],
            });
          }
        }
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Pre-populate fields from editing
  useEffect(() => {
    if (equipo) {
      setPresidente((equipo as any).presidente || '');
      setTelefono((equipo as any).telefono || '');
      setEmail((equipo as any).email || '');
    }
  }, [equipo]);

  return (
    <div className="space-y-4">
      {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
      {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-green-500/10 border border-green-500/20"><CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" /><p className="text-xs text-green-400">Equipo guardado exitosamente</p></div>}

      {/* Sección: Identidad */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Identidad del Equipo</h4>
        <div className="flex gap-3 items-start">
          <label className="flex-shrink-0 w-16 h-16 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] transition-colors flex items-center justify-center" style={{ backgroundColor: color1 }}>
            {logoBase64 ? <img src={logoBase64} alt="" className="w-full h-full object-contain p-1" /> : <Upload className="h-5 w-5 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Nombre del equipo</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Angol FC" /></div>
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Abreviatura (3 letras)</Label><Input value={nombreCorto} onChange={(e) => setNombreCorto(e.target.value.toUpperCase().slice(0, 3))} placeholder="ANG" maxLength={3} className="font-mono uppercase" /></div>
          </div>
        </div>
      </div>

      {/* Sección: Clasificación */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Clasificación Deportiva</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label>
            <Select value={deporteId} onValueChange={(v) => { setDeporteId(v); setDivisionId(''); }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
              <SelectContent>{deportes.filter((d) => d.activo).map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">División / Liga</Label>
            <Select value={divisionId} onValueChange={setDivisionId} disabled={!deporteId}>
              <SelectTrigger><SelectValue placeholder={deporteId ? 'Seleccionar división' : 'Primero elige deporte'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin división</SelectItem>
                {filteredDivisiones.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre} ({d.temporada})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sección: Ubicación */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Ubicación</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Ciudad</Label><Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Angol" /></div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Estadio / Cancha</Label><Input value={estadio} onChange={(e) => setEstadio(e.target.value)} placeholder="Estadio Angol" /></div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Año fundación</Label><Input type="number" value={fundacion} onChange={(e) => setFundacion(e.target.value)} placeholder="2020" /></div>
        </div>
      </div>

      {/* Sección: Contacto */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Directiva y Contacto</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Entrenador / DT</Label><Input value={entrenador} onChange={(e) => setEntrenador(e.target.value)} placeholder="Nombre del DT" /></div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Presidente</Label><Input value={presidente} onChange={(e) => setPresidente(e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Teléfono</Label><Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 ..." /></div>
        </div>
      </div>

      {/* Sección: Identidad Visual */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Identidad Visual</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-[var(--text-muted)]">Color 1</Label>
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-9 h-9 rounded-[var(--radius-xs)] cursor-pointer border border-[var(--border)]" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-[var(--text-muted)]">Color 2</Label>
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-9 h-9 rounded-[var(--radius-xs)] cursor-pointer border border-[var(--border)]" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-[var(--text-muted)]">Previsualización</Label>
            <div className="w-9 h-9 rounded-[var(--radius-xs)] border border-[var(--border)]" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="h-3.5 w-3.5 mr-1" /> Cancelar</Button>}
        <Button onClick={handleSubmit} loading={saving} disabled={success} size="sm"><Save className="h-3.5 w-3.5 mr-1" /> {equipo ? 'Guardar Cambios' : 'Crear Equipo'}</Button>
      </div>
    </div>
  );
}
