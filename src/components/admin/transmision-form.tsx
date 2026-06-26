'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTransmision } from '@/hooks/use-transmision';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Radio, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      setSuccess('Configuración de transmisión actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStart = () => {
    setEstado('en_vivo');
    setTimeout(() => handleSave(), 100);
  };

  const handleQuickStop = () => {
    setEstado('terminado');
    setTimeout(() => handleSave(), 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-rojo" />
            <h2 className="text-lg font-bold text-white">Gestor de Transmisión</h2>
          </div>
          {config?.estadoTransmision === 'en_vivo' && <BadgeEnVivo size="sm" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config?.estadoTransmision === 'en_vivo' && (
          <div className="rounded-xl bg-verde-cancha/10 border border-verde-cancha/30 p-4 text-center">
            <p className="text-verde-cancha font-bold text-lg">🔴 TRANSMITIENDO EN VIVO</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>URL de YouTube</Label>
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
          {extractYoutubeId(youtubeUrl) && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black mt-2">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={estado} onValueChange={(v: EstadoTransmision) => setEstado(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin transmisión</SelectItem>
              <SelectItem value="en_vivo">🔴 En Vivo</SelectItem>
              <SelectItem value="programado">📅 Programado</SelectItem>
              <SelectItem value="terminado">⏹️ Terminado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {estado === 'programado' && (
          <div className="space-y-2">
            <Label>Programar para</Label>
            <Input type="datetime-local" value={programadoPara} onChange={(e) => setProgramadoPara(e.target.value)} className="text-white [color-scheme:dark]" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleQuickStart} variant="default" size="lg" className="bg-verde-cancha hover:bg-verde-cancha/80">
            <Play className="h-5 w-5 mr-2" /> Iniciar Stream
          </Button>
          <Button onClick={handleQuickStop} variant="destructive" size="lg">
            <Square className="h-5 w-5 mr-2" /> Finalizar
          </Button>
        </div>

        <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
          Guardar Configuración
        </Button>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-verde-cancha">{success}</p>}
      </CardContent>
    </Card>
  );
}
