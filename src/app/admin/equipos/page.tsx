'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EquipoForm } from '@/components/admin/equipo-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, Plus, Pencil, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import type { Equipo } from '@/types/equipo';

export default function AdminEquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Equipo | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      setEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'equipos', id)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black font-display text-[var(--text)]">Equipos</h1>
        <Dialog>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Equipo</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Nuevo Equipo</h2></DialogHeader><EquipoForm /></DialogContent>
        </Dialog>
      </div>

      {loading ? <Loader /> : !equipos.length ? <EmptyState title="Sin equipos" /> : (
        <div className="grid grid-cols-1 gap-2">
          {equipos.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: e.colorPrimario || '#E11D48' }}>
                {e.logoBase64 ? <img src={e.logoBase64} alt="" className="w-8 h-8 object-contain" /> : e.nombreCorto?.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0"><p className="font-medium text-[var(--text)] truncate">{e.nombre}</p><p className="text-xs text-[var(--text-secondary)]">{e.ciudad} · {e.estadio}</p></div>
              <Link href={`/admin/equipos/${e.id}/jugadores`}><Button variant="ghost" size="sm"><Users className="h-4 w-4" /></Button></Link>
              <Button variant="ghost" size="icon" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => eliminar(e.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><h2 className="text-lg font-bold text-[var(--text)]">Editar Equipo</h2></DialogHeader>{editing && <EquipoForm equipo={editing} />}</DialogContent>
      </Dialog>
    </div>
  );
}
