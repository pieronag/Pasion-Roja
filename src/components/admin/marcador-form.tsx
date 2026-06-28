'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMarcador } from '@/hooks/use-marcador';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { useCronometro } from '@/hooks/use-cronometro';
import { SportIcon } from '@/components/shared/sport-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { CronometroPartido } from '@/components/admin/cronometro-partido';
import { Swords, RotateCcw, Goal, Save, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Partido } from '@/types/partido';

export function MarcadorForm() {
  const { partido: livePartido } = useMarcador();
  const { equipos } = useEquipos();
  const { deportes } = useDeportes();
  const [partidoEnVivo, setPartidoEnVivo] = useState<Partido | null>(null);
  const [partidoId, setPartidoId] = useState('');
  const [deporteId, setDeporteId] = useState('');
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVis, setEquipoVis] = useState('');
  const [marcadorLocal, setMarcadorLocal] = useState(0);
  const [marcadorVis, setMarcadorVis] = useState(0);
  const [minuto, setMinuto] = useState('0');
  const [mostrarOpcionesEmpate, setMostrarOpcionesEmpate] = useState(false);

  const crono = useCronometro(partidoId, partidoEnVivo ? {
    estadoTiempo: partidoEnVivo.estadoTiempo,
    minutoDisplay: partidoEnVivo.minuto,
    minutoSegundos: partidoEnVivo.minutoSegundos,
    tiempoInicio: partidoEnVivo.tiempoInicio,
    inicioPartido: partidoEnVivo.inicioPartido,
    penalesLocal: partidoEnVivo.penalesLocal,
    penalesVisita: partidoEnVivo.penalesVisita,
  } : undefined);

  // Auto-detect live match
  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const doc_ = snap.docs[0];
        const data = { id: doc_.id, ...doc_.data() } as Partido;
        setPartidoEnVivo(data);
        setPartidoId(doc_.id);
        setEquipoLocal(data.equipoLocalNombre || '');
        setEquipoVis(data.equipoVisitaNombre || '');
        setMarcadorLocal(data.marcadorLocal || 0);
        setMarcadorVis(data.marcadorVisita || 0);
        setMinuto(data.minuto || '0');
        setDeporteId(data.deporteId || '');
      } else {
        setPartidoEnVivo(null);
        setPartidoId('');
      }
    });
    return () => unsub();
  }, []);

  // Sync desde partidos_en_vivo si no hay partido en vivo
  useEffect(() => {
    if (!partidoEnVivo && livePartido) {
      setEquipoLocal(livePartido.equipoLocal || '');
      setEquipoVis(livePartido.equipoVis || '');
      setMarcadorLocal(livePartido.marcadorLocal);
      setMarcadorVis(livePartido.marcadorVis);
      setMinuto(livePartido.minuto || '0');
      setDeporteId(livePartido.deporteId || '');
    }
  }, [livePartido, partidoEnVivo]);

  const equiposFiltrados = (deporteId ? equipos.filter((e) => e.deporteId === deporteId) : equipos).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const submitScore = async (local: number, vis: number) => {
    if (!equipoLocal || !equipoVis) return;
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        equipoLocal, equipoVis, marcadorLocal: local, marcadorVis: vis,
        minuto: crono.minutoDisplay,
        deporteId: deporteId || '',
        estadoTiempo: crono.estadoTiempo,
        penalesLocal: crono.penalesLocal,
        penalesVisita: crono.penalesVisita,
        actualizadoEn: Date.now(),
      }, { merge: true });
      if (partidoId) {
        await updateDoc(doc(db, 'partidos', partidoId), {
          marcadorLocal: local, marcadorVisita: vis, minuto: crono.minutoDisplay,
          estadoTiempo: crono.estadoTiempo,
          penalesLocal: crono.penalesLocal,
          penalesVisita: crono.penalesVisita,
          actualizadoEn: Date.now(),
        });
      }
    } catch {}
  };

  // Sincronizar marcadores con crono
  useEffect(() => { crono.setMarcadorLocal(marcadorLocal); }, [marcadorLocal]);
  useEffect(() => { crono.setMarcadorVisita(marcadorVis); }, [marcadorVis]);

  const golLocal = () => {
    const nv = marcadorLocal + 1;
    setMarcadorLocal(nv);
    submitScore(nv, marcadorVis);
  };
  const golVisita = () => {
    const nv = marcadorVis + 1;
    setMarcadorVis(nv);
    submitScore(marcadorLocal, nv);
  };
  const reset = () => {
    setMarcadorLocal(0); setMarcadorVis(0); setMinuto('0');
  };

  const handleSubmit = () => submitScore(marcadorLocal, marcadorVis);
  const activeMatch = partidoEnVivo || livePartido;

  // Manejadores de cronómetro que limpian la UI de opciones
  const handleFinalizar = async () => {
    const empate = marcadorLocal === marcadorVis;
    if (empate && (crono.estadoTiempo === 'segundo_tiempo' || crono.estadoTiempo === 'te2')) {
      setMostrarOpcionesEmpate(true);
      return;
    }
    setMostrarOpcionesEmpate(false);
    await crono.finalizarPartido();
  };

  const handleTE1 = async () => {
    setMostrarOpcionesEmpate(false);
    await crono.iniciarTE1();
  };

  const handlePenales = async () => {
    setMostrarOpcionesEmpate(false);
    await crono.iniciarPenales();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Scoreboard */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[var(--accent)] to-orange-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Marcador en Vivo</h2></div>
              {activeMatch && <BadgeEnVivo size="sm" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {partidoEnVivo && (
              <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Partido: {partidoEnVivo.equipoLocalNombre} vs {partidoEnVivo.equipoVisitaNombre}
              </div>
            )}

            <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Deporte</Label>
              <Select value={deporteId} onValueChange={setDeporteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}><span className="flex items-center gap-1.5"><SportIcon sport={d.icono} size={14} /><span>{d.nombre}</span></span></SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2 space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Local</Label>
                <Select value={equipoLocal} onValueChange={(v) => setEquipoLocal(v)}>
                  <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                  <SelectContent>{equiposFiltrados.map((e) => <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-1 text-center space-y-1.5">
                <Label className="text-[10px] text-[var(--text-muted)]">Marcador</Label>
                <div className="flex items-center gap-1 justify-center">
                  <Input type="number" min={0} value={marcadorLocal} onChange={(e) => { const v = parseInt(e.target.value) || 0; setMarcadorLocal(v); }} className="w-14 text-center text-xl font-black font-display h-11" />
                  <span className="text-lg font-black text-[var(--text-muted)]">:</span>
                  <Input type="number" min={0} value={marcadorVis} onChange={(e) => { const v = parseInt(e.target.value) || 0; setMarcadorVis(v); }} className="w-14 text-center text-xl font-black font-display h-11" />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Visita</Label>
                <Select value={equipoVis} onValueChange={(v) => setEquipoVis(v)}>
                  <SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger>
                  <SelectContent>{equiposFiltrados.map((e) => <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Goles rápidos */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={golLocal} className="bg-emerald-600 hover:bg-emerald-700 h-11"><Goal className="h-4 w-4 mr-1.5" /> Gol {equipoLocal || 'Local'}</Button>
              <Button onClick={golVisita} variant="destructive" className="h-11"><Goal className="h-4 w-4 mr-1.5" /> Gol {equipoVis || 'Visita'}</Button>
            </div>

            {/* Penales */}
            {crono.estadoTiempo === 'penales' && (
              <div className="p-3 rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/5">
                <p className="text-xs font-semibold text-red-500 mb-2">⚽ PENALES</p>
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-sm font-bold text-[var(--text)]">{equipoLocal}: {crono.penalesLocal}</span>
                  <span className="text-xs text-[var(--text-muted)]">-</span>
                  <span className="text-sm font-bold text-[var(--text)]">{equipoVis}: {crono.penalesVisita}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={crono.golPenalLocal} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Goal className="h-3.5 w-3.5 mr-1" /> Gol {equipoLocal}</Button>
                  <Button onClick={crono.golPenalVisita} size="sm" variant="destructive"><Goal className="h-3.5 w-3.5 mr-1" /> Gol {equipoVis}</Button>
                </div>
              </div>
            )}

            {/* Opciones de empate (post 2T o TE2) */}
            {mostrarOpcionesEmpate && (
              <div className="p-3 rounded-[var(--radius-sm)] border border-amber-500/20 bg-amber-500/5 space-y-2">
                <p className="text-xs font-semibold text-amber-600">Partido empatado. Elige cómo continuar:</p>
                <div className="flex gap-2">
                  <Button onClick={handleTE1} size="sm" className="bg-orange-600 hover:bg-orange-700"><Plus className="h-3.5 w-3.5 mr-1" /> Tiempo Extra</Button>
                  <Button onClick={handlePenales} size="sm" className="bg-red-600 hover:bg-red-700"><Goal className="h-3.5 w-3.5 mr-1" /> Penales</Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button onClick={handleSubmit} loading={false} size="full"><Save className="h-4 w-4 mr-1.5" /> Guardar Marcador</Button>
              <Button variant="outline" size="icon" onClick={reset} className="h-10 w-10 flex-shrink-0"><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Cronómetro */}
        <CronometroPartido
          estadoTiempo={crono.estadoTiempo}
          minutoDisplay={crono.minutoDisplay}
          hayEmpate={crono.hayEmpate}
          puedeTE={true}
          puedePenales={true}
          onIniciar1T={crono.iniciarPrimerTiempo}
          onDescanso={crono.pausarDescanso}
          onIniciar2T={crono.iniciarSegundoTiempo}
          onTE1={handleTE1}
          onDescansoTE={crono.pausarDescansoTE}
          onTE2={crono.iniciarTE2}
          onPenales={handlePenales}
          onFinalizar={handleFinalizar}
        />
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
          <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Vista previa</h3></CardHeader>
          <CardContent>
            <div className={`rounded-[var(--radius-sm)] border-2 p-4 text-center ${activeMatch ? 'border-[var(--accent)]/30 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
              {activeMatch ? (
                <><BadgeEnVivo size="sm" className="mb-2" />
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{equipoLocal || 'Local'}</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorLocal}</span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">vs</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorVis}</span>
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{equipoVis || 'Visita'}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{crono.minutoDisplay}'</Badge>
                </>
              ) : <p className="text-xs text-[var(--text-muted)] py-2">Sin partido activo</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
