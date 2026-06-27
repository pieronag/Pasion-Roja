'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartHandshake, Save, Upload } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Sponsor, TipoSponsor } from '@/types/sponsor';

export function SponsorForm({ sponsor }: { sponsor?: Sponsor }) {
  const [nombre, setNombre] = useState(sponsor?.nombre || '');
  const [url, setUrl] = useState(sponsor?.url || '');
  const [tipo, setTipo] = useState<TipoSponsor>(sponsor?.tipo || 'oficial');
  const [logoBase64, setLogoBase64] = useState(sponsor?.logoBase64 || '');
  const [descripcion, setDescripcion] = useState(sponsor?.descripcion || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 400, 0.6); setLogoBase64(b64); }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = { nombre, url, tipo, logoBase64, descripcion, orden: 0, activo: true, desde: Date.now() };
      if (sponsor) await updateDoc(doc(db, 'sponsors', sponsor.id), data);
      else await addDoc(collection(db, 'sponsors'), data);
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">{sponsor ? 'Editar' : 'Nuevo'} Sponsor</h2></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <label className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--accent)] flex items-center justify-center bg-[var(--bg-secondary)]">
            {logoBase64 ? <img src={logoBase64} alt="" className="w-full h-full object-contain p-2" /> : <Upload className="h-6 w-6 text-[var(--text-muted)]" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
              <div className="space-y-2"><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Tipo</Label><Select value={tipo} onValueChange={(v: TipoSponsor) => setTipo(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="principal">Principal</SelectItem><SelectItem value="oficial">Oficial</SelectItem><SelectItem value="auspiciador">Auspiciador</SelectItem><SelectItem value="media">Media</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit} loading={saving}><Save className="h-4 w-4 mr-2" />{success ? '✓ Guardado' : 'Guardar Sponsor'}</Button>
      </CardContent>
    </Card>
  );
}
