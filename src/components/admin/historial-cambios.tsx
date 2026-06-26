'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/shared/scroll-area';
import { EmptyState } from '@/components/shared/empty-state';
import { Loader } from '@/components/shared/loader';
import { History, Clock } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-rojo" />
          <h2 className="text-lg font-bold text-white">Historial de Cambios</h2>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader size="sm" />
        ) : logs.length === 0 ? (
          <EmptyState title="Sin registros" description="Los cambios aparecerán aquí" icon={<History className="h-8 w-8" />} />
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-pizarra-claro/30 animate-slide-up">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{log.accion}</p>
                    <p className="text-xs text-gray-500">{log.coleccion}/{log.documentId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{log.adminEmail}</p>
                    <p className="text-[10px] text-gray-600 flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
