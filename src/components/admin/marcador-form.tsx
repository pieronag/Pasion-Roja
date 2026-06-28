'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useCronometro } from '@/hooks/use-cronometro';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { CronometroPartido } from '@/components/admin/cronometro-partido';
import { Swords, RotateCcw, CircleDot, Save, AlertCircle, CheckCircle2, Plus, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Partido } from '@/types/partido';

export function MarcadorForm() {
  const { equiposMap } = useEquiposMap();
  const { deportes } = useDeportes();
  const [partidoEnVivo, setPartidoEnVivo] = useState<Partido | null>(null);
  const [partidoId, setPartidoId] = useState('');
  const [proximoPartido, setProximoPartido] = useState<Partido | null>(null);
  const [marcadorLocal, setMarcadorLocal] = useState(0);
  const [marcadorVis, setMarcadorVis] = useState(0);
  const [mostrarOpcionesEmpate, setMostrarOpcionesEmpate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState('');

  // Auto-detect live match
  useEffect(() => {
    const q = query(collection(db, 'partidos'), where('estado', '==', 'en_vivo'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const doc_ = snap.docs[0];
        const data = { id: doc_.id, ...doc_.data() } as Partido;
        setPartidoEnVivo(data);
        setPartidoId(doc_.id);
        setMarcadorLocal(data.marcadorLocal || 0);
        setMarcadorVis(data.marcadorVisita || 0);
      } else {
        setPartidoEnVivo(null);
        setPartidoId('');
      }
    });
    return () => unsub();
  }, []);

  // Find next Malleco match
  const principalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;

  useEffect(() => {
    if (!principalId) return;
    const q = query(
      collection(db, 'partidos'),
      orderBy('fecha', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      const next = partidos.find(
        p => p.estado === 'programado' && (p.equipoLocalId === principalId || p.equipoVisitaId === principalId)
      );
      setProximoPartido(next || null);
    }, (err) => console.warn('Error loading next match:', err));
    return () => unsub();
  }, [principalId]);

  // Countdown for next match - actualiza cada segundo
  useEffect(() => {
    if (!proximoPartido?.fecha) return;
    const fn = () => {
      const diff = proximoPartido.fecha - Date.now();
      if (diff <= 0) { setCountdown('¡Comenzando!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    fn();
    const timer = setInterval(fn, 1000);
    return () => clearInterval(timer);
  }, [proximoPartido]);

  const crono = useCronometro(partidoId, partidoEnVivo ? {
    estadoTiempo: partidoEnVivo.estadoTiempo,
    minutoDisplay: partidoEnVivo.minuto,
    minutoSegundos: partidoEnVivo.minutoSegundos,
    tiempoInicio: partidoEnVivo.tiempoInicio,
    inicioPartido: partidoEnVivo.inicioPartido,
    penalesLocal: partidoEnVivo.penalesLocal,
    penalesVisita: partidoEnVivo.penalesVisita,
  } : undefined);

  // Get team data from equiposMap
  const localEquipo = equiposMap[partidoEnVivo?.equipoLocalId || ''];
  const visEquipo = equiposMap[partidoEnVivo?.equipoVisitaId || ''];
  const localNombre = localEquipo?.nombre || partidoEnVivo?.equipoLocalNombre || '';
  const visNombre = visEquipo?.nombre || partidoEnVivo?.equipoVisitaNombre || '';

  // Next match team data
  const proxLocal = equiposMap[proximoPartido?.equipoLocalId || ''];
  const proxVis = equiposMap[proximoPartido?.equipoVisitaId || ''];
  const proxLocalNombre = proxLocal?.nombre || proximoPartido?.equipoLocalNombre || '';
  const proxVisNombre = proxVis?.nombre || proximoPartido?.equipoVisitaNombre || '';

  const submitScore = async (local: number, vis: number) => {
    if (!partidoId) return;
    setSaving(true);
    setError(''); setSuccess('');
    try {
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        equipoLocal: localNombre, equipoVis: visNombre,
        equipoLocalId: partidoEnVivo?.equipoLocalId,
        equipoVisitaId: partidoEnVivo?.equipoVisitaId,
        marcadorLocal: local, marcadorVis: vis,
        minuto: crono.minutoDisplay, deporteId: partidoEnVivo?.deporteId || '',
        estadoTiempo: crono.estadoTiempo,
        penalesLocal: crono.penalesLocal, penalesVisita: crono.penalesVisita,
        actualizadoEn: Date.now(),
      }, { merge: true });
      await updateDoc(doc(db, 'partidos', partidoId), {
        marcadorLocal: local, marcadorVisita: vis, minuto: crono.minutoDisplay,
        estadoTiempo: crono.estadoTiempo, actualizadoEn: Date.now(),
      });
      setSuccess('Marcador actualizado');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  useEffect(() => { crono.setMarcadorLocal(marcadorLocal); }, [marcadorLocal]);
  useEffect(() => { crono.setMarcadorVisita(marcadorVis); }, [marcadorVis]);

  const golLocal = () => { const nv = marcadorLocal + 1; setMarcadorLocal(nv); submitScore(nv, marcadorVis); };
  const golVisita = () => { const nv = marcadorVis + 1; setMarcadorVis(nv); submitScore(marcadorLocal, nv); };
  const reset = () => { setMarcadorLocal(0); setMarcadorVis(0); };

  const handleSubmit = () => submitScore(marcadorLocal, marcadorVis);
  const activeMatch = partidoEnVivo;

  const handleFinalizar = async () => {
    const empate = marcadorLocal === marcadorVis;
    if (empate && (crono.estadoTiempo === 'segundo_tiempo' || crono.estadoTiempo === 'te2')) {
      setMostrarOpcionesEmpate(true);
      return;
    }
    setMostrarOpcionesEmpate(false);
    await crono.finalizarPartido();
  };
  const handleTE1 = async () => { setMostrarOpcionesEmpate(false); await crono.iniciarTE1(); };
  const handlePenales = async () => { setMostrarOpcionesEmpate(false); await crono.iniciarPenales(); };

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
            {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
            {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><p className="text-xs text-emerald-400">{success}</p></div>}

            {activeMatch ? (
              <>
                {/* Live match indicator */}
                <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {localNombre} vs {visNombre}
                </div>

                {/* Score section with logos */}
                <div className="flex items-center justify-center gap-6 py-4">
                  {/* Local */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: localEquipo?.colorPrimario || '#1E293B' }}>
                      {localEquipo?.logoBase64 ? <img src={localEquipo.logoBase64} alt="" className="w-11 h-11 object-contain logo-img" /> : <span className="font-black text-lg">{localNombre.slice(0,2).toUpperCase()}</span>}
                    </div>
                    <p className="text-xs font-bold text-[var(--text)] text-center leading-tight">{localNombre}</p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={marcadorLocal} onChange={(e) => setMarcadorLocal(parseInt(e.target.value) || 0)} className="w-14 text-center text-2xl font-black font-display h-12" />
                    <span className="text-xl font-black text-[var(--text-muted)]">:</span>
                    <Input type="number" min={0} value={marcadorVis} onChange={(e) => setMarcadorVis(parseInt(e.target.value) || 0)} className="w-14 text-center text-2xl font-black font-display h-12" />
                  </div>

                  {/* Visitor */}
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: visEquipo?.colorPrimario || '#1E293B' }}>
                      {visEquipo?.logoBase64 ? <img src={visEquipo.logoBase64} alt="" className="w-11 h-11 object-contain logo-img" /> : <span className="font-black text-lg">{visNombre.slice(0,2).toUpperCase()}</span>}
                    </div>
                    <p className="text-xs font-bold text-[var(--text)] text-center leading-tight">{visNombre}</p>
                  </div>
                </div>

                {/* Goal buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={golLocal} className="bg-emerald-600 hover:bg-emerald-700 h-12 text-base"><CircleDot className="h-5 w-5 mr-2" /> Gol {localNombre || 'Local'}</Button>
                  <Button onClick={golVisita} variant="destructive" className="h-12 text-base"><CircleDot className="h-5 w-5 mr-2" /> Gol {visNombre || 'Visita'}</Button>
                </div>

                {/* Penales */}
                {crono.estadoTiempo === 'penales' && (
                  <div className="p-3 rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/5">
                    <p className="text-xs font-semibold text-red-500 mb-2">⚽ PENALES</p>
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <span className="text-sm font-bold text-[var(--text)]">{localNombre}: {crono.penalesLocal}</span>
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                      <span className="text-sm font-bold text-[var(--text)]">{visNombre}: {crono.penalesVisita}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={crono.golPenalLocal} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><CircleDot className="h-3.5 w-3.5 mr-1" /> Gol</Button>
                      <Button onClick={crono.golPenalVisita} size="sm" variant="destructive"><CircleDot className="h-3.5 w-3.5 mr-1" /> Gol</Button>
                    </div>
                  </div>
                )}

                {/* Empate options */}
                {mostrarOpcionesEmpate && (
                  <div className="p-3 rounded-[var(--radius-sm)] border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <p className="text-xs font-semibold text-amber-600">Partido empatado. Elige cómo continuar:</p>
                    <div className="flex gap-2">
                      <Button onClick={handleTE1} size="sm" className="bg-orange-600 hover:bg-orange-700"><Plus className="h-3.5 w-3.5 mr-1" /> Tiempo Extra</Button>
                      <Button onClick={handlePenales} size="sm" className="bg-red-600 hover:bg-red-700"><CircleDot className="h-3.5 w-3.5 mr-1" /> Penales</Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button onClick={handleSubmit} loading={saving} size="full"><Save className="h-4 w-4 mr-1.5" /> Guardar Marcador</Button>
                  <Button variant="outline" size="icon" onClick={reset} className="h-10 w-10 flex-shrink-0"><RotateCcw className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <Swords className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">No hay partido en vivo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cronómetro */}
        {activeMatch && (
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
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Preview */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
          <CardHeader><h3 className="text-sm font-semibold text-[var(--text)]">Vista previa</h3></CardHeader>
          <CardContent>
            <div className={`rounded-[var(--radius-sm)] border-2 p-4 text-center ${activeMatch ? 'border-[var(--accent)]/30 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
              {activeMatch ? (
                <><BadgeEnVivo size="sm" className="mb-2" />
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{localNombre}</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorLocal}</span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">vs</span>
                    <span className="text-2xl font-black font-display text-[var(--text)]">{marcadorVis}</span>
                    <span className="text-sm font-bold text-[var(--text)] truncate max-w-[80px]">{visNombre}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{crono.minutoDisplay}'</Badge>
                </>
              ) : <p className="text-xs text-[var(--text-muted)] py-2">Sin partido activo</p>}
            </div>
          </CardContent>
        </Card>

        {/* Próximamente */}
        {proximoPartido && (
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
            <CardHeader><h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5"><Clock className="h-4 w-4" /> Próximo Partido</h3></CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-black font-display text-amber-500 mb-2">{countdown}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {proxLocal?.logoBase64 && <img src={proxLocal.logoBase64} alt="" className="w-6 h-6 object-contain logo-img" />}
                  <span className="text-sm font-bold text-[var(--text)]">{proxLocalNombre}</span>
                  <span className="text-xs text-[var(--text-muted)]">vs</span>
                  <span className="text-sm font-bold text-[var(--text)]">{proxVisNombre}</span>
                  {proxVis?.logoBase64 && <img src={proxVis.logoBase64} alt="" className="w-6 h-6 object-contain logo-img" />}
                </div>
                <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {proximoPartido.estadio || 'Por definir'} · Jornada {proximoPartido.jornada}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
