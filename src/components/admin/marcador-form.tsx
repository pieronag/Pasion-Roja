'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, updateDoc, collection, query, where, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useCronometro } from '@/hooks/use-cronometro';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { CronometroPartido } from '@/components/admin/cronometro-partido';
import { Swords, RotateCcw, CircleDot, Save, AlertCircle, CheckCircle2, Plus, Clock, MapPin, User, X, Trophy, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Partido, EventoPartido } from '@/types/partido';
import type { Jugador } from '@/types/jugador';

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
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisita, setJugadoresVisita] = useState<Jugador[]>([]);
  const [showPlayerPicker, setShowPlayerPicker] = useState<'local' | 'visita' | null>(null);
  const [eventos, setEventos] = useState<EventoPartido[]>([]);

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
        setEventos(data.eventos || []);
      } else {
        setPartidoEnVivo(null);
        setPartidoId('');
        setEventos([]);
      }
    });
    return () => unsub();
  }, []);

  const principalId = Object.values(equiposMap).find(e => e.esPrincipal)?.id;

  useEffect(() => {
    if (!principalId) return;
    const q = query(collection(db, 'partidos'), where('equipoLocalId', '==', principalId));
    const unsub = onSnapshot(q, (snap) => {
      const partidos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Partido));
      partidos.sort((a, b) => a.fecha - b.fecha);
      const next = partidos.find(p => p.estado === 'programado');
      setProximoPartido(next || null);
    }, () => {});
    return () => unsub();
  }, [principalId]);

  // Load players for both teams
  useEffect(() => {
    if (!partidoEnVivo) return;
    const localId = partidoEnVivo.equipoLocalId;
    const visitaId = partidoEnVivo.equipoVisitaId;
    if (!localId && !visitaId) return;

    const unsubs: (() => void)[] = [];
    if (localId) {
      const q = query(collection(db, 'jugadores'), where('equipoId', '==', localId));
      unsubs.push(onSnapshot(q, (snap) => {
        setJugadoresLocal(snap.docs.map(d => ({ id: d.id, ...d.data() } as Jugador)).sort((a, b) => (a.numero || 0) - (b.numero || 0)));
      }));
    }
    if (visitaId) {
      const q = query(collection(db, 'jugadores'), where('equipoId', '==', visitaId));
      unsubs.push(onSnapshot(q, (snap) => {
        setJugadoresVisita(snap.docs.map(d => ({ id: d.id, ...d.data() } as Jugador)).sort((a, b) => (a.numero || 0) - (b.numero || 0)));
      }));
    }
    return () => unsubs.forEach(u => u());
  }, [partidoEnVivo?.equipoLocalId, partidoEnVivo?.equipoVisitaId]);

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

  const localEquipo = equiposMap[partidoEnVivo?.equipoLocalId || ''];
  const visEquipo = equiposMap[partidoEnVivo?.equipoVisitaId || ''];
  const localNombre = localEquipo?.nombre || partidoEnVivo?.equipoLocalNombre || '';
  const visNombre = visEquipo?.nombre || partidoEnVivo?.equipoVisitaNombre || '';

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

  const handleGolJugador = async (jugador: Jugador, equipo: 'local' | 'visita') => {
    if (!partidoId || !partidoEnVivo) return;
    setShowPlayerPicker(null);

    const evento: EventoPartido = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tipo: 'gol',
      equipo,
      jugador: `${jugador.nombre} ${jugador.apellido}`,
      jugadorId: jugador.id,
      minuto: crono.minutoDisplay || '0',
      timestamp: Date.now(),
    };

    const golesActuales = (jugador.estadisticasTemp?.goles || 0) + 1;
    const newLocal = equipo === 'local' ? marcadorLocal + 1 : marcadorLocal;
    const newVis = equipo === 'visita' ? marcadorVis + 1 : marcadorVis;

    try {
      await updateDoc(doc(db, 'jugadores', jugador.id), {
        estadisticasTemp: { ...jugador.estadisticasTemp, goles: golesActuales },
      });
      await updateDoc(doc(db, 'partidos', partidoId), {
        marcadorLocal: newLocal,
        marcadorVisita: newVis,
        eventos: arrayUnion(evento),
        actualizadoEn: Date.now(),
      });
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        marcadorLocal: newLocal, marcadorVis: newVis,
        minuto: crono.minutoDisplay, actualizadoEn: Date.now(),
      }, { merge: true });

      setMarcadorLocal(newLocal);
      setMarcadorVis(newVis);
      setEventos(prev => [...prev, evento]);
      setSuccess(`Gol de ${jugador.nombre}`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const anularGol = async (evento: EventoPartido) => {
    if (!partidoId || !partidoEnVivo) return;
    if (!confirm(`Anular gol de ${evento.jugador}?`)) return;

    const newLocal = evento.equipo === 'local' ? Math.max(0, marcadorLocal - 1) : marcadorLocal;
    const newVis = evento.equipo === 'visita' ? Math.max(0, marcadorVis - 1) : marcadorVis;

    try {
      if (evento.jugadorId) {
        const jugador = [...jugadoresLocal, ...jugadoresVisita].find(j => j.id === evento.jugadorId);
        if (jugador) {
          const golesRestantes = Math.max(0, (jugador.estadisticasTemp?.goles || 0) - 1);
          await updateDoc(doc(db, 'jugadores', jugador.id), {
            estadisticasTemp: { ...jugador.estadisticasTemp, goles: golesRestantes },
          });
        }
      }
      await updateDoc(doc(db, 'partidos', partidoId), {
        marcadorLocal: newLocal,
        marcadorVisita: newVis,
        eventos: arrayRemove(evento),
        actualizadoEn: Date.now(),
      });
      await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
        marcadorLocal: newLocal, marcadorVis: newVis,
        actualizadoEn: Date.now(),
      }, { merge: true });

      setMarcadorLocal(newLocal);
      setMarcadorVis(newVis);
      setEventos(prev => prev.filter(e => e.id !== evento.id));
      setSuccess(`Gol anulado: ${evento.jugador}`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };
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
                <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {localNombre} vs {visNombre}
                </div>

                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: localEquipo?.colorPrimario || '#1E293B' }}>
                      {localEquipo?.logoBase64 ? <img src={localEquipo.logoBase64} alt="" className="w-11 h-11 object-contain logo-img" /> : <span className="font-black text-lg">{localNombre.slice(0,2).toUpperCase()}</span>}
                    </div>
                    <p className="text-xs font-bold text-[var(--text)] text-center leading-tight">{localNombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={marcadorLocal} onChange={(e) => setMarcadorLocal(parseInt(e.target.value) || 0)} className="w-14 text-center text-2xl font-black font-display h-12" />
                    <span className="text-xl font-black text-[var(--text-muted)]">:</span>
                    <Input type="number" min={0} value={marcadorVis} onChange={(e) => setMarcadorVis(parseInt(e.target.value) || 0)} className="w-14 text-center text-2xl font-black font-display h-12" />
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: visEquipo?.colorPrimario || '#1E293B' }}>
                      {visEquipo?.logoBase64 ? <img src={visEquipo.logoBase64} alt="" className="w-11 h-11 object-contain logo-img" /> : <span className="font-black text-lg">{visNombre.slice(0,2).toUpperCase()}</span>}
                    </div>
                    <p className="text-xs font-bold text-[var(--text)] text-center leading-tight">{visNombre}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowPlayerPicker('local')} className="bg-emerald-600 hover:bg-emerald-700 h-12 text-base"><CircleDot className="h-5 w-5 mr-2" /> Gol {localNombre || 'Local'}</Button>
                  <Button onClick={() => setShowPlayerPicker('visita')} variant="destructive" className="h-12 text-base"><CircleDot className="h-5 w-5 mr-2" /> Gol {visNombre || 'Visita'}</Button>
                </div>

                {/* Player Picker Modal */}
                {showPlayerPicker && (
                  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPlayerPicker(null)}>
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                        <h3 className="text-sm font-bold text-[var(--text)]">Goleador - {showPlayerPicker === 'local' ? localNombre : visNombre}</h3>
                        <button onClick={() => setShowPlayerPicker(null)} className="p-1 rounded hover:bg-[var(--bg-hover)]"><X className="h-4 w-4" /></button>
                      </div>
                      <div className="overflow-y-auto max-h-[55vh] p-2 space-y-0.5 scrollbar-thin">
                        {(showPlayerPicker === 'local' ? jugadoresLocal : jugadoresVisita).length === 0 && (
                          <div className="text-center py-8 text-sm text-[var(--text-muted)]">Sin jugadores cargados</div>
                        )}
                        {(showPlayerPicker === 'local' ? jugadoresLocal : jugadoresVisita).map((j) => (
                          <button key={j.id} onClick={() => handleGolJugador(j, showPlayerPicker)} className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors text-left">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] overflow-hidden flex-shrink-0">
                              {j.fotoBase64 ? <img src={j.fotoBase64} alt="" className="w-full h-full object-cover" /> : (j.numero || '?')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text)] truncate">{j.nombre} {j.apellido}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">#{j.numero || '—'} · {j.posicion}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-[var(--text-muted)]">Goles</span>
                              <p className="text-sm font-bold text-[var(--accent)]">{(j.estadisticasTemp?.goles || 0) + (marcadorLocal + marcadorVis > 0 ? 0 : 0)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {crono.estadoTiempo === 'penales' && (
                  <div className="p-3 rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/5">
                    <p className="text-xs font-semibold text-red-500 mb-2">PENALES</p>
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
                  <Button variant="outline" size="icon" onClick={() => { setMarcadorLocal(0); setMarcadorVis(0); }} className="h-10 w-10 flex-shrink-0"><RotateCcw className="h-4 w-4" /></Button>
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

        {/* Events Timeline */}
        {activeMatch && eventos.length > 0 && (
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <CardHeader><h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5"><Trophy className="h-4 w-4" /> Goles del Partido</h3></CardHeader>
            <CardContent className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {eventos.filter(e => e.tipo === 'gol').map((e, i) => (
                <div key={e.id || i} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] text-xs group">
                  <CircleDot className={cn('h-3.5 w-3.5 flex-shrink-0', e.equipo === 'local' ? 'text-emerald-500' : 'text-red-500')} />
                  <span className="font-bold text-[var(--text)]">{e.jugador}</span>
                  <span className="text-[var(--text-muted)] ml-auto">{e.minuto}'</span>
                  <button onClick={() => anularGol(e)} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all" title="Anular gol">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {proximoPartido && (
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
            <CardHeader><h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5"><Clock className="h-4 w-4" /> Proximo Partido</h3></CardHeader>
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
