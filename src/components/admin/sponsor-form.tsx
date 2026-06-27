'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartHandshake, Save, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Sponsor, TipoSponsor } from '@/types/sponsor';

export function SponsorForm({ sponsor, onClose }: { sponsor?: Sponsor; onClose?: () => void }) {
  const [nombre, setNombre] = useState(sponsor?.nombre || '');
  const [url, setUrl] = useState(sponsor?.url || '');
  const [tipo, setTipo] = useState<TipoSponsor>(sponsor?.tipo || 'oficial');
  const [descripcion, setDescripcion] = useState(sponsor?.descripcion || '');
  const [logoBase64, setLogoBase64] = useState(sponsor?.logoBase64 || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 400, 0.6); setLogoBase64(b64); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const data = { nombre: nombre.trim(), url: url.trim(), tipo, logoBase64, descripcion: descripcion.trim(), orden: sponsor?.orden || 0, activo: true, desde: sponsor?.desde || Date.now() };
      if (sponsor) await updateDoc(doc(db, 'sponsors', sponsor.id), data);
      else await addDoc(collection(db, 'sponsors'), data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose?.(); }, 1000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
      {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-green-500/10 border"><CheckCircle2 className="h-4 w-4 text-green-400" /><p className="text-xs text-green-400">Sponsor guardado</p></div>}

      <div className="flex gap-3 items-start">
        <label className="flex-shrink-0 w-24 h-14 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] transition-colors bg-[var(--bg-secondary)] flex items-center justify-center">
          {logoBase64 ? <img src={logoBase64} alt="" className="w-full h-full object-contain p-1" /> : <Upload className="h-5 w-5 text-[var(--text-muted)]" />}
          <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        </label>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Empresa SPA" /></div>
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Sitio web</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Tipo</Label>
              <Select value={tipo} onValueChange={(v: TipoSponsor) => setTipo(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="principal">Principal</SelectItem><SelectItem value="oficial">Oficial</SelectItem><SelectItem value="auspiciador">Auspiciador</SelectItem><SelectItem value="media">Media</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs text-[var(--text-muted)]">Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="h-3.5 w-3.5 mr-1" /> Cancelar</Button>}
        <Button onClick={handleSubmit} loading={saving} disabled={success} size="sm"><Save className="h-3.5 w-3.5 mr-1" /> {sponsor ? 'Guardar' : 'Crear'}</Button>
      </div>
    </div>
  );
}
