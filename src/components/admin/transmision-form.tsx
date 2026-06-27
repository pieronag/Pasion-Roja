'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTransmision } from '@/hooks/use-transmision';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Radio, Play, Square, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractYoutubeId } from '@/lib/utils';
import type { EstadoTransmision } from '@/types/transmision';

export function TransmisionForm() {
  const { config } = useTransmision();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [estado, setEstado] = useState<EstadoTransmision>('none');
  const [programadoPara, setProgramadoPara] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (config) {
      setYoutubeUrl(config.youtubeUrl || '');
      setEstado(config.estadoTransmision);
      setProgramadoPara(config.programadoPara ? new Date(config.programadoPara).toISOString().slice(0, 16) : '');
    }
  }, [config]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const youtubeId = extractYoutubeId(youtubeUrl);
      await setDoc(doc(db, 'config_transmision', 'actual'), {
        youtubeUrl: youtubeUrl || null,
        youtubeLiveId: youtubeId || null,
        estadoTransmision: estado,
        programadoPara: programadoPara ? new Date(programadoPara).getTime() : null,
        actualizadoEn: Date.now(),
      });
      setSuccess('Configuración actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleQuickStart = () => { setEstado('en_vivo'); setTimeout(() => handleSave(), 100); };
  const handleQuickStop = () => { setEstado('terminado'); setTimeout(() => handleSave(), 100); };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Radio className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Gestor de Transmisión</h2></div>
          {config?.estadoTransmision === 'en_vivo' && <BadgeEnVivo size="sm" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
        {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20"><CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" /><p className="text-xs text-emerald-400">{success}</p></div>}

        {config?.estadoTransmision === 'en_vivo' && (
          <div className="p-3 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-center">
<div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><p className="text-emerald-600 font-bold text-sm">TRANSMITIENDO EN VIVO</p></div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--text-muted)]">URL de YouTube</Label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          {extractYoutubeId(youtubeUrl) && (
            <div className="aspect-video rounded-[var(--radius-sm)] overflow-hidden bg-black mt-2">
              <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`} className="w-full h-full" allowFullScreen />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--text-muted)]">Estado</Label>
          <Select value={estado} onValueChange={(v: EstadoTransmision) => setEstado(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin transmisión</SelectItem>
              <SelectItem value="en_vivo">En Vivo</SelectItem>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="terminado">Terminado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {estado === 'programado' && (
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--text-muted)]">Programar para</Label>
            <Input type="datetime-local" value={programadoPara} onChange={(e) => setProgramadoPara(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleQuickStart} className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="h-4 w-4 mr-1.5" /> Iniciar Stream
          </Button>
          <Button onClick={handleQuickStop} variant="destructive">
            <Square className="h-4 w-4 mr-1.5" /> Finalizar
          </Button>
        </div>

        <Button onClick={handleSave} loading={saving} size="full">
          <Save className="h-4 w-4 mr-1.5" /> Guardar Configuración
        </Button>
      </CardContent>
    </Card>
  );
}
