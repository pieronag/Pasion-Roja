'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, collection, query, where, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { useCronometro } from '@/hooks/use-cronometro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { CronometroPartido } from '@/components/admin/cronometro-partido';
import { Swords, RotateCcw, Save, AlertCircle, CheckCircle2, Plus, Clock, MapPin, X, Trash2, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Partido, EventoPartido } from '@/types/partido';
import type { Jugador } from '@/types/jugador';

type EventAction = 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'doble_amarilla';

export function MarcadorForm() {
  const { equiposMap } = useEquiposMap();
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
  const [showPlayerPicker, setShowPlayerPicker] = useState<{ equipo: 'local' | 'visita'; action: EventAction } | null>(null);
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
      if (diff <= 0) { setCountdown('!Comenzando!'); return; }
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
  const localLogo = localEquipo?.logoBase64;
  const visLogo = visEquipo?.logoBase64;

  const formatMinuto = () => {
    const m = parseInt(crono.minutoDisplay) || 0;
    const s = crono.minutoSegundos || 0;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
        minuto: crono.minutoDisplay,
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

  const registrarEvento = async (jugador: Jugador, equipo: 'local' | 'visita', action: EventAction) => {
    if (!partidoId || !partidoEnVivo) return;
    setShowPlayerPicker(null);

    const tipo: EventoPartido['tipo'] = action === 'doble_amarilla' ? 'tarjeta_roja' : action;
    const evento: EventoPartido = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tipo,
      equipo,
      jugador: `${jugador.nombre} ${jugador.apellido}`,
      jugadorId: jugador.id,
      minuto: formatMinuto(),
      timestamp: Date.now(),
    };

    const newLocal = action === 'gol' && equipo === 'local' ? marcadorLocal + 1 : marcadorLocal;
    const newVis = action === 'gol' && equipo === 'visita' ? marcadorVis + 1 : marcadorVis;

    try {
      if (action === 'gol') {
        const golesActuales = (jugador.estadisticasTemp?.goles || 0) + 1;
        await updateDoc(doc(db, 'jugadores', jugador.id), {
          estadisticasTemp: { ...jugador.estadisticasTemp, goles: golesActuales },
        });
      }
      await updateDoc(doc(db, 'partidos', partidoId), {
        marcadorLocal: newLocal,
        marcadorVisita: newVis,
        eventos: arrayUnion(evento),
        actualizadoEn: Date.now(),
      });
      if (action === 'gol') {
        await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
          marcadorLocal: newLocal, marcadorVis: newVis,
          minuto: crono.minutoDisplay, actualizadoEn: Date.now(),
        }, { merge: true });
        setMarcadorLocal(newLocal);
        setMarcadorVis(newVis);
      }

      setEventos(prev => [...prev, evento]);
      const msg = action === 'gol' ? `Gol de ${jugador.nombre}` : action === 'tarjeta_amarilla' ? `Amarilla para ${jugador.nombre}` : `Roja para ${jugador.nombre}`;
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const anularEvento = async (evento: EventoPartido) => {
    if (!partidoId || !partidoEnVivo) return;
    if (!confirm(`Anular ${evento.tipo === 'gol' ? 'gol' : 'tarjeta'} de ${evento.jugador}?`)) return;

    const esGol = evento.tipo === 'gol';
    const newLocal = esGol && evento.equipo === 'local' ? Math.max(0, marcadorLocal - 1) : marcadorLocal;
    const newVis = esGol && evento.equipo === 'visita' ? Math.max(0, marcadorVis - 1) : marcadorVis;

    try {
      if (esGol && evento.jugadorId) {
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
      if (esGol) {
        await setDoc(doc(db, 'partidos_en_vivo', 'actual'), {
          marcadorLocal: newLocal, marcadorVis: newVis,
          actualizadoEn: Date.now(),
        }, { merge: true });
        setMarcadorLocal(newLocal);
        setMarcadorVis(newVis);
      }
      setEventos(prev => prev.filter(e => e.id !== evento.id));
      setSuccess(`Anulado: ${evento.jugador}`);
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

  const getActionLabel = (a: EventAction) => {
    switch (a) {
      case 'gol': return 'Gol';
      case 'tarjeta_amarilla': return 'Amarilla';
      case 'tarjeta_roja': return 'Roja';
      case 'doble_amarilla': return '2Amarillas';
    }
  };

  const EventIcon = ({ tipo, className }: { tipo: string; className?: string }) => {
    if (tipo === 'gol') {
      return <img src="/icons/soccer.svg" alt="Gol" className={cn('h-4 w-4 flex-shrink-0', className)} />;
    }
    if (tipo === 'tarjeta_amarilla') {
      return <Square className={cn('h-3.5 w-3.5 flex-shrink-0 fill-yellow-400 text-yellow-400', className)} />;
    }
    return <Square className={cn('h-3.5 w-3.5 flex-shrink-0 fill-red-500 text-red-500', className)} />;
  };

  const cardCls = 'relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border border-white/10';
  const cardHeaderCls = 'px-5 py-3 border-b border-white/10 bg-white/5';
  const glowBg = (color: string) => ({ '--glow-color': color } as React.CSSProperties);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p>{error}</p></div>}
        {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><p>{success}</p></div>}

        {activeMatch ? (
          <>
            {/* Sporty scoreboard with glow */}
            <div className={cardCls} style={glowBg(localEquipo?.colorPrimario || '#E11D48')}>
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: localEquipo?.colorPrimario || '#E11D48' }} />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: visEquipo?.colorPrimario || '#0F172A' }} />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className={cardHeaderCls}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">En vivo</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono bg-white/5 text-white/60 border-white/10">{formatMinuto()}</Badge>
                </div>
              </div>
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-center gap-6 md:gap-10">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-24 h-24 flex items-center justify-center">
                      {localLogo ? <img src={localLogo} alt="" className="w-full h-full object-contain logo-img drop-shadow-lg" /> : <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center text-2xl font-black text-white border border-white/10">{localNombre.slice(0,2).toUpperCase()}</div>}
                    </div>
                    <p className="text-sm font-bold text-white text-center leading-tight drop-shadow">{localNombre}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input type="number" min={0} value={marcadorLocal} onChange={(e) => setMarcadorLocal(parseInt(e.target.value) || 0)} className="w-20 text-center text-4xl md:text-5xl font-black font-display h-16 bg-white/5 border-white/10 text-white focus:border-[var(--accent)]" />
                    <span className="text-3xl md:text-4xl font-black text-white/20">:</span>
                    <Input type="number" min={0} value={marcadorVis} onChange={(e) => setMarcadorVis(parseInt(e.target.value) || 0)} className="w-20 text-center text-4xl md:text-5xl font-black font-display h-16 bg-white/5 border-white/10 text-white focus:border-[var(--accent)]" />
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-24 h-24 flex items-center justify-center">
                      {visLogo ? <img src={visLogo} alt="" className="w-full h-full object-contain logo-img drop-shadow-lg" /> : <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center text-2xl font-black text-white border border-white/10">{visNombre.slice(0,2).toUpperCase()}</div>}
                    </div>
                    <p className="text-sm font-bold text-white text-center leading-tight drop-shadow">{visNombre}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons - sporty style */}
            <div className={cardCls}>
              <div className={cardHeaderCls}>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><Swords className="h-3.5 w-3.5 text-[var(--accent)]" /> Acciones</h3>
              </div>
              <div className="relative z-10 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'local', action: 'gol' })} className="bg-emerald-600 hover:bg-emerald-700 h-12 text-sm font-bold shadow-lg shadow-emerald-600/20 border border-emerald-500/30">
                      <img src="/icons/soccer.svg" alt="" className="h-5 w-5 mr-2" /> Gol
                    </Button>
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'visita', action: 'gol' })} variant="destructive" className="h-12 text-sm font-bold shadow-lg shadow-red-600/20 border border-red-500/30">
                      <img src="/icons/soccer.svg" alt="" className="h-5 w-5 mr-2" /> Gol
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'local', action: 'tarjeta_amarilla' })} variant="outline" size="sm" className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" /> A</Button>
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'local', action: 'tarjeta_roja' })} variant="outline" size="sm" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-red-500 text-red-500" /> R</Button>
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'local', action: 'doble_amarilla' })} variant="outline" size="sm" className="text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-orange-400 text-orange-400" /> 2A</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'visita', action: 'tarjeta_amarilla' })} variant="outline" size="sm" className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" /> A</Button>
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'visita', action: 'tarjeta_roja' })} variant="outline" size="sm" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-red-500 text-red-500" /> R</Button>
                    <Button onClick={() => setShowPlayerPicker({ equipo: 'visita', action: 'doble_amarilla' })} variant="outline" size="sm" className="text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-white/5"><Square className="h-3 w-3 mr-1 fill-orange-400 text-orange-400" /> 2A</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Picker Modal */}
            {showPlayerPicker && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPlayerPicker(null)}>
                <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl border border-white/10 w-full max-w-md max-h-[75vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {showPlayerPicker.action === 'gol' && <img src="/icons/soccer.svg" alt="" className="h-4 w-4" />}
                      {getActionLabel(showPlayerPicker.action)} - {showPlayerPicker.equipo === 'local' ? localNombre : visNombre}
                    </h3>
                    <button onClick={() => setShowPlayerPicker(null)} className="p-1 rounded hover:bg-white/10 text-white/60"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="overflow-y-auto max-h-[60vh] p-2 space-y-1 scrollbar-thin">
                    {(showPlayerPicker.equipo === 'local' ? jugadoresLocal : jugadoresVisita).length === 0 && (
                      <div className="text-center py-8 text-sm text-white/40">Sin jugadores cargados</div>
                    )}
                    {(showPlayerPicker.equipo === 'local' ? jugadoresLocal : jugadoresVisita).map((j) => (
                      <button key={j.id} onClick={() => registrarEvento(j, showPlayerPicker.equipo, showPlayerPicker.action)} className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/10">
                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white/40 overflow-hidden flex-shrink-0 border border-white/10">
                          {j.fotoBase64 ? <img src={j.fotoBase64} alt="" className="w-full h-full object-cover" /> : (j.numero || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{j.nombre} {j.apellido}</p>
                          <p className="text-[10px] text-white/40">#{j.numero || '--'} · {j.posicion}</p>
                        </div>
                        {showPlayerPicker.action === 'gol' && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-white/40">Goles</p>
                            <p className="text-sm font-bold text-emerald-400">{j.estadisticasTemp?.goles || 0}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Penales + Empate */}
            {crono.estadoTiempo === 'penales' && (
              <div className={cardCls}>
                <div className="relative z-10 p-4 space-y-3">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider text-center">Penales</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-sm font-bold text-white">{localNombre}: {crono.penalesLocal}</span>
                    <span className="text-xs text-white/30">-</span>
                    <span className="text-sm font-bold text-white">{visNombre}: {crono.penalesVisita}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={crono.golPenalLocal} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><img src="/icons/soccer.svg" alt="" className="h-3.5 w-3.5 mr-1" /> Gol</Button>
                    <Button onClick={crono.golPenalVisita} size="sm" variant="destructive"><img src="/icons/soccer.svg" alt="" className="h-3.5 w-3.5 mr-1" /> Gol</Button>
                  </div>
                </div>
              </div>
            )}

            {mostrarOpcionesEmpate && (
              <div className={cardCls}>
                <div className="relative z-10 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amber-400 text-center">Partido empatado. Elegir continuacion:</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleTE1} size="sm" className="bg-orange-600 hover:bg-orange-700"><Plus className="h-3.5 w-3.5 mr-1" /> Tiempo Extra</Button>
                    <Button onClick={handlePenales} size="sm" className="bg-red-600 hover:bg-red-700"><img src="/icons/soccer.svg" alt="" className="h-3.5 w-3.5 mr-1" /> Penales</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Save / Reset */}
            <div className="flex gap-3">
              <Button onClick={handleSubmit} loading={saving} size="full" className="font-bold">
                <Save className="h-4 w-4 mr-1.5" /> Guardar Marcador
              </Button>
              <Button variant="outline" size="icon" onClick={() => { setMarcadorLocal(0); setMarcadorVis(0); }} className="h-11 w-11 flex-shrink-0 border-white/10 text-white/50 hover:text-white"><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </>
        ) : (
          <div className={cardCls}>
            <div className="relative z-10 py-10 text-center">
              <Swords className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">No hay partido en vivo</p>
            </div>
          </div>
        )}

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
        <div className={cardCls}>
          <div className={cardHeaderCls}>
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Vista previa</h3>
          </div>
          <div className="relative z-10 p-4">
            <div className="rounded-[var(--radius-sm)] border-2 p-4 text-center" style={{ borderColor: activeMatch ? 'rgba(225,29,72,0.3)' : 'rgba(255,255,255,0.1)', backgroundColor: activeMatch ? 'rgba(225,29,72,0.05)' : 'rgba(255,255,255,0.03)' }}>
              {activeMatch ? (
                <><BadgeEnVivo size="sm" className="mb-2" />
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate max-w-[70px]">{localNombre}</span>
                    <span className="text-2xl font-black font-display text-white">{marcadorLocal}</span>
                    <span className="text-sm font-bold text-white/30">vs</span>
                    <span className="text-2xl font-black font-display text-white">{marcadorVis}</span>
                    <span className="text-sm font-bold text-white truncate max-w-[70px]">{visNombre}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono bg-white/5 text-white/50 border-white/10">{formatMinuto()}</Badge>
                </>
              ) : <p className="text-xs text-white/40 py-2">Sin partido activo</p>}
            </div>
          </div>
        </div>

        {/* Events Timeline */}
        {activeMatch && eventos.length > 0 && (
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><img src="/icons/soccer.svg" alt="" className="h-3.5 w-3.5" /> Eventos</h3>
            </div>
            <div className="relative z-10 p-3 max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
              {[...eventos].reverse().map((e, i) => {
                const eqLogo = e.equipo === 'local' ? localLogo : visLogo;
                const eqColor = e.equipo === 'local' ? localEquipo?.colorPrimario : visEquipo?.colorPrimario;
                return (
                  <div key={e.id || i} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] bg-white/5 text-xs group hover:bg-white/10 transition-colors">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {eqLogo ? <img src={eqLogo} alt="" className="w-4 h-4 object-contain logo-img" /> : <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: eqColor || '#64748B' }} />}
                    </div>
                    <EventIcon tipo={e.tipo} />
                    <span className="font-bold text-white">{e.jugador}</span>
                    <span className="text-white/30 ml-auto font-mono">{e.minuto}</span>
                    <button onClick={() => anularEvento(e)} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all flex-shrink-0"><Trash2 className="h-3 w-3" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next match */}
        {proximoPartido && (
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-400" /> Proximo Partido</h3>
            </div>
            <div className="relative z-10 p-4">
              <p className="text-xl font-black font-display text-amber-400 mb-3 text-center drop-shadow-lg">{countdown}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                {proxLocal?.logoBase64 && <img src={proxLocal.logoBase64} alt="" className="w-6 h-6 object-contain logo-img" />}
                <span className="text-sm font-bold text-white">{proxLocalNombre}</span>
                <span className="text-xs text-white/30">vs</span>
                <span className="text-sm font-bold text-white">{proxVisNombre}</span>
                {proxVis?.logoBase64 && <img src={proxVis.logoBase64} alt="" className="w-6 h-6 object-contain logo-img" />}
              </div>
              <p className="text-xs text-white/50 flex items-center justify-center gap-1"><MapPin className="h-3 w-3" /> {proximoPartido.estadio || 'Por definir'} · Jornada {proximoPartido.jornada}</p>
              <p className="text-xs text-white/30 mt-1 text-center">{new Date(proximoPartido.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
