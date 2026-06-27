'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NoticiaForm } from '@/components/admin/noticia-form';
import { SportIcon } from '@/components/shared/sport-icons';
import { useDeportes } from '@/hooks/use-deportes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogBody } from '@/components/ui/dialog';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { MetricCard } from '@/components/admin/metric-card';
import { Newspaper, Plus, Trash2, Search, CalendarDays, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Noticia } from '@/types/noticia';

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'noticias'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        setNoticias(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Noticia)));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = noticias.filter((n) =>
    n.titulo?.toLowerCase().includes(search.toLowerCase())
  );

  const eliminar = async (id: string) => {
    if (confirm('¿Eliminar esta noticia?')) await deleteDoc(doc(db, 'noticias', id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Noticias</h2>
          <p className="text-sm text-[var(--text-secondary)]">{noticias.length} noticias publicadas</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Nueva Noticia</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nueva Noticia</DialogTitle></DialogHeader>
            <DialogBody>
              <NoticiaForm onClose={() => setShowForm(false)} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Noticias" value={noticias.length} icon={Newspaper} gradient="from-purple-500 to-purple-600" />
        <MetricCard label="Publicadas" value={noticias.filter(n=>n.publicado).length} icon={Newspaper} gradient="from-emerald-500 to-emerald-600" />
        <MetricCard label="Borradores" value={noticias.filter(n=>!n.publicado).length} icon={Newspaper} gradient="from-amber-500 to-amber-600" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar noticia..."
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? <Loader /> : !filtered.length ? (
        <EmptyState title={search ? 'Sin resultados' : 'Sin noticias'} />
      ) : (
        <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left">Título</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Categoría</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-left hidden md:table-cell">Fecha</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-center">Estado</th>
                <th className="p-3 text-xs font-semibold text-[var(--text-muted)] uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {n.miniBase64 ? (
                        <img src={n.miniBase64} alt="" className="w-10 h-7 rounded-[var(--radius-xs)] object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-7 rounded-[var(--radius-xs)] bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                          <Newspaper className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-[var(--text)] truncate max-w-[300px]">
                        {n.titulo}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell capitalize">{n.categoria}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <StatusBadge
                      status={n.publicado ? 'success' : 'warning'}
                      label={n.publicado ? 'Publicado' : 'Borrador'}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`/noticias/${n.id}`, '_blank')}
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => eliminar(n.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
