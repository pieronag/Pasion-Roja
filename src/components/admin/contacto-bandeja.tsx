'use client';

import { useContacto } from '@/hooks/use-contacto';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/shared/scroll-area';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageCircle, Mail, Clock } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Bandeja de Mensajes</h2><span className="text-xs text-[var(--text-muted)] ml-auto">{mensajes.filter((m) => !m.leido).length} no leídos</span></div>
      </CardHeader>
      <CardContent>
        {mensajes.length ? (
          <div className="space-y-2">
            {mensajes.map((m) => (
              <div key={m.id} onClick={() => !m.leido && marcarLeido(m.id, true)} className={cn('p-3 rounded-lg border cursor-pointer transition-colors', m.leido ? 'border-[var(--border)] bg-[var(--bg-card)]' : 'border-[var(--accent)]/30 bg-[var(--accent-light)]')}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--text)] text-sm">{m.nombre}</p>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(m.timestamp)}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{m.email}{m.telefono ? ` · ${m.telefono}` : ''}</p>
                <p className="text-sm text-[var(--text)] mt-1">{m.mensaje}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState title="Sin mensajes" icon={<Mail className="h-8 w-8" />} />}
      </CardContent>
    </Card>
  );
}
