'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Loader } from '@/components/shared/loader';
import { History, Clock, User, Database } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { AdminLog } from '@/types/admin-log';

export function HistorialCambios() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-600" />
      <CardHeader>
        <div className="flex items-center gap-2"><History className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Historial de Cambios</h2></div>
      </CardHeader>
      <CardContent>
        {loading ? <Loader size="sm" /> : !logs.length ? (
          <EmptyState title="Sin registros" description="Los cambios aparecerán aquí" icon={<History className="h-8 w-8" />} />
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Database className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{log.accion}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{log.coleccion}/{log.documentId}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 justify-end"><User className="h-3 w-3" />{log.adminEmail}</p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 justify-end mt-0.5"><Clock className="h-3 w-3" />{formatRelativeTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
