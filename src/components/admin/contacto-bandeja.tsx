'use client';

import { useContacto } from '@/hooks/use-contacto';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageCircle, Mail, Clock, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export function ContactoBandeja() {
  const { mensajes, loading } = useContacto();

  const marcarLeido = async (id: string, leido: boolean) => {
    await updateDoc(doc(db, 'contacto', id), { leido });
  };

  if (loading) return <Loader />;

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Bandeja de Mensajes</h2></div>
          <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-full">{mensajes.filter((m) => !m.leido).length} no leídos</span>
        </div>
      </CardHeader>
      <CardContent>
        {mensajes.length ? (
          <div className="space-y-2">
            {mensajes.map((m) => (
              <div key={m.id} onClick={() => !m.leido && marcarLeido(m.id, true)} className={cn('p-3 rounded-[var(--radius-sm)] border cursor-pointer transition-all', m.leido ? 'border-[var(--border)] bg-[var(--bg-card)]' : 'border-[var(--accent)]/30 bg-[var(--accent)]/5')}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--text)]">{m.nombre}</p>
                    {!m.leido && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(m.timestamp)}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">{m.email}{m.telefono ? ` · ${m.telefono}` : ''}</p>
                <p className="text-sm text-[var(--text)]">{m.mensaje}</p>
                {m.leido && <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1"><CheckCheck className="h-3 w-3" /> Leído</span>}
              </div>
            ))}
          </div>
        ) : <EmptyState title="Sin mensajes" icon={<Mail className="h-8 w-8" />} />}
      </CardContent>
    </Card>
  );
}
