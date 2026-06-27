'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Swords, RotateCcw, Goal, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    if (partido) {
      setEquipoLocal(partido.equipoLocal || '');
      setEquipoVis(partido.equipoVis || '');
      setMarcadorLocal(partido.marcadorLocal);
      setMarcadorVis(partido.marcadorVis);
      setMinuto(partido.minuto || '0');
      setDeporteId(partido.deporteId || '');
    }
  }, [partido]);

  const equiposFiltrados = deporteId ? equipos.filter((e) => e.deporteId === deporteId) : equipos;

  const selectLocal = (id: string) => {
    setLocalId(id);
    const eq = equipos.find((e) => e.id === id);
    if (eq) setEquipoLocal(eq.nombre);
    setMarcadorLocal(0);
  };

  const selectVisita = (id: string) => {
    setVisitaId(id);
    const eq = equipos.find((e) => e.id === id);
    if (eq) setEquipoVis(eq.nombre);
    setMarcadorVis(0);
  };

  const handleSubmit = async () => {
    setError('');
    if (!equipoLocal || !equipoVis) { setError('Selecciona ambos equipos'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        equipoLocal, equipoVis, marcadorLocal, marcadorVis, minuto, deporteId: deporteId || '',
        actualizadoEn: Date.now(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const golLocal = () => { setMarcadorLocal((p) => p + 1); setTimeout(handleSubmit, 150); };
  const golVisita = () => { setMarcadorVis((p) => p + 1); setTimeout(handleSubmit, 150); };
  const reset = () => { setMarcadorLocal(0); setMarcadorVis(0); setMinuto('0'); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Scoreboard Preview */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Marcador en Vivo</h2></div>
              {partido && <BadgeEnVivo size="sm" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}
            {success && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border"><CheckCircle2 className="h-4 w-4 text-green-400" /><p className="text-sm text-green-400">Marcador actualizado en tiempo real</p></div>}

            {/* Deporte selector */}
            <div className="space-y-1.5">
              <Label>Deporte</Label>
              <Select value={deporteId} onValueChange={setDeporteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar deporte" /></SelectTrigger>
                <SelectContent>
                  {deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Equipos + scores */}
            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2 space-y-1.5">
                <Label>Equipo Local</Label>
                <Select value={localId} onValueChange={selectLocal}>
                  <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                  <SelectContent>
                    {equiposFiltrados.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex items-center gap-2">
                          {e.logoBase64 && <img src={e.logoBase64} alt="" className="w-4 h-4 object-contain" />}
                          {e.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 space-y-1.5 text-center">
                <Label className="text-xs text-[var(--text-muted)]">Marcador</Label>
                <div className="flex items-center gap-1 justify-center">
                  <Input type="number" min={0} value={marcadorLocal} onChange={(e) => setMarcadorLocal(parseInt(e.target.value) || 0)} className="w-16 text-center text-2xl font-black font-display h-14" />
                  <span className="text-2xl font-black text-[var(--text-muted)]">:</span>
                  <Input type="number" min={0} value={marcadorVis} onChange={(e) => setMarcadorVis(parseInt(e.target.value) || 0)} className="w-16 text-center text-2xl font-black font-display h-14" />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Equipo Visita</Label>
                <Select value={visitaId} onValueChange={selectVisita}>
                  <SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger>
                  <SelectContent>
                    {equiposFiltrados.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex items-center gap-2">
                          {e.logoBase64 && <img src={e.logoBase64} alt="" className="w-4 h-4 object-contain" />}
                          {e.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Minuto */}
            <div className="space-y-1.5 max-w-[120px]">
              <Label>Minuto</Label>
              <Input value={minuto} onChange={(e) => setMinuto(e.target.value)} placeholder="Ej: 45+2" className="font-mono" />
            </div>

            {/* Quick goals */}
            <div>
              <Label className="mb-2 block text-xs text-[var(--text-muted)]">Goles rápidos</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={golLocal} className="bg-green-600 hover:bg-green-700 text-lg h-14">
                  <Goal className="h-5 w-5 mr-2" /> Gol {equipoLocal || 'Local'}
                </Button>
                <Button onClick={golVisita} variant="destructive" className="text-lg h-14">
                  <Goal className="h-5 w-5 mr-2" /> Gol {equipoVis || 'Visita'}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} loading={saving} size="lg" className="flex-1">
                <Save className="h-4 w-4 mr-2" /> {success ? '✓ Actualizado' : 'Actualizar Marcador'}
              </Button>
              <Button variant="outline" size="icon" onClick={reset} className="h-13 w-13 flex-shrink-0">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live preview */}
      <div>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[var(--text)]">Vista previa</h3>
          </CardHeader>
          <CardContent>
            <div className={`rounded-xl border-2 p-5 text-center ${partido ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
              {partido ? (
                <>
                  <div className="text-xs text-[var(--accent)] font-bold mb-3 animate-pulse-rojo">🔴 EN VIVO</div>
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-lg font-bold text-[var(--text)] truncate max-w-[100px]">{equipoLocal || 'Local'}</span>
                    <span className="text-3xl font-black font-display text-[var(--text)]">{marcadorLocal}</span>
                    <span className="text-xl text-[var(--text-muted)]">:</span>
                    <span className="text-3xl font-black font-display text-[var(--text)]">{marcadorVis}</span>
                    <span className="text-lg font-bold text-[var(--text)] truncate max-w-[100px]">{equipoVis || 'Visita'}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">{minuto}'</div>
                </>
              ) : (
                <div className="py-4 text-sm text-[var(--text-muted)]">Sin partido activo</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
