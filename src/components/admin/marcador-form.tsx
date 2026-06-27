'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { SportIcon } from '@/components/shared/sport-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Swords, RotateCcw, Goal, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MarcadorForm() {
  const { partido } = useMarcador();
  const { equipos } = useEquipos();
  const { deportes } = useDeportes();
  const [deporteId, setDeporteId] = useState('');
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVis, setEquipoVis] = useState('');
  const [marcadorLocal, setMarcadorLocal] = useState(0);
  const [marcadorVis, setMarcadorVis] = useState(0);
  const [minuto, setMinuto] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (partido) { setEquipoLocal(partido.equipoLocal || ''); setEquipoVis(partido.equipoVis || ''); setMarcadorLocal(partido.marcadorLocal); setMarcadorVis(partido.marcadorVis); setMinuto(partido.minuto || '0'); setDeporteId(partido.deporteId || ''); }
  }, [partido]);

  const equiposFiltrados = deporteId ? equipos.filter((e) => e.deporteId === deporteId) : equipos;

  const selectLocal = (id: string) => { setLocalId(id); const e = equipos.find((e) => e.id === id); if (e) setEquipoLocal(e.nombre); setMarcadorLocal(0); };
  const selectVisita = (id: string) => { setVisitaId(id); const e = equipos.find((e) => e.id === id); if (e) setEquipoVis(e.nombre); setMarcadorVis(0); };

  const handleSubmit = async () => {
    setError(''); if (!equipoLocal || !equipoVis) { setError('Selecciona ambos equipos'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), { equipoLocal, equipoVis, marcadorLocal, marcadorVis, minuto, deporteId: deporteId || '', actualizadoEn: Date.now() });
      setSuccess(true); setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const golLocal = () => { setMarcadorLocal((p) => p + 1); setTimeout(handleSubmit, 150); };
  const golVisita = () => { setMarcadorVis((p) => p + 1); setTimeout(handleSubmit, 150); };
  const reset = () => { setMarcadorLocal(0); setMarcadorVis(0); setMinuto('0'); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[var(--accent)] to-orange-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Marcador en Vivo</h2></div>
              {partido && <BadgeEnVivo size="sm" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
            {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><p className="text-xs text-emerald-400">Marcador actualizado</p></div>}

            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label>
              <Select value={deporteId} onValueChange={setDeporteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2 space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Local</Label>
                <Select value={localId} onValueChange={selectLocal}><SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                  <SelectContent>{equiposFiltrados.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-1 text-center space-y-1.5">
                <Label className="text-[10px] text-[var(--text-muted)]">Marcador</Label>
                <div className="flex items-center gap-1 justify-center">
                  <Input type="number" min={0} value={marcadorLocal} onChange={(e) => setMarcadorLocal(parseInt(e.target.value) || 0)} className="w-14 text-center text-xl font-black font-display h-11" />
                  <span className="text-lg font-black text-[var(--text-muted)]">:</span>
                  <Input type="number" min={0} value={marcadorVis} onChange={(e) => setMarcadorVis(parseInt(e.target.value) || 0)} className="w-14 text-center text-xl font-black font-display h-11" />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Visita</Label>
                <Select value={visitaId} onValueChange={selectVisita}><SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger>
                  <SelectContent>{equiposFiltrados.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 max-w-[100px]"><Label className="text-xs text-[var(--text-muted)]">Minuto</Label><Input value={minuto} onChange={(e) => setMinuto(e.target.value)} placeholder="45+2" className="font-mono" /></div>

            <div><Label className="text-[10px] text-[var(--text-muted)] mb-1.5 block">Goles rápidos</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={golLocal} className="bg-emerald-600 hover:bg-emerald-700 h-11"><Goal className="h-4 w-4 mr-1.5" /> Gol {equipoLocal || 'Local'}</Button>
                <Button onClick={golVisita} variant="destructive" className="h-11"><Goal className="h-4 w-4 mr-1.5" /> Gol {equipoVis || 'Visita'}</Button>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={handleSubmit} loading={saving} size="full"><Save className="h-4 w-4 mr-1.5" /> {success ? '✓ Actualizado' : 'Actualizar Marcador'}</Button>
              <Button variant="outline" size="icon" onClick={reset} className="h-10 w-10 flex-shrink-0"><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
          <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Vista previa</h3></CardHeader>
          <CardContent>
            <div className={`rounded-[var(--radius-sm)] border-2 p-4 text-center ${partido ? 'border-[var(--accent)]/30 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
              {partido ? (
                <><BadgeEnVivo size="sm" className="mb-2" />
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{equipoLocal || 'Local'}</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorLocal}</span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">vs</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorVis}</span>
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{equipoVis || 'Visita'}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{minuto}'</Badge>
                </>
              ) : <p className="text-xs text-[var(--text-muted)] py-2">Sin partido activo</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
