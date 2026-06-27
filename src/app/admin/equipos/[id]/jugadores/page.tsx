'use client';

import { useState, useEffect, use } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JugadorForm } from '@/components/admin/jugador-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { MetricCard } from '@/components/admin/metric-card';
import { Users, Plus, Pencil, Trash2, ArrowLeft, ExternalLink, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Jugador } from '@/types/jugador';

export default function AdminEquipoJugadoresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Jugador | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'jugadores'), where('equipoId', '==', id));
    const unsub = onSnapshot(q, (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Jugador)));
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const eliminar = async (jugadorId: string) => { if (confirm('¿Eliminar jugador?')) await deleteDoc(doc(db, 'jugadores', jugadorId)); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/equipos" className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
          <div><h2 className="text-lg font-bold text-[var(--text)]">Plantilla del Equipo</h2><p className="text-sm text-[var(--text-secondary)]">{jugadores.length} jugadores</p></div>
        </div>
        <Dialog open={showCreate && !editing} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Añadir Jugador</Button></DialogTrigger>
          <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nuevo Jugador</DialogTitle></DialogHeader><JugadorForm equipoId={id} onClose={() => setShowCreate(false)} /></DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Plantilla" value={jugadores.length} icon={Users} gradient="from-purple-500 to-purple-600" />
        <MetricCard label="Activos" value={jugadores.filter(j=>j.activo).length} icon={CheckCircle} gradient="from-emerald-500 to-emerald-600" />
        <MetricCard label="Goles totales" value={jugadores.reduce((s,j)=>s+(j.estadisticasTemp?.goles||0),0)} icon={TrendingUp} gradient="from-orange-500 to-orange-600" />
      </div>

      {loading ? <Loader /> : !jugadores.length ? <EmptyState title="Sin jugadores en este equipo" /> : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left w-12">#</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Nombre</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Posición</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center hidden sm:table-cell">Goles</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Estado</th>
              <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
            </tr></thead>
            <tbody>
              {jugadores.sort((a, b) => (a.numero || 0) - (b.numero || 0)).map((j) => (
                <tr key={j.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3 text-center font-bold text-[var(--accent)] font-mono text-sm">{j.numero}</td>
                  <td className="p-3"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] overflow-hidden">{j.fotoBase64 ? <img src={j.fotoBase64} alt="" className="w-full h-full object-cover" /> : `${j.nombre[0]}${j.apellido[0]}`}</div><span className="text-sm font-medium text-[var(--text)]">{j.nombre} {j.apellido}</span></div></td>
                  <td className="p-3 text-sm text-[var(--text-secondary)]">{j.posicion || '—'}</td>
                  <td className="p-3 text-center font-bold text-[var(--accent)] hidden sm:table-cell">{j.estadisticasTemp?.goles || 0}</td>
                  <td className="p-3 text-center"><StatusBadge status={j.activo ? 'success' : 'error'} label={j.activo ? 'Activo' : 'Inactivo'} /></td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(j); setShowCreate(true); }} title="Editar"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/jugadores/${j.id}`, '_blank')} title="Ver perfil"><ExternalLink className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => eliminar(j.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate && !!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setShowCreate(false); }}}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Editar Jugador</DialogTitle></DialogHeader>{editing && <JugadorForm jugador={editing} onClose={() => { setEditing(null); setShowCreate(false); }} />}</DialogContent>
      </Dialog>
    </div>
  );
}
