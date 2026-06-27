'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquipos } from '@/hooks/use-equipos';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Swords, Plus, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partido, EstadoPartido } from '@/types/partido';

export default function AdminPartidosPage() {
  const { equipos } = useEquipos();
  const { deportes } = useDeportes();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deporteId, setDeporteId] = useState('');
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [jornada, setJornada] = useState('1');
  const [estadio, setEstadio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'partidos'), orderBy('fecha', 'desc'), limit(100)), (snap) => {
      setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partido)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const crearPartido = async () => {
    if (!deporteId || !localId || !visitaId || !fecha) return;
    setSaveLoading(true);
    const local = equipos.find((e) => e.id === localId);
    const visita = equipos.find((e) => e.id === visitaId);
    await addDoc(collection(db, 'partidos'), {
      deporteId,
      equipoLocalId: localId, equipoLocalNombre: local?.nombre || '',
      equipoVisitaId: visitaId, equipoVisitaNombre: visita?.nombre || '',
      fecha: new Date(fecha).getTime(),
      estado: 'programado',
      marcadorLocal: 0, marcadorVisita: 0,
      minuto: '0', jornada: parseInt(jornada) || 1,
      estadio: estadio || local?.estadio || '',
      eventos: [], actualizadoEn: Date.now(),
    });
    setShowForm(false);
    setSaveLoading(false);
  };

  const cambiarEstado = async (id: string, estado: EstadoPartido) => {
    await updateDoc(doc(db, 'partidos', id), { estado, actualizadoEn: Date.now() });
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar partido?')) await deleteDoc(doc(db, 'partidos', id)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black font-display text-[var(--text)]">Partidos</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Partido</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><h2 className="font-bold text-[var(--text)]">Nuevo Partido</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Deporte</Label><Select value={deporteId} onValueChange={setDeporteId}><SelectTrigger><SelectValue placeholder="Deporte" /></SelectTrigger><SelectContent>{deportes.map((d) => <SelectItem key={d.id} value={d.id}>{d.icono} {d.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Jornada</Label><Input type="number" value={jornada} onChange={(e) => setJornada(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Equipo Local</Label><Select value={localId} onValueChange={setLocalId}><SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger><SelectContent>{equipos.filter((e) => !deporteId || e.deporteId === deporteId).map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Equipo Visita</Label><Select value={visitaId} onValueChange={setVisitaId}><SelectTrigger><SelectValue placeholder="Visita" /></SelectTrigger><SelectContent>{equipos.filter((e) => !deporteId || e.deporteId === deporteId).map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Fecha y Hora</Label><Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} className="[color-scheme:var(--color-scheme)]" /></div>
              <div className="space-y-2"><Label>Estadio</Label><Input value={estadio} onChange={(e) => setEstadio(e.target.value)} /></div>
            </div>
            <Button onClick={crearPartido} loading={saveLoading}><Save className="h-4 w-4 mr-2" /> Guardar Partido</Button>
          </CardContent>
        </Card>
      )}

      {loading ? <Loader /> : !partidos.length ? <EmptyState title="Sin partidos" /> : (
        <div className="space-y-2">
          {partidos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <span className={cn('text-xs font-bold text-[var(--accent)] font-mono w-10', p.estado === 'finalizado' && 'text-[var(--text-muted)]')}>{p.jornada}</span>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-[var(--text)] truncate">{p.equipoLocalNombre}</span>
                <span className="font-black text-[var(--accent)]">{p.marcadorLocal}</span>
                <span className="text-[var(--text-muted)]">vs</span>
                <span className="font-black text-[var(--accent)]">{p.marcadorVisita}</span>
                <span className="text-sm font-medium text-[var(--text)] truncate">{p.equipoVisitaNombre}</span>
              </div>
              <Badge variant={p.estado === 'en_vivo' ? 'live' : p.estado === 'finalizado' ? 'success' : 'secondary'} className="text-[10px]">
                {p.estado === 'en_vivo' ? 'EN VIVO' : p.estado === 'finalizado' ? 'FIN' : p.estado === 'programado' ? 'PROG' : 'SUSP'}
              </Badge>
              {p.estado === 'programado' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => cambiarEstado(p.id, 'en_vivo')}>Iniciar</Button>}
              {p.estado === 'en_vivo' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => cambiarEstado(p.id, 'finalizado')}>Finalizar</Button>}
              <Button variant="ghost" size="icon" onClick={() => eliminar(p.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
